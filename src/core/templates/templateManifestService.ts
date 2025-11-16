import fs from 'fs'
import path from 'path'
import { TemplateRegistry, TemplateRecord } from './templateRegistry'

interface TemplateManifest {
  schemaVersion: number
  template: TemplateRecord
  revisions: Array<{
    createdAt: string
    notes: string
    diffJson: string
  }>
  exportedAt: string
}

export class TemplateManifestService {
  constructor(private templateRegistry: TemplateRegistry) {}

  exportTemplate(templateId: number, filePath: string): string {
    const template = this.templateRegistry.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }
    const revisions = this.templateRegistry.listRevisions(templateId).map((revision: any) => ({
      createdAt: revision.created_at,
      notes: revision.notes ?? '',
      diffJson: revision.diff_json ?? '{}'
    }))
    const manifest: TemplateManifest = {
      schemaVersion: 1,
      template,
      revisions,
      exportedAt: new Date().toISOString()
    }
    const outputPath = path.resolve(filePath)
    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8')
    return outputPath
  }

  importTemplate(filePath: string, options?: { nameOverride?: string }): TemplateRecord {
    const manifest = this.loadManifest(filePath)
    const templateInput = {
      name: options?.nameOverride ?? manifest.template.name,
      description: manifest.template.description,
      documentPath: manifest.template.documentPath,
      workflowVersionId: manifest.template.workflowVersionId,
      permissions: manifest.template.permissions,
      version: manifest.template.version
    }
    const record = this.templateRegistry.createTemplate(templateInput)
    manifest.revisions.forEach((revision) => {
      this.templateRegistry.addRevision(record.id, revision.notes, revision.diffJson)
    })
    return record
  }

  private loadManifest(filePath: string): TemplateManifest {
    const fullPath = path.resolve(filePath)
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Manifest ${filePath} not found`)
    }
    const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
    if (raw.schemaVersion !== 1) {
      throw new Error(`Unsupported manifest schema version ${raw.schemaVersion}`)
    }
    return raw as TemplateManifest
  }
}
