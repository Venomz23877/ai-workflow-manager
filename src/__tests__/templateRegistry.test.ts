import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, it } from 'vitest'
import { TemplatePermissionRole, TemplateRegistry } from '../core/templates/templateRegistry'

const createRegistry = () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'template-registry-'))
  const registry = new TemplateRegistry(path.join(tempDir, 'templates.db'))
  return { registry, tempDir }
}

describe('TemplateRegistry', () => {
  const tempDirs: string[] = []

  afterEach(() => {
    tempDirs.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true, force: true }))
  })

  it('creates templates and revisions', () => {
    const { registry, tempDir } = createRegistry()
    tempDirs.push(tempDir)
    const template = registry.createTemplate({ name: 'Template A', description: 'desc' })
    expect(template.name).toBe('Template A')
    registry.addRevision(template.id, 'Initial', '{"nodes":1}')
    const revisions = registry.listRevisions(template.id)
    expect(revisions.length).toBe(1)
    registry.close()
  })

  it('stores permissions alongside templates', () => {
    const { registry, tempDir } = createRegistry()
    tempDirs.push(tempDir)
    const template = registry.createTemplate({
      name: 'Perm Template',
      permissions: [
        { subject: 'alice', role: 'owner' },
        { subject: 'design', role: 'viewer' }
      ]
    })
    const fetched = registry.getTemplate(template.id)!
    expect(fetched.permissions).toHaveLength(2)
    const updated = registry.setPermissions(template.id, [
      { subject: 'bob', role: 'editor' as TemplatePermissionRole }
    ])
    expect(updated.permissions).toEqual([{ subject: 'bob', role: 'editor' }])
    registry.close()
  })
})
