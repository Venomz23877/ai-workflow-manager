import fs from 'fs'
import os from 'os'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { TemplateRegistry } from '../core/templates/templateRegistry'

describe('TemplateRegistry', () => {
  it('creates templates and revisions', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'template-registry-'))
    const registry = new TemplateRegistry(path.join(tempDir, 'templates.db'))
    const template = registry.createTemplate({ name: 'Template A', description: 'desc' })
    expect(template.name).toBe('Template A')
    registry.addRevision(template.id, 'Initial', '{"nodes":1}')
    const revisions = registry.listRevisions(template.id)
    expect(revisions.length).toBe(1)
    registry.close()
    fs.rmSync(tempDir, { recursive: true, force: true })
  })
})

