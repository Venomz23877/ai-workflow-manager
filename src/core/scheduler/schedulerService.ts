import Database from 'better-sqlite3'
import { getAppDatabasePath } from '../appPaths'
import { NotificationPreferenceService } from '../notifications/notificationPreferenceService'
import { LoggingService } from '../logging/loggingService'
import { computeNextRunIso, validateCron } from './cron'

export interface ScheduleRecord {
  id: number
  workflowId: number
  cron: string
  timezone: string | null
  profile?: string | null
  status: 'active' | 'paused'
  lastRunAt?: string | null
  nextRunAt?: string | null
  createdAt?: string | null
}

export interface AddScheduleOptions {
  timezone?: string
  profile?: string
}

export class SchedulerService {
  private db: Database.Database

  constructor(
    private notificationPrefs: NotificationPreferenceService,
    private loggingService: LoggingService,
    dbPath: string = getAppDatabasePath()
  ) {
    this.db = new Database(dbPath)
    this.ensureTable()
  }

  private ensureTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflow_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workflow_id INTEGER NOT NULL,
        cron TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        last_run_at DATETIME,
        next_run_at DATETIME
      )
    `)
    this.ensureColumn('timezone', "TEXT DEFAULT 'UTC'")
    this.ensureColumn('profile', 'TEXT')
    this.ensureColumn('created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP')
  }

  addSchedule(workflowId: number, cron: string, options: AddScheduleOptions = {}): ScheduleRecord {
    const timezone = options.timezone ?? 'UTC'
    validateCron(cron, { timezone })

    const stmt = this.db.prepare(`
      INSERT INTO workflow_schedules (workflow_id, cron, timezone, profile, next_run_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    const nextRunAt = this.computeNextRun(cron, timezone)
    const info = stmt.run(workflowId, cron, timezone, options.profile ?? null, nextRunAt)
    const record = this.get(info.lastInsertRowid as number)!
    this.loggingService.log({
      category: 'scheduler',
      action: 'add',
      metadata: { workflowId, scheduleId: record.id, timezone }
    })
    return record
  }

  list(): ScheduleRecord[] {
    const stmt = this.db.prepare(
      `SELECT id,
              workflow_id as workflow_id,
              cron,
              timezone,
              profile,
              status,
              last_run_at as last_run_at,
              next_run_at as next_run_at,
              created_at as created_at
         FROM workflow_schedules
        ORDER BY id DESC`
    )
    return stmt.all().map((row) => this.mapRecord(row))
  }

  pause(id: number) {
    this.updateStatus(id, 'paused')
  }

  resume(id: number) {
    this.updateStatus(id, 'active')
  }

  delete(id: number) {
    const stmt = this.db.prepare(`DELETE FROM workflow_schedules WHERE id = ?`)
    stmt.run(id)
    this.loggingService.log({
      category: 'scheduler',
      action: 'delete',
      metadata: { scheduleId: id }
    })
  }

  async runDueSchedules(runFn: (schedule: ScheduleRecord) => Promise<void>) {
    const now = new Date().toISOString()
    const stmt = this.db.prepare(
      `SELECT * FROM workflow_schedules WHERE status = 'active' AND next_run_at <= ?`
    )
    const due = stmt.all(now).map((row: any) => this.mapRecord(row))
    await Promise.all(
      due.map(async (schedule) => {
        try {
          await runFn(schedule)
          const update = this.db.prepare(
            `UPDATE workflow_schedules SET last_run_at = ?, next_run_at = ? WHERE id = ?`
          )
          update.run(
            new Date().toISOString(),
            this.computeNextRun(schedule.cron, schedule.timezone ?? 'UTC'),
            schedule.id
          )
        } catch (error) {
          this.loggingService.log({
            category: 'scheduler',
            action: 'run-error',
            metadata: {
              scheduleId: schedule.id,
              workflowId: schedule.workflowId,
              error: error instanceof Error ? error.message : String(error)
            }
          })
        }
      })
    )
  }

  close() {
    this.db.close()
  }

  private updateStatus(id: number, status: 'active' | 'paused') {
    const stmt = this.db.prepare(`UPDATE workflow_schedules SET status = ? WHERE id = ?`)
    stmt.run(status, id)
  }

  private get(id: number): ScheduleRecord | undefined {
    const stmt = this.db.prepare(
      `SELECT id,
              workflow_id as workflow_id,
              cron,
              timezone,
              profile,
              status,
              last_run_at as last_run_at,
              next_run_at as next_run_at,
              created_at as created_at
         FROM workflow_schedules
        WHERE id = ?`
    )
    const row = stmt.get(id)
    return row ? this.mapRecord(row) : undefined
  }

  private computeNextRun(cron: string, timezone: string) {
    return computeNextRunIso(cron, { timezone })
  }

  private ensureColumn(column: string, definition: string) {
    const columns = this.db.prepare(`PRAGMA table_info(workflow_schedules)`).all()
    if (!columns.some((col: any) => col.name === column)) {
      this.db.exec(`ALTER TABLE workflow_schedules ADD COLUMN ${column} ${definition}`)
    }
  }

  private mapRecord(row: any): ScheduleRecord {
    return {
      id: row.id,
      workflowId: row.workflow_id,
      cron: row.cron,
      timezone: row.timezone,
      profile: row.profile,
      status: row.status,
      lastRunAt: row.last_run_at,
      nextRunAt: row.next_run_at,
      createdAt: row.created_at
    }
  }
}
