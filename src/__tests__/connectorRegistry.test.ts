import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, it } from 'vitest'
import { ConnectorRegistry } from '../core/connectors/registry'
import { ConnectorAdapter } from '../core/connectors/types'
import { ConfigService } from '../core/config/service'
import { CredentialVault } from '../core/credentials/vault'

const createAdapter = (id: string): ConnectorAdapter => ({
  metadata: {
    id,
    name: `Connector ${id}`,
    kind: 'storage',
    version: '1.0.0',
    capabilities: [{ name: 'read', description: 'Read data' }]
  },
  async testConnectivity() {
    return { status: 'ok', message: 'All good', latencyMs: 5 }
  }
})

describe('ConnectorRegistry', () => {
  it('registers and lists connectors', () => {
    const registry = new ConnectorRegistry()
    registry.registerConnector(createAdapter('storage.local'))
    const connectors = registry.listConnectors()
    expect(connectors).toHaveLength(1)
    expect(connectors[0].id).toBe('storage.local')
  })

  it('prevents duplicate registration', () => {
    const registry = new ConnectorRegistry()
    registry.registerConnector(createAdapter('dup'))
    expect(() => registry.registerConnector(createAdapter('dup'))).toThrow()
  })

  it('tests connector health', async () => {
    const registry = new ConnectorRegistry()
    registry.registerConnector(createAdapter('health'))
    const result = await registry.testConnector('health')
    expect(result.status).toBe('ok')
    const connector = registry.getConnector('health')
    expect(connector?.lastHealthCheck?.status).toBe('ok')
    expect(connector?.status).toBe('ready')
  })

  describe('managed connectors', () => {
    const tempDirs: string[] = []

    afterEach(() => {
      tempDirs.splice(0).forEach((dir) => {
        fs.rmSync(dir, { recursive: true, force: true })
      })
    })

    const createManagedRegistry = () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'connector-registry-'))
      tempDirs.push(tempDir)
      const configService = new ConfigService({ filePath: path.join(tempDir, 'config.json') })
      const credentialVault = new CredentialVault({
        provider: 'json',
        fallbackDir: path.join(tempDir, 'vault'),
        encryptionKey: null
      })
      const registry = new ConnectorRegistry(configService, credentialVault)
      return { registry, configService, credentialVault }
    }

    it('adds and removes managed connectors, persisting config', async () => {
      const { registry, configService } = createManagedRegistry()
      await registry.addManagedConnector({
        id: 'managed.storage',
        name: 'Managed Storage',
        kind: 'storage',
        version: '1.0.0',
        capabilities: []
      })
      const stored = configService.get('connectors.registry') as Record<string, unknown>
      expect(stored['managed.storage']).toBeDefined()
      expect(registry.listConnectors().map((c) => c.id)).toContain('managed.storage')

      await registry.removeManagedConnector('managed.storage')
      const updated = configService.get('connectors.registry') as Record<string, unknown>
      expect(updated['managed.storage']).toBeUndefined()
      expect(registry.listConnectors().find((c) => c.id === 'managed.storage')).toBeUndefined()
    })

    it('validates secrets via credential vault during health checks', async () => {
      const { registry, credentialVault } = createManagedRegistry()
      await registry.addManagedConnector({
        id: 'managed.llm',
        name: 'Managed LLM',
        kind: 'llm',
        version: '1.0.0',
        requiresSecrets: ['connector:llm:api'],
        capabilities: []
      })

      const missing = await registry.testConnector('managed.llm')
      expect(missing.status).toBe('error')

      await credentialVault.storeSecret({ key: 'connector:llm:api', value: 'secret-key' })
      const healthy = await registry.testConnector('managed.llm')
      expect(healthy.status).toBe('ok')
    })
  })
})
