import Database from 'better-sqlite3'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { SchedulerService } from '../core/scheduler/schedulerService'
import { NotificationPreferenceService } from '../core/notifications/notificationPreferenceService'
import { ConfigService } from '../core/config/service'
import { LoggingService } from '../core/logging/loggingService'

const createScheduler = () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scheduler-service-'))
  process.env.AIWM_CONFIG_PATH = path.join(tempDir, 'config.json')
  const configService = new ConfigService()
  const notificationPrefs = new NotificationPreferenceService(configService)
  const loggingService = new LoggingService(tempDir)
  const dbPath = path.join(tempDir, 'app.db')
  const scheduler = new SchedulerService(notificationPrefs, loggingService, dbPath)
  return {
    tempDir,
    scheduler,
    dbPath,
    cleanup: () => {
      scheduler.close()
      fs.rmSync(tempDir, { recursive: true, force: true })
      delete process.env.AIWM_CONFIG_PATH
    }
  }
}

describe('SchedulerService', () => {
  it('adds schedules with timezone metadata', () => {
    const { scheduler, cleanup } = createScheduler()
    const schedule = scheduler.addSchedule(1, '*/5 * * * *', { timezone: 'America/New_York' })
    expect(schedule.timezone).toBe('America/New_York')
    expect(scheduler.list()).toHaveLength(1)
    cleanup()
  })

  it('rejects invalid cron expressions', () => {
    const { scheduler, cleanup } = createScheduler()
    expect(() => scheduler.addSchedule(1, 'invalid-cron')).toThrow(/Invalid cron expression/)
    cleanup()
  })

  it('runs due schedules and advances next run', async () => {
    const { scheduler, dbPath, cleanup } = createScheduler()
    const schedule = scheduler.addSchedule(42, '* * * * *')
    const db = new Database(dbPath)
    const past = new Date(Date.now() - 60_000).toISOString()
    db.prepare('UPDATE workflow_schedules SET next_run_at = ? WHERE id = ?').run(past, schedule.id)
    const executions: number[] = []
    await scheduler.runDueSchedules(async (schedule) => {
      executions.push(schedule.workflowId)
    })
    const updated = scheduler.list().find((item) => item.id === schedule.id)!
    expect(executions).toEqual([42])
    expect(updated.lastRunAt).toBeTruthy()
    expect(updated.nextRunAt && updated.nextRunAt > past).toBe(true)
    db.close()
    cleanup()
  })
})
