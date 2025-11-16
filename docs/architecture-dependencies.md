# Architecture Dependency Map

This document outlines the major architecture components from `docs/architecture.md` and the dependencies between them. Use it to understand build order, integration touchpoints, and potential coupling concerns.

## Legend

- **Core Services**: Workflow runtime, validation, repositories.
- **Adapters / Registries**: Connectors, builders, registries.
- **Infrastructure**: Logging, telemetry, backups, security, auditing.
- **Shared Utilities**: Config, notification preferences, scheduler.
- Dependencies listed as “Component → depends on …”.

## Dependency Map

### Core Workflow Stack

- **WorkflowRuntime**
  - depends on: WorkflowDraftService, WorkflowRepository, WorkflowRunRepository, ValidationService, WorkflowEventPublisher, ConnectorRegistry, CredentialVault, DocumentBuilder (for actions), SchedulerService (for scheduled runs), ConfigService (profiles).
- **WorkflowDraftService**
  - depends on: WorkflowRepository, WorkflowVersionRepository, ValidationService (for autosave checks), DocumentRegistry (for node doc references), ConfigService (autosave settings).
- **ValidationService**
  - depends on: WorkflowRepository (definitions), TemplateRegistry (template constraints), ConnectorRegistry (available connectors), DocumentRegistry (linked docs), ConfigService (validation rules).
- **WorkflowEventPublisher**
  - depends on: Logging/Telemetry pipeline, NotificationService, CLI/Renderer subscribers.
- **WorkflowExportService / ImportService**
  - depends on: WorkflowRepository, DocumentRegistry, TemplateRegistry, ConnectorRegistry metadata, CredentialVault (for references), AuditLogService (record operations).

### Document & Template Stack

- **DocumentRegistry**
  - depends on: DocumentBuilder (preview/render), DocumentRevisionRepository, FileConnector, WorkflowRepository (linking nodes), ConfigService (schema associations).
- **DocumentBuilder (DOCX/PDF/etc.)**
  - depends on: FileConnector (read/write), Document templates stored in DocumentRegistry, ConfigService (output paths).
- **DocumentRevisionRepository**
  - depends on: DocumentRegistry metadata, FileConnector (blob storage), AuditLogService.
- **TemplateRegistry**
  - depends on: WorkflowRepository (source workflows), DocumentRegistry, ConnectorRegistry (dependency manifest), NotificationService (alerts), AuditLogService, ConfigService (permissions).
- **TemplateExportService / ImportService**
  - depends on: TemplateRegistry, DocumentRegistry, WorkflowExportService, ConnectorRegistry metadata, CredentialVault (metadata only), AuditLogService.

### Connectors & Credentials

- **ConnectorRegistry**
  - depends on: Individual connectors (storage/LLM/file/document adapters), ConfigService (selections), CredentialVault (secret retrieval), Logging pipeline (status), NotificationService (health alerts).
- **CredentialVault**
  - depends on: OS keychain adapters or encrypted storage, ConfigService (vault settings), AuditLogService (rotations), Logging (errors).
- **FileConnector**
  - depends on: FileSandboxGuard (allowlist), ConfigService (paths), CredentialVault (if remote storage future).

### Automation & Scheduling

- **SchedulerService**
  - depends on: WorkflowRuntime, ConfigService (profiles, schedules), CredentialVault (per-profile secrets), NotificationService (alerts), Logging pipeline.
- **ActionInvocationService**
  - depends on: WorkflowRuntime, WorkflowEventPublisher, CredentialVault (if action requires secrets), NotificationService (results).
- **CLI Command Suite**
  - depends on: WorkflowRuntime APIs, ConnectorRegistry, CredentialVault, DocumentRegistry, TemplateRegistry, SchedulerService, ConfigService, AuditLogService.

### Operations, Logging, Telemetry, Security

- **Logging/Telemetry Pipeline**
  - depends on: ConfigService (levels/destinations), WorkflowEventPublisher, TelemetryExporter.
- **TelemetryExporter**
  - depends on: ConfigService (opt-in), Logging pipeline (shared transports), NotificationService (status), AuditLogService.
- **BackupService**
  - depends on: WorkflowRepository, DocumentRegistry, TemplateRegistry, ConnectorRegistry metadata, ConfigService, CredentialVault (metadata only), AuditLogService.
- **MigrationService**
  - depends on: WorkflowRepository schema, BackupService (pre-snapshots), ConfigService (schema version), Logging pipeline.
- **InstallationValidator**
  - depends on: MigrationService, CredentialVault, FileSandboxGuard, Logging.
- **SecurityScanner**
  - depends on: npm audit / advisory sources, ConfigService (schedule), NotificationService, AuditLogService.
- **AuditLogService**
  - standalone persistence, feeds Dashboard/CLI; depends on ConfigService for retention, Logging pipeline for errors.

### Shared Utilities

- **ConfigService**
  - central dependency for most components; stores connector selections, profiles, logging, telemetry, schedules, notification prefs.
- **NotificationService**
  - depends on: NotificationPreferenceService, WorkflowEventPublisher, SchedulerService (quiet hours), Logging pipeline.
- **NotificationPreferenceService**
  - depends on: ConfigService (per-user storage).
- **FileSandboxGuard**
  - depends on: ConfigService (allowlist), Logging pipeline (violations), AuditLogService (changes).

## Visual Overview (Textual)

```
ConfigService
 ├─ ConnectorRegistry ─┬─ WorkflowRuntime
 │                     ├─ TemplateRegistry
 │                     └─ DocumentBuilder/FileConnector
 ├─ CredentialVault ───┬─ WorkflowRuntime
 │                     ├─ ConnectorRegistry
 │                     └─ CLI Commands
 ├─ SchedulerService ──┬─ WorkflowRuntime
 │                     └─ NotificationService
 ├─ Logging/Telemetry ─┬─ WorkflowEventPublisher
 │                     └─ TelemetryExporter
 ├─ BackupService ─────┬─ MigrationService
 │                     └─ Document/Workflow repos
 └─ NotificationPreferenceService → NotificationService
```

## Notes & Next Steps

- Use this map when sequencing implementation tasks to ensure prerequisites are in place (e.g., ConfigService + CredentialVault before SchedulerService).
- Update the map as new components emerge (e.g., future analytics, collaboration services).
- Consider converting this into a diagram (Mermaid/PlantUML) once component interfaces solidify.

## Status Snapshot (Sprint 4 Kickoff)

| Area                                       | Status                                       | Notes                                                                                                        |
| ------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| WorkflowRuntime & Draft Service            | 🟢 Core services live                        | Snapshot/publish linkage and scheduler hooks outstanding.                                                    |
| TemplateRegistry & Document Workspace      | 🟢 Registry, revisions, diff tooling shipped | Need permissions, export/import manifests, renderer previews.                                                |
| ConnectorRegistry & CredentialVault        | 🟢 Implemented                               | Managed registry + CLI/IPC flows plus keytar-backed OS vaults shipped; renderer settings will expand on top. |
| SchedulerService & Diagnostics             | 🟡 Planning                                  | CLI exists; runtime wiring, renderer settings, and cron support pending.                                     |
| Logging/Telemetry/Backup/Security          | 🟡 In progress                               | Retention automation enforces log/telemetry/backup/security policies; renderer diagnostics still pending.    |
| AuditLogService & Notification Preferences | 🟢 Foundations built                         | Need enforcement coverage for new Sprint 4 features.                                                         |

_Tracking legend_: 🟢 implemented (follow-up work remaining), 🟡 planned/in progress, 🔴 not started.
