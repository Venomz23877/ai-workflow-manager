import Database from 'better-sqlite3'
import { getAppDatabasePath } from '../appPaths'

export type TemplatePermissionRole = 'owner' | 'editor' | 'viewer'

export interface TemplatePermission {
  subject: string
  role: TemplatePermissionRole
}

export interface TemplateRecord {
  id: number
  name: string
  description: string
  version: number
  documentPath?: string
  workflowVersionId?: number
  createdAt: string
  permissions: TemplatePermission[]
}

export class TemplateRegistry {
  private db: Database.Database

  constructor(dbPath: string = getAppDatabasePath()) {
    this.db = new Database(dbPath)
    this.ensureTables()
  }

  private ensureTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        version INTEGER DEFAULT 1,
        document_path TEXT,
        workflow_version_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        permissions_json TEXT
      )
    `)
    this.ensureColumn('templates', 'permissions_json', 'TEXT')

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS template_revisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        diff_json TEXT,
        FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE
      )
    `)
  }

  createTemplate(input: {
    name: string
    description?: string
    documentPath?: string
    workflowVersionId?: number
    permissions?: TemplatePermission[]
    version?: number
  }): TemplateRecord {
    const stmt = this.db.prepare(`
      INSERT INTO templates (name, description, document_path, workflow_version_id, permissions_json, version)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const permissions = input.permissions ?? [{ subject: 'system', role: 'owner' }]
    const info = stmt.run(
      input.name,
      input.description ?? '',
      input.documentPath ?? null,
      input.workflowVersionId ?? null,
      JSON.stringify(permissions),
      input.version ?? 1
    )
    return this.getTemplate(info.lastInsertRowid as number)!
  }

  listTemplates(): TemplateRecord[] {
    const stmt = this.db.prepare(`SELECT * FROM templates ORDER BY created_at DESC`)
    return (stmt.all() as any[]).map((row) => this.mapRow(row))
  }

  getTemplate(id: number): TemplateRecord | undefined {
    const stmt = this.db.prepare(`SELECT * FROM templates WHERE id = ?`)
    const row = stmt.get(id)
    return row ? this.mapRow(row) : undefined
  }

  addRevision(templateId: number, notes: string, diffJson: string) {
    const stmt = this.db.prepare(`
      INSERT INTO template_revisions (template_id, notes, diff_json)
      VALUES (?, ?, ?)
    `)
    stmt.run(templateId, notes, diffJson)
  }

  listRevisions(templateId: number) {
    const stmt = this.db.prepare(
      `SELECT * FROM template_revisions WHERE template_id = ? ORDER BY created_at DESC`
    )
    return stmt.all(templateId)
  }

  getPermissions(templateId: number): TemplatePermission[] {
    const template = this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }
    return template.permissions
  }

  setPermissions(templateId: number, permissions: TemplatePermission[]): TemplateRecord {
    const template = this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }
    const sanitized = permissions.length
      ? permissions
      : [{ subject: 'system', role: 'owner' as TemplatePermissionRole }]
    const stmt = this.db.prepare(`UPDATE templates SET permissions_json = ? WHERE id = ?`)
    stmt.run(JSON.stringify(sanitized), templateId)
    return this.getTemplate(templateId)!
  }

  close() {
    this.db.close()
  }

  private mapRow(row: any): TemplateRecord {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      version: row.version,
      documentPath: row.document_path ?? undefined,
      workflowVersionId: row.workflow_version_id ?? undefined,
      createdAt: row.created_at,
      permissions: this.parsePermissions(row.permissions_json)
    }
  }

  private parsePermissions(payload?: string | null): TemplatePermission[] {
    if (!payload) {
      return [{ subject: 'system', role: 'owner' }]
    }
    try {
      const data = JSON.parse(payload)
      if (Array.isArray(data)) {
        return data.filter(
          (item) => typeof item?.subject === 'string' && typeof item?.role === 'string'
        )
      }
      return [{ subject: 'system', role: 'owner' }]
    } catch {
      return [{ subject: 'system', role: 'owner' }]
    }
  }

  private ensureColumn(table: string, column: string, definition: string) {
    const columns = this.db.prepare(`PRAGMA table_info(${table})`).all()
    if (!columns.some((col: any) => col.name === column)) {
      this.db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
    }
  }
}
