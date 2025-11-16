import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterAll, describe, expect, it } from 'vitest'
import { ConfigService } from '../core/config/service'
import { WorkflowDraftService } from '../core/workflows/workflowDraftService'
import { WorkflowDraftContent } from '../core/workflows/workflowTypes'

describe('WorkflowDraftService', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'draft-service-'))
  const dbPath = path.join(tempDir, 'drafts.db')
  const configService = new ConfigService()
  const service = new WorkflowDraftService(configService, dbPath)

  afterAll(() => {
    service.close()
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('creates and lists drafts', () => {
    const draft = service.createDraft('Workflow A', 'test description')
    expect(draft.id).toBeGreaterThan(0)
    expect(draft.version).toBe(1)
    expect(draft.nodes).toEqual([])
    const drafts = service.listDrafts()
    expect(drafts.length).toBeGreaterThan(0)
  })

  it('updates draft metadata and content, incrementing version', () => {
    const draft = service.createDraft('Workflow B')
    const content: WorkflowDraftContent = {
      nodes: [
        { id: 'start', type: 'start', label: 'Start', entryActions: [], exitActions: [] },
        { id: 'end', type: 'end', label: 'End', entryActions: [], exitActions: [] }
      ],
      transitions: [
        {
          id: 't1',
          source: 'start',
          target: 'end',
          trigger: undefined,
          validators: []
        }
      ]
    }
    const updated = service.updateDraft(draft.id, {
      name: 'Renamed Workflow',
      description: 'Updated description',
      content
    })
    expect(updated.name).toBe('Renamed Workflow')
    expect(updated.description).toBe('Updated description')
    expect(updated.version).toBe(draft.version + 1)
    expect(updated.nodes.length).toBe(2)
    expect(updated.transitions.length).toBe(1)
  })

  it('autosaves draft and increments version', () => {
    const draft = service.createDraft('Workflow C')
    const autosaved = service.autosaveDraft(draft.id, {
      nodes: [{ id: 'node', type: 'task', label: 'Task', entryActions: [], exitActions: [] }],
      transitions: []
    })
    expect(autosaved.version).toBeGreaterThan(draft.version)
    expect(autosaved.nodes.length).toBe(1)
  })

  it('validates drafts and returns errors/warnings', () => {
    const emptyDraft = service.createDraft('  ')
    const invalidResult = service.validateDraft(emptyDraft.id)
    expect(invalidResult.valid).toBe(false)
    expect(invalidResult.errors).toContain('Draft name required')

    const nodesDraft = service.createDraft('Workflow Valid')
    service.updateDraft(nodesDraft.id, {
      content: {
        nodes: [
          { id: 'nodeA', type: 'task', label: 'Node A', entryActions: [], exitActions: [] },
          { id: 'nodeB', type: 'task', label: 'Node B', entryActions: [], exitActions: [] }
        ],
        transitions: []
      }
    })
    const result = service.validateDraft(nodesDraft.id)
    expect(result.valid).toBe(true)
    expect(result.warnings).toContain('Multiple nodes present but no transitions defined')
  })

  it('deletes drafts', () => {
    const draft = service.createDraft('Workflow D')
    service.deleteDraft(draft.id)
    expect(service.getDraft(draft.id)).toBeUndefined()
  })
})
