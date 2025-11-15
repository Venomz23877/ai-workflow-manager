import Database from 'better-sqlite3'
import { getAppDatabasePath } from '../appPaths'
import { NotificationPreferenceService } from '../notifications/notificationPreferenceService'
import { LoggingService } from '../logging/loggingService'

export interface ScheduleRecord {
  id: number
  workflowId: number
  cron: string
  status: 'active' | 'paused'
  lastRunAt?: string | null
  nextRunAt?: string | null
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
  }

  addSchedule(workflowId: number, cron: string): ScheduleRecord {
    const stmt = this.db.prepare(`
      INSERT INTO workflow_schedules (workflow_id, cron, next_run_at)
      VALUES (?, ?, ?)
    `)
    const nextRunAt = this.computeNextRun()
    const info = stmt.run(workflowId, cron, nextRunAt)
    const record = this.get(info.lastInsertRowid as number)!
    this.loggingService.log({
      category: 'scheduler',
      action: 'add',
      metadata: { workflowId, scheduleId: record.id }
    })
    return record
  }

  list(): ScheduleRecord[] {
    const stmt = this.db.prepare(`SELECT * FROM workflow_schedules ORDER BY id DESC`)
    return stmt.all() as ScheduleRecord[]
  }

  pause(id: number) {
    this.updateStatus(id, 'paused')
  }

  resume(id: number) {
    this.updateStatus(id, 'active')
  }

  runDueSchedules(runFn: (workflowId: number) => Promise<void>) {
    const now = new Date().toISOString()
    const stmt = this.db.prepare(
      `SELECT * FROM workflow_schedules WHERE status = 'active' AND next_run_at <= ?`
    )
    const due = stmt.all(now) as ScheduleRecord[]
    due.forEach(async (schedule) => {
      await runFn(schedule.workflowId)
      const update = this.db.prepare(
        `UPDATE workflow_schedules SET last_run_at = ?, next_run_at = ? WHERE id = ?`
      )
      update.run(new Date().toISOString(), this.computeNextRun(), schedule.id)
    })
  }

  close() {
    this.db.close()
  }

  private updateStatus(id: number, status: 'active' | 'paused') {
    const stmt = this.db.prepare(`UPDATE workflow_schedules SET status = ? WHERE id = ?`)
    stmt.run(status, id)
  }

  private get(id: number): ScheduleRecord | undefined {
    const stmt = this.db.prepare('SELECT * FROM workflow_schedules WHERE id = ?')
    return stmt.get(id) as ScheduleRecord | undefined
  }

  private computeNextRun(): string {
    // Placeholder: run every hour
    const next = new Date()
    next.setHours(next.getHours() + 1)
    return next.toISOString()
  }
}

