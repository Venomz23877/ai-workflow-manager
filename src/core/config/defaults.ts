import { DEFAULT_NOTIFICATION_PREFERENCES } from '../notifications/types'
import { ConfigData } from './types'

export const defaultConfig = (): ConfigData => ({
  version: 1,
  connectors: {
    llm: {
      active: 'openai',
      available: ['openai', 'claude']
    },
    storage: {
      active: 'sqlite',
      available: ['sqlite'],
      sandboxPaths: []
    },
    registry: {}
  },
  credentials: {
    vault: {
      provider: 'os',
      fallbackKey: null
    }
  },
  logging: {
    level: 'info',
    destinations: [{ type: 'console' }]
  },
  telemetry: {
    enabled: false,
    endpoint: null
  },
  scheduler: {
    defaultProfile: 'local',
    quietHours: {
      start: '22:00',
      end: '06:00'
    }
  },
  fileSandbox: {
    allowlist: []
  },
  notifications: {
    preferences: DEFAULT_NOTIFICATION_PREFERENCES
  },
  diagnostics: {
    rendererPanels: {
      logs: true,
      telemetry: true,
      notifications: true,
      schedules: true
    }
  },
  retention: {
    logs: { days: 14 },
    telemetry: { days: 7 },
    backups: { keep: 5 },
    securityScans: { days: 30 }
  }
})
