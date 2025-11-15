import fs from 'fs'
import path from 'path'
import { getAppDataDir } from '../appPaths'

export interface LogEvent {
  category: string
  action: string
  message?: string
  metadata?: Record<string, unknown>
}

export class LoggingService {
  private logDir: string
  private logFile: string

  constructor(baseDir: string = getAppDataDir()) {
    this.logDir = path.join(baseDir, 'logs')
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
    const stamp = new Date().toISOString().slice(0, 10)
    this.logFile = path.join(this.logDir, `app-${stamp}.log`)
  }

  log(event: LogEvent): void {
    const payload = {
      timestamp: new Date().toISOString(),
      ...event
    }
    fs.appendFileSync(this.logFile, JSON.stringify(payload) + '\n', 'utf-8')
  }

  getLogPath(): string {
    return this.logFile
  }
}

