import { ManagedConnectorDefinition } from '../connectors/types'
import { NotificationPreferences } from '../notifications/types'

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

export interface ConnectorSelection {
  active: string
  available: string[]
}

export interface FileSandboxEntry {
  path: string
  read: boolean
  write: boolean
}

export interface DiagnosticsPanelConfig {
  logs: boolean
  telemetry: boolean
  notifications: boolean
  schedules: boolean
}

export interface RetentionPoliciesConfig {
  logs: {
    days: number
  }
  telemetry: {
    days: number
  }
  backups: {
    keep: number
  }
  securityScans: {
    days: number
  }
}

export interface ConfigData {
  version: number
  connectors: {
    llm: ConnectorSelection
    storage: ConnectorSelection & { sandboxPaths: string[] }
    registry: Record<string, ManagedConnectorDefinition>
  }
  credentials: {
    vault: {
      provider: 'os' | 'json'
      fallbackKey: string | null
    }
  }
  logging: {
    level: LogLevel
    destinations: Array<
      { type: 'file'; path: string } | { type: 'console' } | { type: 'webhook'; url: string }
    >
  }
  telemetry: {
    enabled: boolean
    endpoint: string | null
  }
  scheduler: {
    defaultProfile: string
    quietHours: {
      start: string
      end: string
    }
  }
  fileSandbox: {
    allowlist: FileSandboxEntry[]
  }
  notifications: {
    preferences: NotificationPreferences
  }
  diagnostics: {
    rendererPanels: DiagnosticsPanelConfig
  }
  retention: RetentionPoliciesConfig
}

export interface ConfigSnapshot {
  version: number
  data: ConfigData
  exportedAt: string
}
