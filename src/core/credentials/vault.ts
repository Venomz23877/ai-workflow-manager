import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import os from 'os'
import type * as Keytar from 'keytar'

export type VaultProvider = 'os' | 'json'

export interface VaultSecret {
  key: string
  value: string
  metadata?: Record<string, unknown>
}

export interface CredentialVaultOptions {
  provider?: VaultProvider
  fallbackDir?: string
  encryptionKey?: string | null
  serviceName?: string
  forceJsonProvider?: boolean
  keytarModule?: typeof Keytar
}

interface VaultStrategy {
  storeSecret(secret: VaultSecret): Promise<void>
  retrieveSecret(key: string): Promise<VaultSecret | null>
  deleteSecret(key: string): Promise<void>
  listSecrets(prefix?: string): Promise<VaultSecret[]>
}

const SERVICE_NAME = 'AI Workflow Manager'

const loadKeytar = (moduleOverride?: typeof Keytar): typeof Keytar | null => {
  if (moduleOverride) return moduleOverride
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('keytar')
  } catch {
    return null
  }
}

export class CredentialVault {
  private strategy: VaultStrategy

  constructor(options: CredentialVaultOptions = {}) {
    const provider = options.provider ?? detectDefaultProvider()
    const forceJson = options.forceJsonProvider || process.env.AIWM_FORCE_JSON_VAULT === '1'
    if (provider === 'json' || forceJson) {
      this.strategy = createJsonStrategy(options)
      return
    }
    const keytar = loadKeytar(options.keytarModule)
    if (!keytar) {
      console.warn(
        '[CredentialVault] OS provider requested but keytar is unavailable. Falling back to JSON store.'
      )
      this.strategy = createJsonStrategy(options)
      return
    }
    this.strategy = new OsVault(keytar, options.serviceName ?? SERVICE_NAME)
  }

  storeSecret(secret: VaultSecret) {
    return this.strategy.storeSecret(secret)
  }

  retrieveSecret(key: string) {
    return this.strategy.retrieveSecret(key)
  }

  deleteSecret(key: string) {
    return this.strategy.deleteSecret(key)
  }

  listSecrets(prefix?: string) {
    return this.strategy.listSecrets(prefix)
  }
}

const createJsonStrategy = (options: CredentialVaultOptions) =>
  new JsonVault({
    dir: options.fallbackDir ?? path.join(os.homedir(), '.aiwm', 'vault'),
    encryptionKey: options.encryptionKey
  })

const detectDefaultProvider = (): VaultProvider => {
  if (process.env.AIWM_VAULT_PROVIDER === 'os') return 'os'
  return 'json'
}

class OsVault implements VaultStrategy {
  constructor(
    private keytar: typeof Keytar,
    private serviceName: string
  ) {}

  async storeSecret(secret: VaultSecret): Promise<void> {
    const payload = JSON.stringify({
      value: secret.value,
      metadata: secret.metadata ?? {}
    })
    await this.keytar.setPassword(this.serviceName, secret.key, payload)
  }

  async retrieveSecret(key: string): Promise<VaultSecret | null> {
    const payload = await this.keytar.getPassword(this.serviceName, key)
    if (!payload) return null
    return this.deserialize(key, payload)
  }

  async deleteSecret(key: string): Promise<void> {
    await this.keytar.deletePassword(this.serviceName, key)
  }

  async listSecrets(prefix?: string): Promise<VaultSecret[]> {
    const records = await this.keytar.findCredentials(this.serviceName)
    return records
      .filter((record) => (prefix ? record.account.startsWith(prefix) : true))
      .map((record) => this.deserialize(record.account, record.password))
  }

  private deserialize(key: string, payload: string): VaultSecret {
    try {
      const parsed = JSON.parse(payload)
      return {
        key,
        value: parsed.value ?? '',
        metadata: parsed.metadata ?? {}
      }
    } catch {
      return { key, value: payload }
    }
  }
}

class JsonVault implements VaultStrategy {
  private filePath: string
  private encryptionKey: Buffer | null

  constructor(options: { dir: string; encryptionKey?: string | null }) {
    this.filePath = path.join(options.dir, 'secrets.json')
    this.encryptionKey = options.encryptionKey ? Buffer.from(options.encryptionKey, 'hex') : null
    if (!fs.existsSync(options.dir)) {
      fs.mkdirSync(options.dir, { recursive: true })
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({ secrets: [] }), 'utf-8')
    }
  }

  async storeSecret(secret: VaultSecret): Promise<void> {
    const data = this.readFile()
    const encryptedValue = this.encrypt(secret.value)
    const updated = data.secrets.filter((item: any) => item.key !== secret.key)
    updated.push({
      key: secret.key,
      value: encryptedValue,
      metadata: secret.metadata ?? {}
    })
    this.writeFile({ secrets: updated })
  }

  async retrieveSecret(key: string): Promise<VaultSecret | null> {
    const data = this.readFile()
    const entry = data.secrets.find((item: any) => item.key === key)
    if (!entry) return null
    return {
      key: entry.key,
      value: this.decrypt(entry.value),
      metadata: entry.metadata
    }
  }

  async deleteSecret(key: string): Promise<void> {
    const data = this.readFile()
    const updated = data.secrets.filter((item: any) => item.key !== key)
    this.writeFile({ secrets: updated })
  }

  async listSecrets(prefix?: string): Promise<VaultSecret[]> {
    const data = this.readFile()
    const filtered = prefix
      ? data.secrets.filter((item: any) => item.key.startsWith(prefix))
      : data.secrets
    return filtered.map((entry: any) => ({
      key: entry.key,
      value: this.decrypt(entry.value),
      metadata: entry.metadata
    }))
  }

  private readFile(): any {
    return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'))
  }

  private writeFile(data: any) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8')
  }

  private encrypt(value: string): string {
    if (!this.encryptionKey) {
      return Buffer.from(value, 'utf-8').toString('base64')
    }
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv)
    const encrypted = Buffer.concat([cipher.update(value, 'utf-8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return Buffer.concat([iv, tag, encrypted]).toString('base64')
  }

  private decrypt(payload: string): string {
    if (!this.encryptionKey) {
      return Buffer.from(payload, 'base64').toString('utf-8')
    }
    const buffer = Buffer.from(payload, 'base64')
    const iv = buffer.subarray(0, 12)
    const tag = buffer.subarray(12, 28)
    const encrypted = buffer.subarray(28)
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv)
    decipher.setAuthTag(tag)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString('utf-8')
  }
}
