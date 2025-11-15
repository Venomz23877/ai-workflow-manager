import Database from 'better-sqlite3'
import { getAppDatabasePath } from '../appPaths'

export interface TemplateRecord {
  id: number
  name: string
  description: string
  version: number
  documentPath?: string
  workflowVersionId?: number
  createdAt: string
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

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
  }): TemplateRecord {
    const stmt = this.db.prepare(`
      INSERT INTO templates (name, description, document_path, workflow_version_id)
      VALUES (?, ?, ?, ?)
    `)
    const info = stmt.run(input.name, input.description ?? '', input.documentPath ?? null, input.workflowVersionId ?? null)
    return this.getTemplate(info.lastInsertRowid as number)!
  }

  listTemplates(): TemplateRecord[] {
    const stmt = this.db.prepare(`SELECT * FROM templates ORDER BY created_at DESC`)
    return stmt.all() as TemplateRecord[]
  }

  getTemplate(id: number): TemplateRecord | undefined {
    const stmt = this.db.prepare(`SELECT * FROM templates WHERE id = ?`)
    return stmt.get(id) as TemplateRecord | undefined
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

  close() {
    this.db.close()
  }
}

