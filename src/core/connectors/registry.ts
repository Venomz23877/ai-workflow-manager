import { ConfigService } from '../config/service'
import { CredentialVault } from '../credentials/vault'
import {
  ConnectorAdapter,
  ConnectorCapability,
  ConnectorSummary,
  HealthCheckResult,
  ManagedConnectorDefinition
} from './types'

const REGISTRY_CONFIG_PATH = 'connectors.registry'

interface RegisteredConnector {
  adapter: ConnectorAdapter
  status: ConnectorSummary['status']
  lastHealthCheck?: HealthCheckResult
}

export class ConnectorRegistry {
  private connectors = new Map<string, RegisteredConnector>()
  private managedConnectors = new Set<string>()

  constructor(
    private configService?: ConfigService,
    private credentialVault?: CredentialVault
  ) {
    if (this.configService) {
      this.bootstrapManagedConnectors()
    }
  }

  registerConnector(adapter: ConnectorAdapter) {
    const id = adapter.metadata.id
    if (this.connectors.has(id)) {
      throw new Error(`Connector with id "${id}" already registered`)
    }
    this.connectors.set(id, {
      adapter,
      status: 'idle'
    })
  }

  listConnectors(): ConnectorSummary[] {
    return Array.from(this.connectors.values()).map(({ adapter, status, lastHealthCheck }) => ({
      ...adapter.metadata,
      status,
      lastHealthCheck
    }))
  }

  getConnector(id: string): ConnectorSummary | undefined {
    const record = this.connectors.get(id)
    if (!record) return undefined
    return {
      ...record.adapter.metadata,
      status: record.status,
      lastHealthCheck: record.lastHealthCheck
    }
  }

  async testConnector(id: string): Promise<HealthCheckResult> {
    const record = this.connectors.get(id)
    if (!record) {
      throw new Error(`Connector "${id}" is not registered`)
    }
    record.status = 'initializing'
    const result = await record.adapter.testConnectivity()
    record.lastHealthCheck = result
    record.status = result.status === 'error' ? 'error' : 'ready'
    return result
  }

  async addManagedConnector(def: ManagedConnectorDefinition): Promise<ConnectorSummary> {
    this.assertConfig('register connectors')
    const sanitized = this.normalizeDefinition(def)
    const existing = this.getManagedConfig()
    if (existing[sanitized.id]) {
      throw new Error(`Connector "${sanitized.id}" already exists`)
    }
    const next = { ...existing, [sanitized.id]: sanitized }
    await this.configService!.set(REGISTRY_CONFIG_PATH, next)
    this.registerManagedAdapter(sanitized)
    return this.getConnector(sanitized.id)!
  }

  async removeManagedConnector(id: string): Promise<void> {
    this.assertConfig('remove connectors')
    const existing = this.getManagedConfig()
    if (!existing[id]) {
      throw new Error(`Connector "${id}" is not managed`)
    }
    const { [id]: _removed, ...rest } = existing
    await this.configService!.set(REGISTRY_CONFIG_PATH, rest)
    this.connectors.delete(id)
    this.managedConnectors.delete(id)
  }

  private bootstrapManagedConnectors() {
    const entries = this.getManagedConfig()
    Object.values(entries).forEach((entry) => {
      try {
        this.registerManagedAdapter(entry)
      } catch (error) {
        console.warn(`Failed to register managed connector "${entry.id}":`, error)
      }
    })
  }

  private registerManagedAdapter(def: ManagedConnectorDefinition) {
    const adapter = this.createManagedAdapter(def)
    this.registerConnector(adapter)
    this.managedConnectors.add(def.id)
  }

  private createManagedAdapter(def: ManagedConnectorDefinition): ConnectorAdapter {
    const metadata = {
      id: def.id,
      name: def.name,
      kind: def.kind,
      version: def.version,
      description: def.description,
      capabilities: def.capabilities ?? [],
      requiresSecrets: def.requiresSecrets
    }
    return {
      metadata,
      testConnectivity: async () => {
        if (!def.requiresSecrets?.length) {
          return { status: 'ok', message: 'No secrets required' }
        }
        if (!this.credentialVault) {
          return {
            status: 'warn',
            message: 'Credential vault not configured; cannot verify secrets'
          }
        }
        const missing: string[] = []
        for (const key of def.requiresSecrets) {
          const secret = await this.credentialVault.retrieveSecret(key)
          if (!secret?.value) {
            missing.push(key)
          }
        }
        if (missing.length) {
          return {
            status: 'error',
            message: `Missing secrets: ${missing.join(', ')}`
          }
        }
        return { status: 'ok', message: 'All required secrets present' }
      }
    }
  }

  private getManagedConfig(): Record<string, ManagedConnectorDefinition> {
    if (!this.configService) return {}
    return (
      (this.configService.get(REGISTRY_CONFIG_PATH) as Record<
        string,
        ManagedConnectorDefinition
      >) ?? {}
    )
  }

  private normalizeDefinition(def: ManagedConnectorDefinition): ManagedConnectorDefinition {
    return {
      ...def,
      id: def.id.trim(),
      name: def.name.trim(),
      version: def.version.trim(),
      capabilities: (def.capabilities ?? []).map((cap: ConnectorCapability) => ({
        name: cap.name.trim(),
        description: cap.description
      }))
    }
  }

  private assertConfig(action: string) {
    if (!this.configService) {
      throw new Error(`ConfigService required to ${action}`)
    }
  }
}
