import { WorkflowNode, WorkflowTransition, WorkflowStatus } from '../domain/workflows'

export interface WorkflowDraft {
  id: number
  name: string
  description: string
  status: WorkflowStatus
  version: number
  createdAt: string
  updatedAt: string
  nodes: WorkflowNode[]
  transitions: WorkflowTransition[]
}

export interface WorkflowDraftContent {
  nodes: WorkflowNode[]
  transitions: WorkflowTransition[]
}

export interface WorkflowDraftUpdateInput {
  name?: string
  description?: string
  status?: WorkflowStatus
  content?: WorkflowDraftContent
  incrementVersion?: boolean
}

export interface WorkflowDraftValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface WorkflowRuntimeInstance {
  id: string
  draftId: number
  status: WorkflowRuntimeStatus
  createdAt: string
  updatedAt: string
  metadata?: Record<string, unknown>
}

export type WorkflowRuntimeStatus = 'running' | 'paused' | 'completed'
