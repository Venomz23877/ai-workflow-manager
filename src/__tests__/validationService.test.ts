import { describe, expect, it } from 'vitest'
import { ValidationService, ValidationRule } from '../core/workflows/validationService'

const baseDraft = {
  name: 'Sample Workflow',
  nodes: [{ id: 'nodeA', type: 'task', label: 'Node A', entryActions: [], exitActions: [] }],
  transitions: []
}

describe('ValidationService', () => {
  it('fails when draft name is missing', () => {
    const service = new ValidationService()
    const result = service.validate({ ...baseDraft, name: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Draft name required')
  })

  it('detects invalid transitions referencing missing nodes', () => {
    const service = new ValidationService()
    const result = service.validate({
      ...baseDraft,
      transitions: [{ id: 't1', source: 'missing', target: 'nodeA', trigger: undefined, validators: [] }]
    })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toMatch(/missing source node/)
  })

  it('emits warnings when multiple nodes lack transitions', () => {
    const service = new ValidationService()
    const result = service.validate({
      ...baseDraft,
      nodes: [
        ...baseDraft.nodes,
        { id: 'nodeB', type: 'task', label: 'Node B', entryActions: [], exitActions: [] }
      ]
    })
    expect(result.valid).toBe(true)
    expect(result.warnings).toContain('Multiple nodes present but no transitions defined')
  })

  it('supports custom validation rules', () => {
    const requireDescription: ValidationRule = ({ draft, addError }) => {
      if (!(draft as any).description) {
        addError('Description required')
      }
    }
    const service = new ValidationService([requireDescription])
    const result = service.validate(baseDraft)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Description required')
  })
})

