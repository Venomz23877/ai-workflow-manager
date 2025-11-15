import Database from 'better-sqlite3'
import { getAppDatabasePath } from '../appPaths'

export interface DocumentRecord {
  id: number
  name: string
  type: 'docx' | 'pdf' | 'markdown'
  path: string
  version: number
  updatedAt: string
}

export class DocumentRegistry {
  private db: Database.Database

  constructor(dbPath: string = getAppDatabasePath()) {
    this.db = new Database(dbPath)
    this.ensureTable()
  }

  private ensureTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS document_registry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        path TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  list(): DocumentRecord[] {
    const stmt = this.db.prepare(`SELECT * FROM document_registry ORDER BY updated_at DESC`)
    return (stmt.all() as any[]).map((row) => this.mapRow(row))
  }

  add(doc: Omit<DocumentRecord, 'id' | 'updatedAt'>): DocumentRecord {
    const stmt = this.db.prepare(`
      INSERT INTO document_registry (name, type, path, version)
      VALUES (?, ?, ?, ?)
    `)
    const info = stmt.run(doc.name, doc.type, doc.path, doc.version)
    return this.get(info.lastInsertRowid as number)!
  }

  get(id: number): DocumentRecord | undefined {
    const stmt = this.db.prepare(`SELECT * FROM document_registry WHERE id = ?`)
    const row = stmt.get(id)
    return row ? this.mapRow(row) : undefined
  }

  close(): void {
    this.db.close()
  }

  private mapRow(row: any): DocumentRecord {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      path: row.path,
      version: row.version ?? 1,
      updatedAt: row.updated_at
    }
  }
}
