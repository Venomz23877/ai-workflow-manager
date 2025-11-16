import Database from 'better-sqlite3'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, it } from 'vitest'
import { SchedulerService } from '../core/scheduler/schedulerService'
import { SchedulerRunner } from '../core/scheduler/schedulerRunner'
import { ConfigService } from '../core/config/service'
import { NotificationPreferenceService } from '../core/notifications/notificationPreferenceService'
import { LoggingService } from '../core/logging/loggingService'
import { WorkflowRuntime } from '../core/workflows/workflowRuntime'
import { WorkflowDatabase } from '../core/database'
import { ValidationService } from '../core/workflows/validationService'
import { RetentionService } from '../core/ops/retentionService'

const createTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'scheduler-runner-'))

describe('SchedulerRunner', () => {
  const cleanupPaths: string[] = []

  afterEach(() => {
    cleanupPaths.splice(0).forEach((dir) => {
      fs.rmSync(dir, { recursive: true, force: true })
    })
    delete process.env.AIWM_CONFIG_PATH
  })

  it('starts workflow runtime instances for due schedules', async () => {
    const tempDir = createTempDir()
    cleanupPaths.push(tempDir)
    const dbPath = path.join(tempDir, 'app.db')
    const configPath = path.join(tempDir, 'config.json')
    process.env.AIWM_CONFIG_PATH = configPath
    const configService = new ConfigService({ filePath: configPath })
    const notificationPrefs = new NotificationPreferenceService(configService)
    const loggingService = new LoggingService(tempDir)
    const schedulerService = new SchedulerService(notificationPrefs, loggingService, dbPath)
    const workflowDb = new WorkflowDatabase(dbPath)
    const validationService = new ValidationService()
    const workflowRuntime = new WorkflowRuntime(validationService)

    const workflow = workflowDb.createWorkflow('Scheduled Workflow', 'Runs on a timer')
    workflowDb.updateWorkflow(workflow.id, { status: 'active' })
    workflowDb.createWorkflowVersion(workflow.id, 1, {
      nodes: [
        {
          id: 'start',
          type: 'start',
          label: 'Start',
          entryActions: [],
          exitActions: []
        }
      ],
      transitions: []
    })
    const schedule = schedulerService.addSchedule(workflow.id, '* * * * *', { timezone: 'UTC' })
    const db = new Database(dbPath)
    db.prepare('UPDATE workflow_schedules SET next_run_at = ? WHERE id = ?').run(
      new Date(Date.now() - 60_000).toISOString(),
      schedule.id
    )
    db.close()

    const retentionService = new RetentionService(configService, loggingService, tempDir)

    const runner = new SchedulerRunner(
      schedulerService,
      workflowDb,
      workflowRuntime,
      loggingService,
      notificationPrefs,
      retentionService,
      { intervalMs: 10_000 }
    )

    await runner.runOnce()
    schedulerService.close()
    workflowDb.close()
    const instances = workflowRuntime.listInstances()
    expect(instances).toHaveLength(1)
    expect(instances[0].status).toBe('completed')
  })
})
