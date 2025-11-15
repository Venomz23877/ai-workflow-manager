import fs from 'fs'
import path from 'path'
import { getAppDatabasePath, getAppDataDir } from '../appPaths'
import { LoggingService } from '../logging/loggingService'

export class BackupService {
  private backupDir: string

  constructor(private loggingService: LoggingService, baseDir: string = getAppDataDir()) {
    this.backupDir = path.join(baseDir, 'backups')
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }
  }

  createBackup(): string {
    const source = getAppDatabasePath()
    const target = path.join(this.backupDir, `backup-${Date.now()}.sqlite`)
    fs.copyFileSync(source, target)
    this.loggingService.log({ category: 'backup', action: 'create', metadata: { target } })
    return target
  }

  restoreBackup(filePath: string): void {
    const source = path.resolve(filePath)
    if (!fs.existsSync(source)) {
      throw new Error('Backup file not found')
    }
    const target = getAppDatabasePath()
    fs.copyFileSync(source, target)
    this.loggingService.log({ category: 'backup', action: 'restore', metadata: { source } })
  }

  listBackups(): string[] {
    return fs
      .readdirSync(this.backupDir)
      .filter((file) => file.endsWith('.sqlite'))
      .map((file) => path.join(this.backupDir, file))
  }
}

