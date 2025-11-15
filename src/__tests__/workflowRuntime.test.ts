import { describe, expect, it } from 'vitest'
import { WorkflowRuntime } from '../core/workflows/workflowRuntime'
import { ValidationService } from '../core/workflows/validationService'
import { WorkflowDraft } from '../core/workflows/workflowTypes'

const createDraft = (overrides: Partial<WorkflowDraft> = {}): WorkflowDraft => ({
  id: overrides.id ?? 1,
  name: overrides.name ?? 'Workflow',
  description: overrides.description ?? '',
  status: overrides.status ?? 'draft',
  version: overrides.version ?? 1,
  createdAt: overrides.createdAt ?? new Date().toISOString(),
  updatedAt: overrides.updatedAt ?? new Date().toISOString(),
  nodes:
    overrides.nodes ??
    [{ id: 'start', type: 'start', label: 'Start', entryActions: [], exitActions: [] }],
  transitions:
    overrides.transitions ??
    [{ id: 't1', source: 'start', target: 'start', trigger: undefined, validators: [] }]
})

describe('WorkflowRuntime', () => {
  const runtime = new WorkflowRuntime(new ValidationService())

  it('starts an instance for a valid draft', () => {
    const instance = runtime.start(createDraft())
    expect(instance.status).toBe('running')
    expect(instance.id).toBeDefined()
  })

  it('prevents starting invalid drafts', () => {
    const draft = createDraft({ nodes: [] })
    expect(() => runtime.start(draft)).toThrow(/Draft failed validation/)
  })

  it('supports pause and resume transitions', () => {
    const instance = runtime.start(createDraft({ id: 2 }))
    const paused = runtime.pause(instance.id)
    expect(paused.status).toBe('paused')
    const resumed = runtime.resume(instance.id)
    expect(resumed.status).toBe('running')
  })

  it('completes running instances', () => {
    const instance = runtime.start(createDraft({ id: 3 }))
    const completed = runtime.complete(instance.id)
    expect(completed.status).toBe('completed')
  })
})

