export type ConnectorKind = 'llm' | 'storage' | 'document' | 'integration'

export interface ConnectorCapability {
  name: string
  description: string
}

export interface ConnectorMetadata {
  id: string
  name: string
  kind: ConnectorKind
  version: string
  description?: string
  capabilities: ConnectorCapability[]
  requiresSecrets?: string[]
}

export interface HealthCheckResult {
  status: 'ok' | 'warn' | 'error'
  message?: string
  latencyMs?: number
}

export interface ConnectorAdapter {
  metadata: ConnectorMetadata
  init?(): Promise<void>
  testConnectivity(): Promise<HealthCheckResult>
}

export interface ConnectorSummary extends ConnectorMetadata {
  status: 'idle' | 'initializing' | 'ready' | 'error'
  lastHealthCheck?: HealthCheckResult
}

export interface ManagedConnectorDefinition {
  id: string
  name: string
  kind: ConnectorKind
  version: string
  description?: string
  capabilities?: ConnectorCapability[]
  requiresSecrets?: string[]
  config?: Record<string, unknown>
}
