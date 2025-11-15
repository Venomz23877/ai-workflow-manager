import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterAll, describe, expect, it } from 'vitest'
import { WorkflowDatabase } from '../core/database'
import { WorkflowDraftService } from '../core/workflows/workflowDraftService'
import { WorkflowPublishService } from '../core/workflows/workflowPublishService'
import { ValidationService } from '../core/workflows/validationService'
import { ConfigService } from '../core/config/service'

describe('WorkflowPublishService', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-publish-'))
  const dbPath = path.join(tempDir, 'workflows.db')
  const configPath = path.join(tempDir, 'config.json')
  process.env.AIWM_CONFIG_PATH = configPath

  const configService = new ConfigService()
  const draftService = new WorkflowDraftService(configService, dbPath)
  const validationService = new ValidationService()
  const workflowDb = new WorkflowDatabase(dbPath)
  const publishService = new WorkflowPublishService(workflowDb, draftService, validationService)

  afterAll(() => {
    draftService.close()
    workflowDb.close()
    fs.rmSync(tempDir, { recursive: true, force: true })
    delete process.env.AIWM_CONFIG_PATH
  })

  it('publishes a draft into workflows and versions', () => {
    const draft = draftService.createDraft('Publishable Draft')
    draftService.updateDraft(draft.id, {
      content: {
        nodes: [{ id: 'start', type: 'start', label: 'Start', entryActions: [], exitActions: [] }],
        transitions: []
      }
    })

    const result = publishService.publishDraft(draft.id)
    expect(result.workflow.name).toBe('Publishable Draft')

    const versions = workflowDb.listWorkflowVersions(result.workflow.id)
    expect(versions.length).toBe(1)
    expect(JSON.parse(versions[0].definition_json).nodes.length).toBe(1)
  })

  it('throws when validation fails', () => {
    const invalidDraft = draftService.createDraft('  ')
    expect(() => publishService.publishDraft(invalidDraft.id)).toThrow(/failed validation/)
  })
})

