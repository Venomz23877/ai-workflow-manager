import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, it } from 'vitest'
import { TemplateRegistry } from '../core/templates/templateRegistry'
import { TemplateManifestService } from '../core/templates/templateManifestService'

const setup = () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'template-manifest-'))
  const registry = new TemplateRegistry(path.join(tempDir, 'templates.db'))
  const manifestService = new TemplateManifestService(registry)
  return { tempDir, registry, manifestService }
}

describe('TemplateManifestService', () => {
  const tempDirs: string[] = []

  afterEach(() => {
    tempDirs.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true, force: true }))
  })

  it('exports and imports templates with permissions', () => {
    const { tempDir, registry, manifestService } = setup()
    tempDirs.push(tempDir)
    const template = registry.createTemplate({
      name: 'Exported Template',
      description: 'desc',
      permissions: [
        { subject: 'alice', role: 'owner' },
        { subject: 'team', role: 'viewer' }
      ]
    })
    registry.addRevision(template.id, 'Initial', '{"diff":"1"}')
    const manifestPath = path.join(tempDir, 'template.json')
    manifestService.exportTemplate(template.id, manifestPath)
    expect(fs.existsSync(manifestPath)).toBe(true)

    const imported = manifestService.importTemplate(manifestPath, {
      nameOverride: 'Imported Template'
    })
    expect(imported.name).toBe('Imported Template')
    expect(imported.permissions).toHaveLength(2)
    const revisions = registry.listRevisions(imported.id)
    expect(revisions).toHaveLength(1)
    registry.close()
  })
})
