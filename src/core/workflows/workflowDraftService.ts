import Database from 'better-sqlite3'
import {
  WorkflowDraft,
  WorkflowDraftContent,
  WorkflowDraftUpdateInput,
  WorkflowDraftValidationResult
} from './workflowTypes'
import { ConfigService } from '../config/service'
import { getAppDatabasePath } from '../appPaths'
import { ValidationService } from './validationService'

export class WorkflowDraftService {
  private db: Database.Database
  private configService: ConfigService
  private validationService: ValidationService

  constructor(
    configService: ConfigService,
    dbPath: string = getAppDatabasePath(),
    validationService: ValidationService = new ValidationService()
  ) {
    this.db = new Database(dbPath)
    this.configService = configService
    this.validationService = validationService
    this.ensureTables()
  }

  private ensureTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflow_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'draft',
        version INTEGER DEFAULT 1,
        data_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  createDraft(name: string, description?: string): WorkflowDraft {
    const stmt = this.db.prepare(`
      INSERT INTO workflow_drafts (name, description, data_json)
      VALUES (?, ?, ?)
    `)
    const info = stmt.run(name, description ?? '', JSON.stringify(this.getEmptyContent()))
    return this.getDraft(info.lastInsertRowid as number)!
  }

  listDrafts(): WorkflowDraft[] {
    const stmt = this.db.prepare(`SELECT * FROM workflow_drafts ORDER BY updated_at DESC`)
    return (stmt.all() as any[]).map(this.mapRowToDraft)
  }

  getDraft(id: number): WorkflowDraft | undefined {
    const stmt = this.db.prepare(`SELECT * FROM workflow_drafts WHERE id = ?`)
    const row = stmt.get(id)
    return row ? this.mapRowToDraft(row) : undefined
  }

  updateDraft(id: number, input: WorkflowDraftUpdateInput): WorkflowDraft {
    const draft = this.getDraft(id)
    if (!draft) {
      throw new Error(`Draft ${id} not found`)
    }

    const fields: string[] = []
    const values: any[] = []

    if (input.name !== undefined) {
      fields.push('name = ?')
      values.push(input.name)
    }

    if (input.description !== undefined) {
      fields.push('description = ?')
      values.push(input.description)
    }

    if (input.status !== undefined) {
      fields.push('status = ?')
      values.push(input.status)
    }

    if (input.content) {
      const content = this.normalizeContent(input.content)
      fields.push('data_json = ?')
      values.push(JSON.stringify(content))
      fields.push('version = version + 1')
    } else if (input.incrementVersion) {
      fields.push('version = version + 1')
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    const stmt = this.db.prepare(`
      UPDATE workflow_drafts
      SET ${fields.join(', ')}
      WHERE id = ?
    `)
    stmt.run(...values)

    return this.getDraft(id)!
  }

  autosaveDraft(id: number, content: WorkflowDraftContent): WorkflowDraft {
    return this.updateDraft(id, { content, incrementVersion: true })
  }

  deleteDraft(id: number): void {
    const stmt = this.db.prepare(`DELETE FROM workflow_drafts WHERE id = ?`)
    stmt.run(id)
  }

  validateDraft(draftId: number): WorkflowDraftValidationResult {
    const draft = this.getDraft(draftId)
    if (!draft) {
      return { valid: false, errors: ['Draft not found'], warnings: [] }
    }
    return this.validationService.validate(draft)
  }

  close(): void {
    this.db.close()
  }

  private mapRowToDraft = (row: any): WorkflowDraft => {
    const payload = row.data_json ? JSON.parse(row.data_json) : this.getEmptyContent()
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      status: row.status,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      nodes: payload.nodes ?? [],
      transitions: payload.transitions ?? []
    }
  }

  private getEmptyContent(): WorkflowDraftContent {
    return {
      nodes: [],
      transitions: []
    }
  }

  private normalizeContent(content: WorkflowDraftContent): WorkflowDraftContent {
    return {
      nodes: content.nodes ?? [],
      transitions: content.transitions ?? []
    }
  }
}
