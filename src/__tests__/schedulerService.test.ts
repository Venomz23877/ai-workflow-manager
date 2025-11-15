import fs from 'fs'
import os from 'os'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { SchedulerService } from '../core/scheduler/schedulerService'
import { NotificationPreferenceService } from '../core/notifications/notificationPreferenceService'
import { ConfigService } from '../core/config/service'
import { LoggingService } from '../core/logging/loggingService'

describe('SchedulerService', () => {
  it('adds and lists schedules', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scheduler-service-'))
    process.env.AIWM_CONFIG_PATH = path.join(tempDir, 'config.json')
    const configService = new ConfigService()
    const notificationPrefs = new NotificationPreferenceService(configService)
    const loggingService = new LoggingService(tempDir)
    const scheduler = new SchedulerService(notificationPrefs, loggingService, path.join(tempDir, 'app.db'))

    scheduler.addSchedule(1, '* * * * *')
    const schedules = scheduler.list()
    expect(schedules.length).toBeGreaterThan(0)

    scheduler.close()
    fs.rmSync(tempDir, { recursive: true, force: true })
    delete process.env.AIWM_CONFIG_PATH
  })
})

