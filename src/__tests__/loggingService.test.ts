import fs from 'fs'
import os from 'os'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { LoggingService } from '../core/logging/loggingService'

describe('LoggingService', () => {
  it('writes JSON lines to log file', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'logging-service-'))
    const service = new LoggingService(dir)
    service.log({ category: 'test', action: 'write', metadata: { foo: 'bar' } })
    const logPath = service.getLogPath()
    const content = fs.readFileSync(logPath, 'utf-8').trim()
    expect(content).toContain('"category":"test"')
    fs.rmSync(dir, { recursive: true, force: true })
  })
})

