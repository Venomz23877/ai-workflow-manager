import { WorkflowDatabase } from '../database'
import { LoggingService } from '../logging/loggingService'
import { NotificationPreferenceService } from '../notifications/notificationPreferenceService'
import { WorkflowStatus } from '../domain/workflows'
import { WorkflowRuntime } from '../workflows/workflowRuntime'
import { WorkflowDraft, WorkflowDraftContent } from '../workflows/workflowTypes'
import { ScheduleRecord, SchedulerService } from './schedulerService'
import { RetentionService } from '../ops/retentionService'

const DEFAULT_INTERVAL_MS = 60_000

export class SchedulerRunner {
  private timer?: NodeJS.Timeout
  private readonly intervalMs: number

  constructor(
    private scheduler: SchedulerService,
    private workflowDb: WorkflowDatabase,
    private workflowRuntime: WorkflowRuntime,
    private loggingService: LoggingService,
    private notificationPrefs: NotificationPreferenceService,
    private retentionService?: RetentionService,
    options?: { intervalMs?: number }
  ) {
    this.intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL_MS
  }

  start() {
    this.stop()
    this.timer = setInterval(() => {
      this.runOnce().catch((error) => {
        this.loggingService.log({
          category: 'scheduler',
          action: 'runner-error',
          metadata: { error: error instanceof Error ? error.message : String(error) }
        })
      })
    }, this.intervalMs)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  }

  async runOnce() {
    await this.scheduler.runDueSchedules(async (schedule) => {
      const workflow = this.workflowDb.getWorkflow(schedule.workflowId)
      if (!workflow) {
        this.loggingService.log({
          category: 'scheduler',
          action: 'workflow-missing',
          metadata: { scheduleId: schedule.id, workflowId: schedule.workflowId }
        })
        return
      }

      const versions = this.workflowDb.listWorkflowVersions(schedule.workflowId)
      const latest = versions[0]
      if (!latest) {
        this.loggingService.log({
          category: 'scheduler',
          action: 'workflow-version-missing',
          metadata: { scheduleId: schedule.id, workflowId: workflow.id }
        })
        return
      }

      const content = this.parseDefinition(latest.definition_json)
      const draft: WorkflowDraft = {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description ?? '',
        status: (workflow.status as WorkflowStatus) ?? 'draft',
        version: latest.version,
        createdAt: workflow.created_at,
        updatedAt: workflow.updated_at,
        nodes: content.nodes,
        transitions: content.transitions
      }

      try {
        const instance = this.workflowRuntime.start(draft)
        this.loggingService.log({
          category: 'scheduler',
          action: 'run-started',
          metadata: {
            scheduleId: schedule.id,
            workflowId: workflow.id,
            runtimeInstanceId: instance.id
          }
        })
        this.sendNotification(schedule, workflow.name, 'started')
        this.workflowRuntime.complete(instance.id)
        this.loggingService.log({
          category: 'scheduler',
          action: 'run-completed',
          metadata: {
            scheduleId: schedule.id,
            workflowId: workflow.id,
            runtimeInstanceId: instance.id
          }
        })
      } catch (error) {
        this.loggingService.log({
          category: 'scheduler',
          action: 'runtime-error',
          metadata: {
            scheduleId: schedule.id,
            workflowId: workflow.id,
            error: error instanceof Error ? error.message : String(error)
          }
        })
        this.sendNotification(schedule, workflow.name, 'failed')
      }
    })
    await this.retentionService?.enforce()
  }

  private parseDefinition(payload: string): WorkflowDraftContent {
    try {
      const parsed = JSON.parse(payload ?? '{}')
      return {
        nodes: parsed.nodes ?? [],
        transitions: parsed.transitions ?? []
      }
    } catch {
      return {
        nodes: [],
        transitions: []
      }
    }
  }

  private sendNotification(
    schedule: ScheduleRecord,
    workflowName: string,
    event: 'started' | 'failed'
  ) {
    const prefs = this.notificationPrefs.getPreferences()
    if (this.isWithinQuietHours(prefs.quietHours.start, prefs.quietHours.end, new Date())) {
      this.loggingService.log({
        category: 'notifications',
        action: 'scheduler-muted',
        metadata: {
          scheduleId: schedule.id,
          workflowId: schedule.workflowId,
          workflowName,
          event,
          quietHours: prefs.quietHours
        }
      })
      return
    }

    this.loggingService.log({
      category: 'notifications',
      action: 'scheduler-event',
      metadata: {
        scheduleId: schedule.id,
        workflowId: schedule.workflowId,
        workflowName,
        event,
        channels: prefs.channels
      }
    })
  }

  private isWithinQuietHours(start: string, end: string, now: Date): boolean {
    const minutes = now.getHours() * 60 + now.getMinutes()
    const startMinutes = this.toMinutes(start)
    const endMinutes = this.toMinutes(end)
    if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) {
      return false
    }
    if (startMinutes === endMinutes) {
      return false
    }
    if (startMinutes < endMinutes) {
      return minutes >= startMinutes && minutes < endMinutes
    }
    return minutes >= startMinutes || minutes < endMinutes
  }

  private toMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map((part) => parseInt(part, 10))
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return Number.NaN
    }
    return hours * 60 + minutes
  }
}
