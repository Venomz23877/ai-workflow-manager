# Implementation Plan — Architecture Components

This document captures the planned implementation approach for each major architecture component. It expands on `docs/architecture.md` by detailing responsibilities, build steps, dependencies, and testing per component.

## 1. Component Inventory

### Workflow Authoring & Runtime

- WorkflowRuntime (state machine, command bus)
- WorkflowDraftService
- WorkflowRepository / WorkflowVersionRepository
- ValidationService (nodes, transitions, templates)
- WorkflowEventPublisher (events/logging)
- WorkflowExportService / WorkflowImportService

### Connectors & Credentials

- ConnectorRegistry (storage, LLM, file, document adapters)
- CredentialVault (keychain adapters, fallback encrypted store)
- ConfigService (connector selections, profiles, notification prefs)
- NotificationPreferenceService
- FileSandboxGuard

### Document & Template Management

- DocumentBuilder strategies (DOCX, PDF, HTML, Markdown)
- DocumentRegistry (templates + standalone docs)
- DocumentRevisionRepository
- TemplateRegistry
- TemplateExportService / TemplateImportService
- DocumentWorkspace renderer module (editors, previews)

### Automation & Scheduling

- CLI command suite (workflows, connectors, documents, ops)
- SchedulerService (cron jobs, schedule storage)
- ActionInvocationService (shared UI/CLI manual actions)
- WorkflowDiffService (templates vs workflows)

### Operations, Logging, & Telemetry

- Logging/Telemetry pipeline (WorkflowEventPublisher adapters, log sinks)
- TelemetryExporter (optional remote metrics)
- BackupService (create/restore archives)
- MigrationService
- InstallationValidator / packaging scripts
- SecurityScanner (dependency health)
- AuditLogService

## 2. Implementation Plan Template

For each component, capture:

1. **Overview & Responsibilities** — summary and key inputs/outputs.
2. **Interfaces & Data Contracts** — main TypeScript interfaces, schema references, event payloads.
3. **Dependencies** — other components/services required (per inventory above).
4. **Build Steps** — ordered list (scaffold, integrate, validate, optimize).
5. **Testing Strategy** — unit, integration, CLI/manual flows, tooling.
6. **Operational Considerations** — logging, telemetry, migration, security, backup hooks.
7. **Risks & Mitigations** — known unknowns, TODOs, follow-ups.

## 3. Component Implementation Outlines

### 3.1 WorkflowRuntime & WorkflowDraftService

- **Overview**: Implement hexagonal runtime with command bus, state machine (xstate/custom), IPC APIs.
- **Progress**: Domain models, autosave drafts, ValidationService, and a WorkflowRuntime skeleton with lifecycle events are now implemented with IPC & CLI hooks plus vitest coverage.
- **Next Steps**:
  1. Wire runtime events into designer autosave messaging and future scheduler hooks.
  2. Add persistence snapshots + resume flows linked to WorkflowDraft history.
  3. Extend export/import once TemplateRegistry is in place.

### 3.2 ConnectorRegistry & CredentialVault

- **Steps**:
  1. Scaffold registry interfaces for storage, LLM, file, document connectors.
  2. Implement adapter factory pattern + registration API.
  3. Build CredentialVault wrappers (Windows CredMgr, macOS Keychain, Linux Secret Service, encrypted JSON fallback).
  4. Wire ConfigService to store selections per profile; include validation and migration.
  5. Add health-check endpoints + scheduled tests feeding NotificationService.
  6. Provide CLI/settings integration with audit logging.
  7. Testing: adapter contract tests, vault integration tests (mock keychains), config persistence tests.

### 3.3 DocumentBuilder, DocumentRegistry, TemplateRegistry

- **Progress**: Markdown/DOCX/PDF builders, DocumentRegistry persistence, DocumentService exports, CLI document commands, and renderer workspace UI are live with automated tests and audit logging.
- **Next Steps**:
  1. Introduce TemplateRegistry + revision history.
  2. Add diff tooling and template import/export with signing.
  3. Expand renderer workspace with previews + template management.

### 3.4 SchedulerService & CLI Automation

- **Progress**: SchedulerService persists schedules (hourly placeholder) with CLI commands to add/list/pause/resume. NotificationPreferenceService stores quiet hours/channels through ConfigService.
- **Next Steps**:
  1. Hook SchedulerService into WorkflowRuntime once the execution command bus is finalized.
  2. Add renderer UI for schedules and notification preferences.
  3. Replace placeholder hourly tick with cron parsing and actual timers plus NotificationService alerts.

### 3.5 Logging, Telemetry, Backup, Security

- **Progress**:
  - LoggingService writes structured JSON lines; CLI exposes `ops logs`.
  - TelemetryService queues events behind opt-in and flushes diagnostics via CLI.
  - BackupService creates/restores SQLite snapshots under `backups/`.
  - SecurityScanner wraps `npm audit --json`, storing reports and logging outcomes.
- **Next Steps**: add renderer diagnostics viewers, retention policies, automated scheduling, and integrate security findings with NotificationService.

### 3.6 AuditLogService & NotificationPreferenceService

- **Steps**:
  1. Define audit log schema (append-only table, event types, metadata).
  2. Implement API for CRUD/read operations accessible via UI/CLI.
  3. Ensure all sensitive operations (connectors, backups, exports, template permissions) write audit entries.
  4. Build NotificationPreferenceService storing per-user delivery choices & quiet hours.
  5. Integrate with dashboard notifications, CLI alerts, and scheduler.
  6. Testing: audit log append/read, preference enforcement, quiet-hour behavior.

## 4. Next Actions

1. Review component inventory with architecture + engineering leads; confirm priority order.
2. Socialize implementation template; adjust if teams need more detail (e.g., acceptance criteria references).
3. For each component, convert outline bullets into detailed tickets or sub-plans (per sprint).
4. Link the implementation plans back to the traceability matrix so stories point to delivery tracks.

## 5. Component Task Backlog

Below are actionable task lists derived from the outlines above. Each task can map directly to an issue/ticket when we enter execution.

### WorkflowRuntime & WorkflowDraftService

- [x] Model workflow entities (workflow, node, transition, trigger, validator) in `src/core/domain/`.
- [x] Implement WorkflowDraftService with autosave + versioning, backed by SQLite repositories.
- [x] Build ValidationService covering nodes/transitions/templates with IPC exposure.
- [x] Implement command bus + WorkflowRuntime (skeleton) and event publisher integration.
- [ ] Create persistence snapshot layer (pause/resume) and connect to WorkflowRuntime.
- [x] Expose runtime + validation commands via preload IPC and CLI equivalents.
- [ ] Implement WorkflowExport/Import including JSON schema + tests.
- [x] Author unit/integration tests (draft persistence, runtime flows, validation).

### ConnectorRegistry & CredentialVault

- [ ] Scaffold ConnectorRegistry interfaces and registry container.
- [ ] Implement adapter factories for storage/LLM/file/document connectors.
- [ ] Build CredentialVault adapters (Win/Mac/Linux/fallback) with abstraction layer.
- [ ] Create ConfigService entries for connector selections + profiles.
- [ ] Add connector health-check API and scheduled test job feeding notifications.
- [ ] Wire CLI/settings UI to registry/vault operations with audit logging.
- [ ] Write contract tests for adapters + vault integration tests.

### Document & Template Services

- [x] Define DocumentRegistry schema/tables and persistence APIs.
- [x] Implement DocumentBuilder strategies (DOCX/PDF/Markdown) with shared interface.
- [x] Build TemplateRegistry and revision tracking + diff tooling.
- [ ] Implement TemplateRegistry permissions/dependencies and TemplateExport/Import services with signing.
- [x] Integrate DocumentWorkspace UI + CLI with registry/builders (editing, validation).
- [x] Add unit/integration tests (document rendering/export, registry persistence, template registry CRUD).

### SchedulerService & Automation

- [ ] Implement SchedulerService (cron parsing, persistence, locking) plus tests.
- [ ] Integrate SchedulerService with WorkflowRuntime command bus and profiles.
- [ ] Build CLI scheduling commands (add/list/pause/resume/export).
- [ ] Implement ActionInvocationService shared by execution console + CLI.
- [ ] Connect NotificationService + NotificationPreferenceService to schedule alerts/quiet hours.
- [ ] Add end-to-end tests for scheduled runs and manual action invocation.

### Logging, Telemetry, Backup, Security

- [ ] Implement logging configuration module with runtime hot reload + file/webhook destinations.
- [ ] Build TelemetryExporter with opt-in gating, anonymization, preview payload tooling.
- [ ] Create BackupService (create/restore encrypted archives) and integrate with settings/CLI.
- [ ] Extend MigrationService with pre-backup hook + CLI flows (dry-run, rollback).
- [ ] Implement InstallationValidator referencing `.cursor/rules/build-installer.mdc`.
- [ ] Build SecurityScanner wrapper with reporting + notifications.
- [ ] Write automated tests for logging config changes, telemetry payloads, backup/restore cycles, migration rollback, security scan parsing.

### Audit & Notification Preferences

- [ ] Define AuditLogService schema and append-only writer.
- [ ] Expose audit read/tail APIs for UI + CLI.
- [ ] Instrument all sensitive flows (connectors, templates, backups, exports) to log events.
- [ ] Implement NotificationPreferenceService (per-user channels, quiet hours) with ConfigService storage.
- [ ] Wire dashboard/CLI notifications to respect preferences.
- [ ] Test audit logging (durability, filtering) and preference enforcement (quiet hours).

## 6. Leaf Component Implementation Plan

These components have minimal upstream dependencies and can be built immediately to unblock the rest of the system. For each, we capture scope, milestones, and immediate tasks.

### 6.1 AuditLogService

- **Scope**: Append-only audit log storage (SQLite table), write API, read/tail API (UI + CLI), retention/rotation settings.
- **Milestones**:
  1. Schema migration (`audit_logs` table: id, timestamp, actor, action, metadata JSON).
  2. Service implementation with `logEvent` + query methods (filters by actor, action, date).
  3. CLI command `aiwm audit tail/list --actor --action`.
  4. Renderer integration stub (settings/audit panel placeholder).
  5. Unit tests (writer, filters, retention purger).
- **Immediate Tasks**:
  - Create migration + repository.
  - Implement service with dependency injection (uses ConfigService for retention).
  - Scaffold CLI tail command using shared logging formatter.
  - Add Jest tests for insert/query/retention.

### 6.2 FileSandboxGuard & FileConnector (Local)

- **Scope**: Enforce allowed directories list and wrap filesystem operations for DocumentBuilder/CLI.
- **Milestones**:
  1. Define config schema (`fileSandbox.allowlist` with read/write flags).
  2. Implement FileSandboxGuard: `assertReadable(path)`, `assertWritable(path)`.
  3. Build baseline FileConnector with read/write/list using guard.
  4. Add CLI utility to test sandbox (`aiwm filesandbox check <path>`).
  5. Tests covering allow/deny cases and guard logging.
- **Immediate Tasks**:
  - Extend ConfigService with sandbox entries + defaults.
  - Implement guard + FileConnector shim.
  - Write unit tests mocking filesystem + config.

### 6.3 DocumentBuilder Strategies

- **Scope**: DOCX (docx), PDF (pdf-lib), HTML/Markdown exporters with consistent interface.
- **Milestones**:
  1. Define `DocumentBuilder` interface and base types (content sections, metadata).
  2. Implement `DocxBuilder` using templates + docx library.
  3. Implement `PdfBuilder` using html-to-pdf (pdf-lib or html-pdf) pipeline.
  4. Implement HTML/Markdown exporters (plain file writes).
  5. Integration tests generating sample documents + snapshots.
- **Immediate Tasks**:
  - Create builders directory with interface + abstractions.
  - Implement DOCX builder with sample template + test.
  - Implement PDF builder (choose lib) with sample fixtures.
  - Add CLI/test harness for manual verification of outputs.

### 6.4 DocumentRevisionRepository

- **Scope**: Store document revisions, provide diff/capabilities for UI/CLI.
- **Milestones**:
  1. Schema migration for `document_revisions` table storing compressed blobs + metadata.
  2. Repository/service with `addRevision`, `listRevisions`, `getDiff`.
  3. Diff utilities (textual for Markdown/HTML, structural for JSON/YAML).
  4. CLI commands `aiwm docs revisions list/restore`.
  5. Unit tests for repository and diff logic.
- **Immediate Tasks**:
  - Write migration and repository class.
  - Implement diff helper (leveraging js diff libraries).
  - Add CLI stubs + tests.

### 6.5 SecurityScanner Wrapper

- **Scope**: Wrap `npm audit`/advisory APIs, parse results, store reports.
- **Milestones**:
  1. CLI command `aiwm ops security scan`.
  2. Parser converting audit output to normalized JSON (severity, package, version, fix).
  3. Report storage (`logs/security/report-<timestamp>.json`) + summary.
  4. Notification hook for high severity.
  5. Tests for parser + command exit codes.
- **Immediate Tasks**:
  - Implement command wrapper calling `npm audit --json`.
  - Build parser + severity classification.
  - Add tests using fixture audit outputs.

### 6.6 TelemetryExporter Skeleton

- **Scope**: Handle telemetry opt-in, buffering, anonymization, manual diagnostic upload.
- **Milestones**:
  1. Define telemetry config schema (enabled flag, endpoint, privacy statement).
  2. Build TelemetryExporter service with queue + flush logic (no real endpoint needed initially).
  3. Implement anonymization helpers (hashing identifiers, redacting payloads).
  4. CLI command `aiwm ops telemetry send-diagnostics`.
  5. Tests verifying opt-in gating + payload redaction.
- **Immediate Tasks**:
  - Extend ConfigService with telemetry section.
  - Implement service skeleton with memory queue + stub transport.
  - Add unit tests ensuring no data sent when disabled + redaction works.

## 7. Execution Timeline & Resource Plan

| Phase    | Scope Highlights                                                                                 | Primary Owners                   | Target Duration | Exit Criteria                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ | -------------------------------- | --------------- | ----------------------------------------------------------------------------------------- |
| Sprint 0 | Leaf components (AuditLogService foundation, AppPaths helper, TestRunnerService + UI wiring)     | Platform Enablement              | 1 week          | CLI + renderer demos working, vitest suites green                                         |
| Sprint 1 | WorkflowRuntime/DraftService scaffolding, ConnectorRegistry contracts, ConfigService foundations | Core Runtime + Integration       | 2–3 weeks       | Domain models published, draft persistence + validation APIs available                    |
| Sprint 2 | DocumentBuilder + TemplateRegistry, SchedulerService, NotificationPreferenceService              | Document Experience + Automation | 2 weeks         | Document workspace can render/export sample doc, scheduler can trigger mock runs          |
| Sprint 3 | Logging/Telemetry pipeline, BackupService, SecurityScanner, Installer validator                  | Platform Operations              | 2 weeks         | Settings/CLI can configure logging+telemetry, backup/restore CLI green, audit hooks wired |

Dependencies: Sprint 1 unblocks SchedulerService + Document builders; Sprint 2 depends on ConfigService/ConnectorRegistry; Sprint 3 depends on AuditLog + ConfigService.

## 8. Current Status & Next Steps

| Component                           | Status                                               | Notes / Follow-ups                                                     |
| ----------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| AuditLogService foundation (leaf)   | ✅ Prototype implemented (SQLite writer, CLI viewer) | Extend to cover retention settings + renderer view                     |
| AppPaths helper                     | ✅ Ready                                             | Reuse for ConfigService + BackupService path resolution                |
| TestRunnerService + Test Console UI | ✅ Vitest suites wired, run-all control added        | Expand suites list as new components gain tests, add artifact download |
| WorkflowRuntime & Draft Service     | 🟢 Core services live                                | Snapshot/publish logic + designer hooks outstanding                    |
| ConnectorRegistry & CredentialVault | 🟡 Planning                                          | Define abstraction + vault adapters                                    |
| Document & Template services        | 🟢 Document export path live                         | Next: TemplateRegistry, revision diffs, previews                       |
| Scheduler/Automation                | 🟡 Planning                                          | Blocked on runtime command bus                                         |
| Logging/Telemetry/Backup/Security   | 🟡 Planning                                          | Requires ConfigService + Audit hooks                                   |
| TelemetryExporter skeleton          | 🔜                                                   | After logging configuration module lands                               |

Immediate actions:

1. Wire designer autosave + scheduler stubs to the new ValidationService/runtime events.
2. Define TemplateRegistry + revision storage schema and draft migration.
3. Extend document workspace with previews/links and document export download helpers.
