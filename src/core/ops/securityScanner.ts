import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { getAppDataDir } from '../appPaths'
import { LoggingService } from '../logging/loggingService'

export interface SecurityScanResult {
  outputPath: string
  status: 'passed' | 'issues-found'
}

export class SecurityScanner {
  private reportsDir: string

  constructor(
    private loggingService: LoggingService,
    baseDir: string = getAppDataDir()
  ) {
    this.reportsDir = path.join(baseDir, 'security')
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true })
    }
  }

  runScan(): SecurityScanResult {
    const result = spawnSync('npm', ['audit', '--json'], { encoding: 'utf-8' })
    const filePath = path.join(this.reportsDir, `report-${Date.now()}.json`)
    fs.writeFileSync(filePath, result.stdout || '{}', 'utf-8')
    const status = result.status === 0 ? 'passed' : 'issues-found'
    this.loggingService.log({
      category: 'security',
      action: 'scan',
      metadata: { status, filePath }
    })
    return { outputPath: filePath, status }
  }
}
