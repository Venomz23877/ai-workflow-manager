import fs from 'fs'
import path from 'path'
import { getConfigFilePath } from '../appPaths'
import { defaultConfig } from './defaults'
import { ConfigData, ConfigSnapshot } from './types'

type WatchHandler = (newValue: unknown, oldValue: unknown) => void

const PATH_SEPARATOR = '.'

const ensureDir = (targetPath: string) => {
  const dir = path.dirname(targetPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export interface ConfigServiceOptions {
  filePath?: string
}

export class ConfigService {
  private filePath: string
  private data: ConfigData
  private watchers = new Map<string, Set<WatchHandler>>()

  constructor(options: ConfigServiceOptions = {}) {
    this.filePath = options.filePath ?? getConfigFilePath()
    this.data = this.load()
  }

  public get<T>(path: string): T {
    return getValueFromPath(this.data, path)
  }

  public async set<T>(path: string, value: T): Promise<void> {
    const oldValue = getValueFromPath(this.data, path)
    if (isEqual(oldValue, value)) {
      return
    }
    this.data = setValueAtPath(this.data, path, value)
    this.save()
    this.notifyWatchers(path, value, oldValue)
  }

  public watch(path: string, handler: WatchHandler): () => void {
    const set = this.watchers.get(path) ?? new Set<WatchHandler>()
    set.add(handler)
    this.watchers.set(path, set)
    return () => {
      const handlers = this.watchers.get(path)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          this.watchers.delete(path)
        }
      }
    }
  }

  public listSections(): string[] {
    return Object.keys(this.data)
  }

  public exportConfig(): ConfigSnapshot {
    return {
      version: this.data.version,
      data: this.data,
      exportedAt: new Date().toISOString()
    }
  }

  public async importConfig(snapshot: ConfigSnapshot, options?: { merge?: boolean }) {
    if (options?.merge) {
      this.data = mergeConfig(this.data, snapshot.data)
    } else {
      this.data = mergeConfig(defaultConfig(), snapshot.data)
    }
    this.save()
    this.notifyWatchers('*', this.data, null)
  }

  private load(): ConfigData {
    if (!fs.existsSync(this.filePath)) {
      const defaults = defaultConfig()
      this.writeToDisk(defaults)
      return defaults
    }
    const raw = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'))
    return mergeConfig(defaultConfig(), raw)
  }

  private save() {
    this.writeToDisk(this.data)
  }

  private writeToDisk(data: ConfigData) {
    ensureDir(this.filePath)
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8')
  }

  private notifyWatchers(path: string, newValue: unknown, oldValue: unknown) {
    const handlers = this.watchers.get(path)
    handlers?.forEach((handler) => handler(newValue, oldValue))
    const wildcardHandlers = this.watchers.get('*')
    wildcardHandlers?.forEach((handler) => handler(newValue, oldValue))
  }
}

const splitPath = (input: string): string[] => input.split(PATH_SEPARATOR).filter(Boolean)

const getValueFromPath = (data: unknown, targetPath: string): any => {
  return splitPath(targetPath).reduce((acc: any, key) => (acc ? acc[key] : undefined), data)
}

const setValueAtPath = <T>(data: T, targetPath: string, value: unknown): T => {
  const segments = splitPath(targetPath)
  if (!segments.length) return data
  const clone: any = Array.isArray(data) ? [...(data as any)] : { ...(data as any) }
  let cursor: any = clone
  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i]
    cursor[key] = Array.isArray(cursor[key])
      ? [...cursor[key]]
      : cursor[key]
        ? { ...cursor[key] }
        : {}
    cursor = cursor[key]
  }
  cursor[segments[segments.length - 1]] = value
  return clone
}

const mergeConfig = (base: ConfigData, incoming: Partial<ConfigData>): ConfigData => ({
  ...base,
  ...incoming,
  connectors: {
    ...base.connectors,
    ...incoming.connectors,
    llm: {
      ...base.connectors.llm,
      ...(incoming.connectors?.llm ?? {})
    },
    storage: {
      ...base.connectors.storage,
      ...(incoming.connectors?.storage ?? {})
    },
    registry: {
      ...base.connectors.registry,
      ...(incoming.connectors?.registry ?? {})
    }
  },
  credentials: {
    ...base.credentials,
    ...incoming.credentials,
    vault: {
      ...base.credentials.vault,
      ...(incoming.credentials?.vault ?? {})
    }
  },
  logging: {
    ...base.logging,
    ...incoming.logging,
    destinations: incoming.logging?.destinations ?? base.logging.destinations
  },
  telemetry: {
    ...base.telemetry,
    ...(incoming.telemetry ?? {})
  },
  scheduler: {
    ...base.scheduler,
    ...(incoming.scheduler ?? {}),
    quietHours: {
      ...base.scheduler.quietHours,
      ...(incoming.scheduler?.quietHours ?? {})
    }
  },
  fileSandbox: {
    ...base.fileSandbox,
    ...(incoming.fileSandbox ?? {}),
    allowlist: incoming.fileSandbox?.allowlist ?? base.fileSandbox.allowlist
  },
  notifications: {
    preferences: {
      ...base.notifications.preferences,
      ...(incoming.notifications?.preferences ?? {}),
      quietHours: {
        ...base.notifications.preferences.quietHours,
        ...(incoming.notifications?.preferences?.quietHours ?? {})
      },
      channels:
        incoming.notifications?.preferences?.channels ?? base.notifications.preferences.channels
    }
  },
  diagnostics: {
    rendererPanels: {
      ...base.diagnostics.rendererPanels,
      ...(incoming.diagnostics?.rendererPanels ?? {})
    }
  },
  retention: {
    logs: {
      ...base.retention.logs,
      ...(incoming.retention?.logs ?? {})
    },
    telemetry: {
      ...base.retention.telemetry,
      ...(incoming.retention?.telemetry ?? {})
    },
    backups: {
      ...base.retention.backups,
      ...(incoming.retention?.backups ?? {})
    },
    securityScans: {
      ...base.retention.securityScans,
      ...(incoming.retention?.securityScans ?? {})
    }
  }
})

const isEqual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
