import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CredentialVault } from '../core/credentials/vault'

const createDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'aiwm-vault-'))

describe('CredentialVault (JSON fallback)', () => {
  let dir: string

  beforeEach(() => {
    dir = createDir()
  })

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it('stores and retrieves secrets without encryption', async () => {
    const vault = new CredentialVault({ provider: 'json', fallbackDir: dir })
    await vault.storeSecret({ key: 'connector:llm:openai', value: 'sk-test' })
    const secret = await vault.retrieveSecret('connector:llm:openai')
    expect(secret?.value).toBe('sk-test')
  })

  it('supports basic encryption when key provided', async () => {
    const key = Buffer.alloc(32, 1).toString('hex')
    const vault = new CredentialVault({
      provider: 'json',
      fallbackDir: dir,
      encryptionKey: key
    })
    await vault.storeSecret({ key: 'connector:storage:sqlite', value: 'secret' })
    const secret = await vault.retrieveSecret('connector:storage:sqlite')
    expect(secret?.value).toBe('secret')
  })

  it('lists secrets by prefix', async () => {
    const vault = new CredentialVault({ provider: 'json', fallbackDir: dir })
    await vault.storeSecret({ key: 'connector:llm:openai', value: 'a' })
    await vault.storeSecret({ key: 'connector:llm:claude', value: 'b' })
    await vault.storeSecret({ key: 'connector:storage:sqlite', value: 'c' })
    const secrets = await vault.listSecrets('connector:llm')
    expect(secrets).toHaveLength(2)
  })

  it('falls back to JSON when OS provider unavailable or forced', async () => {
    process.env.AIWM_FORCE_JSON_VAULT = '1'
    const vault = new CredentialVault({ provider: 'os', fallbackDir: dir })
    await vault.storeSecret({ key: 'connector:test:os', value: 'secret-os' })
    const secret = await vault.retrieveSecret('connector:test:os')
    expect(secret?.value).toBe('secret-os')
    delete process.env.AIWM_FORCE_JSON_VAULT
  })
})
