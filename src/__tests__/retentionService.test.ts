import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, it } from 'vitest'
import { ConfigService } from '../core/config/service'
import { LoggingService } from '../core/logging/loggingService'
import { RetentionService } from '../core/ops/retentionService'

const createTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'retention-service-'))

const touchFile = (filePath: string, ageDays: number) => {
  fs.writeFileSync(filePath, 'data', 'utf-8')
  const time = new Date(Date.now() - ageDays * 24 * 60 * 60 * 1000)
  fs.utimesSync(filePath, time, time)
}

describe('RetentionService', () => {
  const tempDirs: string[] = []

  afterEach(() => {
    tempDirs.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true, force: true }))
    delete process.env.AIWM_CONFIG_PATH
  })

  it('removes files older than retention window', async () => {
    const baseDir = createTempDir()
    tempDirs.push(baseDir)
    const configPath = path.join(baseDir, 'config.json')
    process.env.AIWM_CONFIG_PATH = configPath
    const configService = new ConfigService({ filePath: configPath })
    const loggingService = new LoggingService(baseDir)
    await configService.set('retention.logs.days', 5)
    const logDir = path.join(baseDir, 'logs')
    fs.mkdirSync(logDir, { recursive: true })
    const oldLog = path.join(logDir, 'app-old.log')
    touchFile(oldLog, 10)
    const recentLog = path.join(logDir, 'app-new.log')
    touchFile(recentLog, 1)
    const retentionService = new RetentionService(configService, loggingService, baseDir)

    await retentionService.enforce()
    expect(fs.existsSync(oldLog)).toBe(false)
    expect(fs.existsSync(recentLog)).toBe(true)
  })

  it('keeps only the newest backups based on count', async () => {
    const baseDir = createTempDir()
    tempDirs.push(baseDir)
    const configPath = path.join(baseDir, 'config.json')
    process.env.AIWM_CONFIG_PATH = configPath
    const configService = new ConfigService({ filePath: configPath })
    const loggingService = new LoggingService(baseDir)
    await configService.set('retention.backups.keep', 2)
    const backupsDir = path.join(baseDir, 'backups')
    fs.mkdirSync(backupsDir, { recursive: true })
    const files = ['backup-1.sqlite', 'backup-2.sqlite', 'backup-3.sqlite']
    files.forEach((file, index) => {
      const fullPath = path.join(backupsDir, file)
      fs.writeFileSync(fullPath, 'db', 'utf-8')
      const time = new Date(Date.now() - index * 1000)
      fs.utimesSync(fullPath, time, time)
    })

    const retentionService = new RetentionService(configService, loggingService, baseDir)
    await retentionService.enforce()
    const remaining = fs.readdirSync(backupsDir).filter((file) => file.endsWith('.sqlite'))
    expect(remaining).toHaveLength(2)
    expect(remaining).toContain('backup-1.sqlite')
    expect(remaining).toContain('backup-2.sqlite')
  })
})
