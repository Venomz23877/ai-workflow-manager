import fs from 'fs'
import path from 'path'
import { ConfigService } from '../config/service'
import { LoggingService } from '../logging/loggingService'
import { getAppDataDir } from '../appPaths'

const MS_IN_DAY = 24 * 60 * 60 * 1000

export class RetentionService {
  constructor(
    private configService: ConfigService,
    private loggingService: LoggingService,
    private baseDir: string = getAppDataDir()
  ) {}

  async enforce(): Promise<void> {
    this.pruneByAge(
      path.join(this.baseDir, 'logs'),
      this.getNumber('retention.logs.days', 14),
      (file) => file.endsWith('.log'),
      'logs'
    )
    this.pruneByAge(
      path.join(this.baseDir, 'telemetry'),
      this.getNumber('retention.telemetry.days', 7),
      (file) => file.endsWith('.json'),
      'telemetry'
    )
    this.pruneByAge(
      path.join(this.baseDir, 'security'),
      this.getNumber('retention.securityScans.days', 30),
      (file) => file.endsWith('.json'),
      'security'
    )
    this.pruneByCount(
      path.join(this.baseDir, 'backups'),
      this.getNumber('retention.backups.keep', 5),
      (file) => file.endsWith('.sqlite'),
      'backups'
    )
  }

  private pruneByAge(
    targetDir: string,
    maxAgeDays: number,
    filter: (file: string) => boolean,
    category: string
  ) {
    if (maxAgeDays <= 0) return
    if (!fs.existsSync(targetDir)) return
    const threshold = Date.now() - maxAgeDays * MS_IN_DAY
    const removed: string[] = []
    for (const file of fs.readdirSync(targetDir)) {
      if (!filter(file)) continue
      const fullPath = path.join(targetDir, file)
      try {
        const stats = fs.statSync(fullPath)
        if (stats.mtimeMs <= threshold) {
          fs.rmSync(fullPath)
          removed.push(fullPath)
        }
      } catch (error) {
        this.loggingService.log({
          category: 'retention',
          action: 'prune-error',
          metadata: {
            target: fullPath,
            sourceCategory: category,
            error: error instanceof Error ? error.message : String(error)
          }
        })
      }
    }
    if (removed.length) {
      this.loggingService.log({
        category: 'retention',
        action: 'prune-age',
        metadata: { category, removed }
      })
    }
  }

  private pruneByCount(
    targetDir: string,
    keep: number,
    filter: (file: string) => boolean,
    category: string
  ) {
    if (keep <= 0) return
    if (!fs.existsSync(targetDir)) return
    const entries = fs
      .readdirSync(targetDir)
      .filter(filter)
      .map((file) => {
        const fullPath = path.join(targetDir, file)
        const stats = fs.statSync(fullPath)
        return { file: fullPath, mtime: stats.mtimeMs }
      })
      .sort((a, b) => b.mtime - a.mtime)

    if (entries.length <= keep) return
    const toRemove = entries.slice(keep)
    toRemove.forEach((entry) => {
      fs.rmSync(entry.file)
    })
    this.loggingService.log({
      category: 'retention',
      action: 'prune-count',
      metadata: { category, removed: toRemove.map((item) => item.file) }
    })
  }

  private getNumber(pathKey: string, fallback: number): number {
    const value = this.configService.get<number>(pathKey)
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    return fallback
  }
}
