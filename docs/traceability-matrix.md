# Traceability Matrix — AI Workflow Manager

This matrix links user stories to the architecture components and UX artifacts that satisfy them. Use it to validate coverage as we progress from high-level design to implementation.

## Legend

- **Arch Components** reference sections in `docs/architecture.md` (e.g., WorkflowRuntime, ConnectorRegistry, CredentialVault, DocumentBuilder, NotificationService).
- **UX Artifacts** reference narratives, wireframes, or flows under `docs/ux/`.
- **Status** mirrors story status (Draft, In Review, Approved).

## EP1 — Workflow Authoring

| Story ID  | Title                                         | Arch Components                                                                                       | UX Artifacts                                                                                            | Status |
| --------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| US-EP1-01 | Create workflow from blank canvas             | Renderer dashboard/designer, Preload IPC, WorkflowDraftService, WorkflowRepository, ValidationService | `ux/narratives/dashboard.md`, `ux/narratives/designer.md`, `ux/wireframes/designer.md`, `ux-flows.md#A` | Draft  |
| US-EP1-02 | Add and connect nodes via drag-and-drop       | Designer canvas, WorkflowDraftService, WorkflowGraphModel, ValidationService                          | `ux/narratives/designer.md`, `ux/wireframes/designer.md`                                                | Draft  |
| US-EP1-03 | Configure node entry/exit actions             | Inspector UI, ActionCatalog metadata, WorkflowDraftService, ConnectorRegistry                         | `ux/narratives/designer.md` (Actions tab)                                                               | Draft  |
| US-EP1-04 | Define triggers and validators on transitions | Transition inspector, TriggerConfigService, ValidationService                                         | `ux/narratives/designer.md`, `ux/narratives/execution-console.md`                                       | Draft  |
| US-EP1-05 | View and resolve validation messages          | ValidationService, Renderer validation panel, NotificationService, CLI validation cmd                 | `ux/narratives/designer.md` (validation messaging), `ux/wireframes/designer.md`                         | Draft  |
| US-EP1-06 | Save workflow draft and version history       | WorkflowDraftService, WorkflowVersionRepository, LocalSqliteConnector, Autosave engine                | `ux/narratives/designer.md`, `ux/narratives/dashboard.md`                                               | Draft  |
| US-EP1-07 | Duplicate workflow from template              | WorkflowRepository, TemplateRegistry, DuplicationService (UI+CLI)                                     | `ux/narratives/dashboard.md`, `ux-flows.md#F`                                                           | Draft  |
| US-EP1-08 | Export workflow definition to JSON            | WorkflowExportService, WorkflowRepository, CLI export                                                 | `ux/narratives/designer.md` (Export controls)                                                           | Draft  |
| US-EP1-09 | Undo/redo canvas actions                      | Renderer command stack, WorkflowDraftService, EventStore                                              | `ux/narratives/designer.md`, `ux/wireframes/designer.md` (footer controls)                              | Draft  |
| US-EP1-10 | CLI command to scaffold workflow              | CLI scaffold commands, WorkflowDraftService, TemplateRegistry                                         | `ux/narratives/cli-companion.md`                                                                        | Draft  |

## EP2 — Workflow Execution & Monitoring

| Story ID  | Title                                        | Arch Components                                                                               | UX Artifacts                                                                     | Status |
| --------- | -------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------ |
| US-EP2-01 | Launch workflow run from dashboard           | Renderer dashboard, RunLaunchService, WorkflowRuntime, CredentialVault                        | `ux/narratives/dashboard.md`, `ux/narratives/execution-console.md`               | Draft  |
| US-EP2-02 | View current node status and timeline        | ExecutionConsole UI, WorkflowRuntime, WorkflowEventPublisher, LoggingPipeline                 | `ux/narratives/execution-console.md`, `ux/wireframes/execution-console.md`       | Draft  |
| US-EP2-03 | Invoke node action from execution console    | ExecutionConsole node-actions, ActionInvocationService, WorkflowRuntime                       | `ux/narratives/execution-console.md`, `ux/wireframes/execution-console.md`       | Draft  |
| US-EP2-04 | Trigger node action via CLI command          | CLI actions commands, ActionInvocationService, WorkflowRuntime, EventPublisher                | `ux/narratives/cli-companion.md`                                                 | Draft  |
| US-EP2-05 | Pause and resume workflow run                | WorkflowRuntime state machine, RunStateSnapshotService, ExecutionConsole, CLI runs commands   | `ux/narratives/execution-console.md`                                             | Draft  |
| US-EP2-06 | Receive alert when validator fails           | ValidationService, NotificationService, Dashboard notifications, CLI monitor                  | `ux/narratives/execution-console.md`, `ux/narratives/dashboard.md`               | Draft  |
| US-EP2-07 | Download run summary and generated documents | DocumentBuilder, FileConnector, ArtifactsService, ExecutionConsole, CLI artifacts             | `ux/narratives/execution-console.md`, `ux/narratives/document-workspace.md`      | Draft  |
| US-EP2-08 | Restart workflow from specific node          | WorkflowRuntime, RunStateSnapshotService, ExecutionConsole restart flow, CLI restart cmd      | `ux/narratives/execution-console.md`, `ux-flows.md#C`                            | Draft  |
| US-EP2-09 | Stream structured logs to file/terminal      | WorkflowEventPublisher, Logging/Telemetry pipeline, CLI monitor, ExecutionConsole log bar     | `ux/narratives/execution-console.md`, `ux/narratives/cli-companion.md`           | Draft  |
| US-EP2-10 | Configure notification preferences           | Settings notifications panel, NotificationPreferenceService, ConfigService, CLI notifications | `ux/narratives/settings.md` (future notifications), `ux/narratives/dashboard.md` | Draft  |

## EP3 — Connector & Credential Management

| Story ID  | Title                                            | Arch Components                                                                          | UX Artifacts                                                       | Status |
| --------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------ |
| US-EP3-01 | View available connectors and current selections | Settings connectors matrix, ConnectorRegistry, ConfigService                             | `ux/narratives/settings.md`, `ux/wireframes/settings.md`           | Draft  |
| US-EP3-02 | Add ChatGPT API key via settings UI              | Settings credential form, CredentialVault, ConnectorRegistry health check                | `ux/narratives/settings.md`, `ux/wireframes/settings.md`           | Draft  |
| US-EP3-03 | Add Claude API key via settings UI               | Same as above (Claude-specific)                                                          | `ux/narratives/settings.md`, `ux/wireframes/settings.md`           | Draft  |
| US-EP3-04 | Test connector credentials and view status badge | ConnectorRegistry test endpoints, Settings UI badges, CLI test commands                  | `ux/narratives/settings.md`                                        | Draft  |
| US-EP3-05 | Configure storage connector                      | ConnectorRegistry (storage), MigrationService, ConfigService, Settings UI                | `ux/narratives/settings.md`, `ux/wireframes/settings.md`           | Draft  |
| US-EP3-06 | Set file access sandbox directories              | FileSandboxGuard, FileConnector, ConfigService, Settings UI file tree                    | `ux/narratives/settings.md`, `ux/narratives/document-workspace.md` | Draft  |
| US-EP3-07 | Manage credentials via CLI commands              | CLI credential commands, CredentialVault, ConnectorRegistry, AuditLogService             | `ux/narratives/cli-companion.md`                                   | Draft  |
| US-EP3-08 | View connector capabilities                      | ConnectorRegistry capability metadata, Settings UI, Designer inspector hints             | `ux/narratives/settings.md`, `ux/narratives/designer.md`           | Draft  |
| US-EP3-09 | Rotate API key with audit log                    | CredentialVault rotation API, AuditLogService, Settings UI, CLI rotation commands        | `ux/narratives/settings.md`, `ux/narratives/cli-companion.md`      | Draft  |
| US-EP3-10 | Export/import connector configuration bundle     | ConfigService export/import, ConnectorRegistry, Credential metadata, CLI config commands | `ux/narratives/settings.md`                                        | Draft  |

## EP4 — Document Management

| Story ID  | Title                                         | Arch Components                                                                                             | UX Artifacts                                                                 | Status |
| --------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------ |
| US-EP4-01 | Manage document template library              | DocumentRegistry, DocumentBuilder, FileConnector, WorkflowRepository, Document workspace UI                 | `ux/narratives/document-workspace.md`, `ux/wireframes/document-workspace.md` | Draft  |
| US-EP4-02 | Edit Markdown/HTML with live preview          | DocumentWorkspace editor/preview, Markdown/HTML formatters, Autosave engine, WorkflowDocumentLinkService    | `ux/narratives/document-workspace.md`, `ux/wireframes/document-workspace.md` | Draft  |
| US-EP4-03 | Validate JSON/YAML documents with schema      | SchemaValidationService, DocumentWorkspace structured editor, ConfigService                                 | `ux/narratives/document-workspace.md`                                        | Draft  |
| US-EP4-04 | Track document revisions and diffs            | DocumentRevisionRepository, DocumentWorkspace revisions panel, AuditLogService, NotificationService         | `ux/narratives/document-workspace.md`                                        | Draft  |
| US-EP4-05 | Export generated documents to DOCX/PDF bundle | DocumentBuilder, ArtifactsService, FileConnector, ExecutionConsole, CLI artifacts commands, AuditLogService | `ux/narratives/execution-console.md`, `ux/narratives/document-workspace.md`  | Draft  |
| US-EP4-06 | Edit and validate documents via CLI           | CLI document commands, DocumentRegistry, DocumentBuilder, SchemaValidationService, FileSandboxGuard         | `ux/narratives/cli-companion.md`                                             | Draft  |

## EP5 — Automation & CLI

| Story ID  | Title                                   | Arch Components                                                                                | UX Artifacts                                                       | Status |
| --------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------ |
| US-EP5-01 | Run workflows headlessly via CLI        | CLI workflow run commands, WorkflowRuntime, CredentialVault, WorkflowEventPublisher            | `ux/narratives/cli-companion.md`, `ux/wireframes/cli-companion.md` | Draft  |
| US-EP5-02 | Schedule recurring workflow runs        | SchedulerService, WorkflowRuntime, ConfigService, NotificationService, CLI scheduling commands | `ux/narratives/cli-companion.md`                                   | Draft  |
| US-EP5-03 | Manage CLI profiles and environments    | ConfigService (profiles), CredentialVault, ConnectorRegistry, CLI profile commands             | `ux/narratives/cli-companion.md`                                   | Draft  |
| US-EP5-04 | Pipe CLI output to automation pipelines | CLI formatter, WorkflowEventPublisher, Logging pipeline, ConfigService                         | `ux/narratives/cli-companion.md`, `ux/wireframes/cli-companion.md` | Draft  |
| US-EP5-05 | Script connector and credential setup   | CLI connectors commands, ConnectorRegistry, CredentialVault, ConfigService, AuditLogService    | `ux/narratives/cli-companion.md`                                   | Draft  |
| US-EP5-06 | Enforce permissions and audit in CLI    | CLI auth middleware, AuthZ layer, CredentialVault, AuditLogService                             | `ux/narratives/cli-companion.md`                                   | Draft  |

## EP6 — Templates & Sharing

| Story ID  | Title                                         | Arch Components                                                                                             | UX Artifacts                                                   | Status |
| --------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------ |
| US-EP6-01 | Browse and filter workflow templates          | TemplateRegistry, ConnectorRegistry dependency markers, DocumentRegistry, Template gallery UI               | Template gallery narrative (TBD), `ux/narratives/dashboard.md` | Draft  |
| US-EP6-02 | Publish workflow as reusable template         | WorkflowRepository, TemplateRegistry, DocumentRegistry, ValidationService, NotificationService              | `ux/narratives/designer.md`, template gallery narrative (TBD)  | Draft  |
| US-EP6-03 | Notify users of template updates/deprecations | TemplateRegistry, NotificationService, WorkflowDiffService, Dashboard/Designer UI                           | `ux/narratives/dashboard.md`                                   | Draft  |
| US-EP6-04 | Export/import templates as signed packages    | TemplateExport/Import services, ConnectorRegistry, DocumentRegistry, AuditLogService, CLI template commands | Template gallery narrative (TBD)                               | Draft  |
| US-EP6-05 | Manage template permissions and ownership     | TemplateRegistry permissions, AuthZ layer, NotificationService, AuditLogService                             | Template gallery narrative (TBD)                               | Draft  |
| US-EP6-06 | CLI template library operations               | CLI template commands, TemplateRegistry, DocumentRegistry, ValidationService, AuditLogService               | `ux/narratives/cli-companion.md`                               | Draft  |

## EP7 — Platform Operations & Quality

| Story ID  | Title                                         | Arch Components                                                                                                                        | UX Artifacts                                                                        | Status |
| --------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ |
| US-EP7-01 | Configure logging levels and destinations     | Logging/Telemetry pipeline, ConfigService, Settings logging UI, CLI ops logging commands, AuditLogService                              | Settings logging narrative (TBD)                                                    | Draft  |
| US-EP7-02 | Opt-in telemetry with anonymization           | TelemetryExporter, ConfigService, Settings telemetry UI, CLI telemetry commands, AuditLogService                                       | Settings telemetry narrative (TBD)                                                  | Draft  |
| US-EP7-03 | Run installer validation & first-run checks   | Packaging scripts, InstallationValidator, MigrationService, CredentialVault, CLI ops validate                                          | `.cursor/rules/build-installer.mdc`                                                 | Draft  |
| US-EP7-04 | Apply database migrations safely              | MigrationService, BackupService, LocalSqliteConnector, CLI ops migrate, Logging/Audit                                                  | `.cursor/rules/build-installer.mdc`                                                 | Draft  |
| US-EP7-05 | Monitor vulnerabilities and dependency health | SecurityScanner, NotificationService, ConfigService (scan schedule), CLI security commands, AuditLogService                            | Dashboard notifications narrative                                                   | Draft  |
| US-EP7-06 | Backup and restore configurations & data      | BackupService, WorkflowRepository, DocumentRegistry, ConfigService, CLI/Settings backup flows, CredentialVault metadata                | Settings backup narrative (TBD)                                                     | Draft  |
| US-EP7-07 | Run component tests from in-app Test Console  | TestConsole renderer module, TestRunnerService, AuditLogService, NotificationService, ConfigService (suite definitions), ArtifactStore | `ux/narratives/settings.md` (Diagnostics/Test Console), `ux/wireframes/settings.md` | Draft  |

## Next Steps

- Update status as stories move from Draft → Approved.
- Add references to test plans or QA artifacts in future iterations.
