# Sprint 1 — Config, Credential, and Connector Architecture

## 1. Context & Goals

- Provide a concrete design for `ConfigService`, `CredentialVault`, and `ConnectorRegistry` so that runtime, document, and automation teams can call into stable interfaces starting in Sprint 2.
- Document IPC/CLI touchpoints that must be exposed in the preload bridge and CLI program.
- Capture sequencing and data contracts that respect the dependency graph defined in the implementation plan.

## 2. ConfigService Architecture

### 2.1 Responsibilities

- Authoritative source for runtime settings covering connectors, credentials metadata, logging/telemetry, file sandbox, scheduler defaults, template/gallery options.
- Provide typed getters/setters and change notifications for main process services (WorkflowRuntime, ConnectorRegistry, LoggingPipeline) and renderer settings UI.
- Handle persistence, validation, and migration of configuration state.

### 2.2 Storage Model

| Layer   | Format                                                             | Location                                           | Notes                            |
| ------- | ------------------------------------------------------------------ | -------------------------------------------------- | -------------------------------- |
| Primary | JSON (`config.json`)                                               | `<AppData>/ai-workflow-manager/config/config.json` | Human-readable export/import     |
| Index   | SQLite tables (`config_entries`, `config_history`)                 | `<AppData>/ai-workflow-manager/config/config.db`   | For querying history, migrations |
| Cache   | In-memory map keyed by module path (e.g., `connectors.llm.active`) | Process-local                                      | Updated via watchers             |

### 2.3 Schema Outline (initial sections)

```json
{
  "connectors": {
    "llm": { "active": "openai", "available": ["openai", "claude"] },
    "storage": { "active": "sqlite", "sandboxPaths": ["~/Documents/AIWM"] }
  },
  "credentials": {
    "vault": { "provider": "os", "fallbackKey": null }
  },
  "logging": {
    "level": "info",
    "destinations": [{ "type": "file", "path": "./logs/app.log" }]
  },
  "telemetry": {
    "enabled": false,
    "endpoint": null
  },
  "scheduler": {
    "defaultProfile": "local",
    "quietHours": { "start": "22:00", "end": "06:00" }
  },
  "fileSandbox": {
    "allowlist": [{ "path": "~/Documents/AIWM", "read": true, "write": true }]
  }
}
```

### 2.4 Validation & Migration

- Use Zod schemas per section (`schemas/connectors.ts`, `schemas/logging.ts`).
- ConfigService loads JSON, validates per schema, writes defaults for missing keys, persists normalized copy.
- Change detection: watchers emit `config-changed` events with `{ path, oldValue, newValue, source }`.
- Migration flow: semantic version stored in `config.json`. On version change, run migration scripts (TS modules under `src/core/config/migrations`).

### 2.5 API Surface

```ts
interface ConfigService {
  get<T>(path: string): T
  set<T>(path: string, value: T, options?: { source: 'cli' | 'ui' | 'system' }): Promise<void>
  watch(path: string, handler: (newValue: unknown, oldValue: unknown) => void): () => void
  exportConfig(): Promise<ConfigSnapshot>
  importConfig(snapshot: ConfigSnapshot, options?: { merge?: boolean }): Promise<void>
}
```

IPC surface (`preload.ts`):

- `config:get(path)`
- `config:set(path, value)`
- `config:listSections()`

CLI surface:

- `aiwm config get <path>`
- `aiwm config set <path> <value>`
- `aiwm config export/import`

Audit logging: all mutating operations log via `AuditLogService`.

## 3. CredentialVault Architecture

### 3.1 Providers

| Provider                   | Usage               | Library                |
| -------------------------- | ------------------- | ---------------------- |
| Windows Credential Manager | Default on win32    | `node-windows-credman` |
| macOS Keychain             | Default on darwin   | `keytar`               |
| Linux Secret Service       | Default on linux    | `keytar`               |
| Encrypted JSON             | Fallback / headless | AES-GCM via `crypto`   |

### 3.2 Interface

```ts
interface CredentialVault {
  storeSecret(key: string, value: string, metadata?: VaultMetadata): Promise<void>
  retrieveSecret(key: string): Promise<VaultSecret | null>
  deleteSecret(key: string): Promise<void>
  listSecrets(prefix?: string): Promise<VaultSummary[]>
  rotateKey?(options: RotateOptions): Promise<void>
}
```

### 3.3 Integration Points

- ConfigService stores the selected provider + fallback key references.
- ConnectorRegistry resolves credentials by calling `vault.retrieveSecret` using connector-specific keys (`connector:llm:openai`).
- CLI commands:
  - `aiwm credentials add <name>`
  - `aiwm credentials list`
  - `aiwm credentials remove <name>`

### 3.4 Sequence (Adding a secret)

1. CLI command parses input, calls preload `credentials:add`.
2. Main process validates path via ConfigService (ensures connector exists).
3. CredentialVault stores secret, AuditLogService logs action.
4. ConnectorRegistry watcher is notified (to refresh capability data).

## 4. ConnectorRegistry Design

### 4.1 Components

- `ConnectorRegistry` — orchestrator storing metadata and instances.
- `ConnectorAdapter` — interface implemented by each connector.
- `ConnectorFactory` — resolves adapter based on config + vault.
- `HealthCheckService` — schedules periodic checks, sends results to NotificationService.

### 4.2 Adapter Interface

```ts
interface ConnectorAdapter {
  id: string
  kind: 'llm' | 'storage' | 'document' | 'integration'
  capabilities: ConnectorCapability[]
  init(config: ConnectorConfig, secrets: VaultSecretMap): Promise<void>
  testConnectivity(): Promise<HealthResult>
  getMetadata(): ConnectorMetadata
}
```

### 4.3 Registry Lifecycle

1. On app start, ConfigService loads connector selections.
2. Registry preloads adapter metadata (from `src/core/connectors/adapters`).
3. For each selected connector, registry fetches secrets via CredentialVault.
4. Adapter `init` runs; success logged to AuditLog.
5. Registry exposes `getConnector(kind)`, `listConnectors()`, `testConnector(id)` APIs.
6. HealthCheckService uses registry to periodically run `testConnectivity`.

### 4.4 Data Contracts

- `ConnectorMetadata`: `{ id, displayName, version, features, requiresSecrets: string[] }`
- `HealthResult`: `{ status: 'ok' | 'warn' | 'error', latencyMs, message }`
- `ConnectorConfig`: combination of ConfigService section + environment overrides.

### 4.5 IPC/CLI

IPC (preload):

- `connectors:list`
- `connectors:details(id)`
- `connectors:test(id)`
- `credentials:add/remove/list`

CLI:

- `aiwm connector list`
- `aiwm connector activate <type> <id>`
- `aiwm connector test <id>`
- `aiwm connector info <id>`
- `aiwm credentials <add|remove|list>`

### 4.6 Provider Onboarding Flow

| Step | Description                                                                                         |
| ---- | --------------------------------------------------------------------------------------------------- |
| 1    | Designer selects connector in Settings UI (calls `config:set connectors.llm.active=...`).           |
| 2    | Renderer prompts for credentials → calls `credentials:add`.                                         |
| 3    | Registry watcher sees config change, re-inits adapter, reports status.                              |
| 4    | ValidationService uses `ConnectorRegistry.getCapabilities()` to annotate nodes/validation messages. |

## 5. Sequencing & Dependencies

1. **ConfigService** — must be implemented first; other services read/write settings.
2. **CredentialVault** — depends on ConfigService for provider selection and fallback settings.
3. **ConnectorRegistry** — depends on ConfigService (settings) + CredentialVault (secrets).
4. **IPC/CLI** — layered on top of each service once tests exist.

## 6. Testing Strategy

- ConfigService: unit tests for schema validation, watchers, import/export; integration tests verifying JSON/SQLite sync.
- CredentialVault: mock provider tests + OS-specific smoke tests; ensure fallback encryption works under vitest using temp directories.
- ConnectorRegistry: adapter contract tests (mock connectors), health-check scheduler tests, integration tests verifying config/secret changes hot-reload connectors.
- CLI/IPC: use vitest + electron-mock to assert handlers call underlying services; add Test Console suites mirroring new vitest files.

## 7. Deliverables Checklist (Sprint 1)

- [ ] ConfigService module with schema + watchers + vitest coverage.
- [ ] CredentialVault abstraction with at least one provider implementation + tests.
- [ ] ConnectorRegistry core with adapter registry + health-check stub.
- [ ] Preload + CLI commands exposing config/credentials/connectors.
- [ ] Test Console suites: `config-service`, `credential-vault`, `connector-registry`.
