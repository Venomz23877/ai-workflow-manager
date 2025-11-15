import { WorkflowDraft, WorkflowDraftContent, WorkflowDraftValidationResult } from './workflowTypes'

export interface WorkflowDraftLike extends WorkflowDraftContent {
  name: string
}

export interface ValidationRuleContext {
  draft: WorkflowDraftLike
  errors: string[]
  warnings: string[]
  addError: (message: string) => void
  addWarning: (message: string) => void
}

export type ValidationRule = (context: ValidationRuleContext) => void

export class ValidationService {
  private rules: ValidationRule[]

  constructor(rules: ValidationRule[] = defaultRules) {
    this.rules = rules
  }

  validate(input: WorkflowDraft | WorkflowDraftLike): WorkflowDraftValidationResult {
    const draft = this.normalize(input)
    const errors: string[] = []
    const warnings: string[] = []

    const context: ValidationRuleContext = {
      draft,
      errors,
      warnings,
      addError: (message) => errors.push(message),
      addWarning: (message) => warnings.push(message)
    }

    for (const rule of this.rules) {
      try {
        rule(context)
      } catch (error) {
        errors.push(`Validation rule failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  private normalize(input: WorkflowDraft | WorkflowDraftLike): WorkflowDraftLike {
    return {
      name: input.name ?? '',
      nodes: input.nodes ?? [],
      transitions: input.transitions ?? []
    }
  }
}

const defaultRules: ValidationRule[] = [
  ({ draft, addError }) => {
    if (!draft.name || !draft.name.trim()) {
      addError('Draft name required')
    }
  },
  ({ draft, addError }) => {
    if (!draft.nodes.length) {
      addError('At least one node is required')
    }
  },
  ({ draft, addError }) => {
    const nodeIds = draft.nodes.map((node) => node.id)
    const uniqueIds = new Set(nodeIds)
    if (uniqueIds.size !== nodeIds.length) {
      addError('Node IDs must be unique')
    }
  },
  ({ draft, addError }) => {
    if (!draft.nodes.length) {
      return
    }
    const nodeIds = new Set(draft.nodes.map((node) => node.id))
    draft.transitions.forEach((transition) => {
      if (!nodeIds.has(transition.source)) {
        addError(`Transition ${transition.id} references missing source node ${transition.source}`)
      }
      if (!nodeIds.has(transition.target)) {
        addError(`Transition ${transition.id} references missing target node ${transition.target}`)
      }
    })
  },
  ({ draft, addWarning }) => {
    if (draft.nodes.length > 1 && draft.transitions.length === 0) {
      addWarning('Multiple nodes present but no transitions defined')
    }
  }
]

