# Sprint 1 — CLI & IPC Surface Plan

## Objectives

1. Define preload IPC channels for workflow drafts, config, credentials, and connectors.
2. Align CLI commands with IPC operations so renderer/automation can reuse shared services.
3. Capture auditing, permissions, and telemetry notes for each surface.

## IPC Channels (preload → main)

| Channel                 | Payload                         | Description                            | Security                            |
| ----------------------- | ------------------------------- | -------------------------------------- | ----------------------------------- |
| `workflow:list-drafts`  | `{ includeVersions?: boolean }` | Fetch drafts + latest versions         | Requires renderer auth (future)     |
| `workflow:create-draft` | `{ name, description }`         | Creates draft via WorkflowDraftService | Audit event `workflow.draft.create` |
| `workflow:update-draft` | `{ id, patch }`                 | Updates draft metadata/content         | Audit `workflow.draft.update`       |
| `workflow:validate`     | `{ id }`                        | Runs ValidationService                 | Audit `workflow.validate`           |
| `config:get`            | `{ path }`                      | Retrieve config value                  | Logged at debug                     |
| `config:set`            | `{ path, value }`               | Update config                          | Audit `config.set`                  |
| `config:listSections`   | `void`                          | Returns section summary                | –                                   |
| `credentials:add`       | `{ key, secret, metadata }`     | Store credential                       | Audit `credential.add`              |
| `credentials:list`      | `{ prefix? }`                   | List credential metadata               | Audit `credential.list`             |
| `credentials:remove`    | `{ key }`                       | Delete credential                      | Audit `credential.remove`           |
| `connectors:list`       | `{ kind? }`                     | List registered connectors             | Audit `connector.list`              |
| `connectors:details`    | `{ id }`                        | Fetch adapter metadata                 | –                                   |
| `connectors:test`       | `{ id }`                        | Run health check                       | Audit `connector.test`              |

Implementation notes:

- Preload exposes typed wrappers that call `ipcRenderer.invoke`.
- All mutating channels log via `AuditLogService` and emit `config-changed`/`connector-status` events when appropriate.

## CLI Commands

### Workflow Drafts

- `aiwm workflow draft list`
- `aiwm workflow draft create <name> [-d description]`
- `aiwm workflow draft update <id> --name --description`
- `aiwm workflow draft validate <id>`

### Config

- `aiwm config get <path>`
- `aiwm config set <path> <value>`
- `aiwm config export [--file <path>]`
- `aiwm config import <path> [--merge]`

### Credentials

- `aiwm credentials add <key> [--secret <value> | --stdin]`
- `aiwm credentials list`
- `aiwm credentials remove <key>`

### Connectors

- `aiwm connector list [--kind <type>]`
- `aiwm connector activate <kind> <id>`
- `aiwm connector info <id>`
- `aiwm connector test <id>`

Each command:

- Calls shared services rather than bypassing ConfigService/Vault.
- Emits audit log entries.
- Returns JSON when `--json` flag provided.

## Event Notifications

- `config-changed` (main → renderer) when ConfigService updates.
- `connector-status` (main → renderer) when a connector health check finishes.
- `credential-rotation-required` when vault entry nearing expiry.

## Telemetry/Audit

- CLI invocations include `source='cli'`.
- Renderer IPC uses `source='renderer'`.
- Telemetry exporter (future) can subscribe to command events for anonymized metrics.

## Next Steps

1. Implement IPC handlers + preload exposure based on this map.
2. Scaffold CLI subcommands under `src/cli/` matching the specs.
3. Add vitest suites covering handler-to-service calls before wiring UI.
