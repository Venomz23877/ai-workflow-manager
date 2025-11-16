import fs from 'fs'
import path from 'path'
import { getAppDataDir } from '../appPaths'
import { ConfigService } from '../config/service'

export interface TelemetryEvent {
  type: string
  payload: Record<string, unknown>
}

export class TelemetryService {
  private queue: TelemetryEvent[] = []
  private destDir: string

  constructor(
    private configService: ConfigService,
    baseDir: string = getAppDataDir()
  ) {
    this.destDir = path.join(baseDir, 'telemetry')
    if (!fs.existsSync(this.destDir)) {
      fs.mkdirSync(this.destDir, { recursive: true })
    }
  }

  isEnabled(): boolean {
    return Boolean(this.configService.get('telemetry.enabled') ?? false)
  }

  setEnabled(enabled: boolean): void {
    this.configService.set('telemetry.enabled', enabled)
  }

  enqueue(event: TelemetryEvent): void {
    if (!this.isEnabled()) {
      return
    }
    this.queue.push(event)
  }

  flush(): string | null {
    if (!this.isEnabled() || this.queue.length === 0) {
      return null
    }
    const fileName = `telemetry-${Date.now()}.json`
    const dest = path.join(this.destDir, fileName)
    const payload = {
      generatedAt: new Date().toISOString(),
      events: this.queue
    }
    fs.writeFileSync(dest, JSON.stringify(payload, null, 2), 'utf-8')
    this.queue = []
    return dest
  }
}
