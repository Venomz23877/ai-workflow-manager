import path from 'path'
import { FileConnector } from '../files/fileConnector'
import { DocumentRegistry, DocumentRecord } from './documentRegistry'
import { DocxBuilder, MarkdownBuilder, PdfBuilder } from './documentBuilder'
import { DocumentBuilder } from './types'

export type DocumentFormat = 'docx' | 'pdf' | 'markdown'

export interface ExportDocumentPayload {
  name: string
  format: DocumentFormat
  content: string
}

export interface ExportDocumentResult {
  path: string
  record: DocumentRecord
}

interface BuilderMap {
  docx: DocumentBuilder
  pdf: DocumentBuilder
  markdown: DocumentBuilder
}

const DEFAULT_BUILDERS: BuilderMap = {
  docx: new DocxBuilder(),
  pdf: new PdfBuilder(),
  markdown: new MarkdownBuilder()
}

export class DocumentService {
  constructor(
    private registry: DocumentRegistry,
    private fileConnector: FileConnector,
    private builders: BuilderMap = DEFAULT_BUILDERS
  ) {}

  async exportDocument(payload: ExportDocumentPayload): Promise<ExportDocumentResult> {
    const builder = this.builders[payload.format]
    if (!builder) {
      throw new Error(`No builder registered for format ${payload.format}`)
    }
    const normalizedName = payload.name.trim()
    if (!normalizedName) {
      throw new Error('Document name is required')
    }
    const buffer = await builder.build(payload.content)
    const relativePath = path.join(
      'documents',
      `${this.slugify(normalizedName)}-${Date.now()}.${this.getExtension(payload.format)}`
    )
    const fullPath = this.fileConnector.writeFile(relativePath, buffer)
    const record = this.registry.add({
      name: normalizedName,
      type: payload.format,
      path: fullPath,
      version: 1
    })
    return {
      path: fullPath,
      record
    }
  }

  listDocuments(): DocumentRecord[] {
    return this.registry.list()
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
  }

  private getExtension(format: DocumentFormat): string {
    switch (format) {
      case 'docx':
        return 'docx'
      case 'pdf':
        return 'pdf'
      default:
        return 'md'
    }
  }
}

