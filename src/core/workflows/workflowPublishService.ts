import { WorkflowDatabase, Workflow } from '../database'
import { WorkflowDraftService } from './workflowDraftService'
import { ValidationService } from './validationService'
import { WorkflowDraft } from './workflowTypes'

export interface PublishResult {
  workflow: Workflow
  draft: WorkflowDraft
}

export class WorkflowPublishService {
  constructor(
    private workflowDb: WorkflowDatabase,
    private draftService: WorkflowDraftService,
    private validationService: ValidationService
  ) {}

  publishDraft(draftId: number): PublishResult {
    const draft = this.draftService.getDraft(draftId)
    if (!draft) {
      throw new Error(`Draft ${draftId} not found`)
    }
    const validation = this.validationService.validate(draft)
    if (!validation.valid) {
      throw new Error(`Draft failed validation: ${validation.errors.join(', ')}`)
    }
    const workflow = this.workflowDb.createWorkflow(draft.name, draft.description)
    this.workflowDb.createWorkflowVersion(workflow.id, draft.version, {
      nodes: draft.nodes,
      transitions: draft.transitions
    })
    this.draftService.updateDraft(draft.id, { status: 'active' })
    return { workflow, draft: this.draftService.getDraft(draft.id)! }
  }
}
