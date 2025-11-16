# Sprint 1 Plan — Core Foundations

## Goals

1. Establish workflow domain models and persistence scaffolding (`WorkflowDraftService`, validation engine, SQLite tables).
2. Stand up `ConfigService`, `ConnectorRegistry`, and `CredentialVault` abstractions so future components can ask for connectors/credentials/config.
3. Expose the new services via IPC + CLI commands to unblock UX and automation workstreams.

## Deliverables

- Domain schema + TypeScript interfaces for workflows, nodes, transitions, triggers, validators, versions.
- Draft service architecture (autosave, version history, validation hooks) with migration scripts.
- ConfigService contract + storage strategy (JSON file + SQLite tables) and baseline settings schema.
- ConnectorRegistry interface + adapter lifecycle, including CredentialVault integrations and health-check API.
- CLI/IPC surface map covering draft operations, config manipulation, connector/vault management.

## Work Breakdown & Sequence

| Order | Workstream                                 | Key Tasks                                                         | Dependencies                                            |
| ----- | ------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------- |
| 1     | Workflow Domain Modeling                   | Define schema, TypeScript interfaces, migrations                  | none                                                    |
| 2     | WorkflowDraftService & Validation scaffold | Autosave service, validation runner, IPC hooks                    | Domain modeling                                         |
| 3     | ConfigService foundation                   | Storage (JSON + SQLite), typed getters/setters, schema validation | Domain modeling (shares DB), leaf components (AppPaths) |
| 4     | CredentialVault abstraction                | OS keychain adapters, encrypted fallback, CLI commands            | ConfigService (stores preferences)                      |
| 5     | ConnectorRegistry interfaces               | Registry container, adapter loading, health-check API             | ConfigService + CredentialVault                         |
| 6     | IPC/CLI surfacing                          | Preload methods + CLI commands for drafts/config/connectors       | Previous steps                                          |

## Detailed Tasks

### 1. Workflow Domain Modeling

- Define tables: `workflows`, `workflow_versions`, `workflow_nodes`, `workflow_transitions`, `workflow_templates`.
- Create TypeScript types/interfaces for workflows, nodes, transitions, validators, triggers.
- Document serialization format (JSON schema) for workflow definitions.
- Output: schema diagrams + typings file (`src/core/domain/workflows.ts`).

### 2. WorkflowDraftService & Validation Scaffold

- Design service responsibilities (autosave, versioning, validation, diffing).
- Outline API surface: `createDraft`, `updateDraft`, `publish`, `listVersions`, `validate`.
- Specify integration points with ValidationService runner + WorkflowRuntime.
- Draft IPC contract for renderer preload.

### 3. ConfigService Foundation

- Decide storage path (`AppData/ai-workflow-manager/config.json`) + structure (per module sections).
- Define schema using Zod/Yup for validation.
- Plan watchers/notifications for runtime updates.
- Enumerate initial sections: connectors, credentials metadata (vault references), logging, sandbox paths, telemetry.

### 4. CredentialVault Abstraction

- Compare OS keychains + fallback encryption requirements.
- Plan interface: `storeSecret`, `retrieveSecret`, `listSecrets`, `removeSecret`.
- Outline CLI commands for secrets (add/list/remove, rotate).
- Document audit logging points.

### 5. ConnectorRegistry Interfaces

- Define connector categories (LLM, storage, document, webhook, scheduler).
- Specify adapter lifecycle (register, resolve, health-check, metadata).
- Plan registry initialization flow using ConfigService + CredentialVault.
- Describe health-check reporting (NotificationService + audit logging).

### 6. IPC/CLI Surfacing

- Map electron preload APIs for drafts, validation, config, connectors.
- Define CLI subcommands (`aiwm workflow draft`, `aiwm config`, `aiwm connector`).
- Capture telemetry/audit requirements for each command.

## Testing & Tooling

- Unit tests for domain model serializers + ConfigService schema validation.
- Integration tests for DraftService autosave/versions against SQLite fixtures.
- CLI smoke tests for connector and config commands.
- Vitest suites wired into Test Console (new suites: `workflow-draft`, `config-service`, `connector-registry` as they come online).

## Risks & Mitigations

- **Schema churn**: version the workflow JSON schema and document migration strategy.
- **Credential storage**: ensure fallback encryption meets requirements before shipping connectors.
- **Config drift**: implement validation + defaulting to prevent invalid config states.

## Next Checkpoint

- Produce drafts for domain types, ConfigService schema, and vault/connector interfaces.
- Review with architecture lead before coding to lock interfaces for downstream teams.
