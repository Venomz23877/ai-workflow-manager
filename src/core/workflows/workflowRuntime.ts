import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import { WorkflowDraft, WorkflowRuntimeInstance, WorkflowRuntimeStatus } from './workflowTypes'
import { ValidationService } from './validationService'

export type WorkflowRuntimeEvent =
  | 'instance-started'
  | 'instance-paused'
  | 'instance-resumed'
  | 'instance-completed'

export class WorkflowRuntime extends EventEmitter {
  private instances = new Map<string, WorkflowRuntimeInstance>()
  private validationService: ValidationService

  constructor(validationService: ValidationService = new ValidationService()) {
    super()
    this.validationService = validationService
  }

  getInstance(id: string): WorkflowRuntimeInstance | undefined {
    return this.instances.get(id)
  }

  listInstances(): WorkflowRuntimeInstance[] {
    return Array.from(this.instances.values())
  }

  start(draft: WorkflowDraft): WorkflowRuntimeInstance {
    const validation = this.validationService.validate(draft)
    if (!validation.valid) {
      throw new Error(`Draft failed validation: ${validation.errors.join(', ')}`)
    }
    const now = new Date().toISOString()
    const instance: WorkflowRuntimeInstance = {
      id: randomUUID(),
      draftId: draft.id,
      status: 'running',
      createdAt: now,
      updatedAt: now,
      metadata: {
        nodeCount: draft.nodes.length,
        transitionCount: draft.transitions.length,
        warnings: validation.warnings
      }
    }
    this.instances.set(instance.id, instance)
    this.emit('instance-started', instance)
    return instance
  }

  pause(id: string): WorkflowRuntimeInstance {
    return this.transitionInstance(id, 'running', 'paused', 'instance-paused')
  }

  resume(id: string): WorkflowRuntimeInstance {
    return this.transitionInstance(id, 'paused', 'running', 'instance-resumed')
  }

  complete(id: string): WorkflowRuntimeInstance {
    return this.transitionInstance(id, 'running', 'completed', 'instance-completed')
  }

  private transitionInstance(
    id: string,
    requiredStatus: WorkflowRuntimeStatus,
    nextStatus: WorkflowRuntimeStatus,
    event: WorkflowRuntimeEvent
  ): WorkflowRuntimeInstance {
    const instance = this.instances.get(id)
    if (!instance) {
      throw new Error(`Runtime instance ${id} not found`)
    }
    if (instance.status !== requiredStatus) {
      throw new Error(`Instance ${id} must be ${requiredStatus} to transition to ${nextStatus}`)
    }
    instance.status = nextStatus
    instance.updatedAt = new Date().toISOString()
    this.instances.set(id, instance)
    this.emit(event, instance)
    return instance
  }
}
