# Test & Verification Plan

This plan ties each user story and architecture component to concrete verification activities. It complements `docs/traceability-matrix.md` and `docs/implementation-plan.md`.

## 1. Testing Strategy

- **Unit Tests**: Validate domain models, services, and adapters (WorkflowRuntime commands, ConnectorRegistry factories, DocumentBuilder strategies, ConfigService, Scheduler).
- **Integration Tests**: Exercise cross-component flows (designer autosave, runtime + connector interactions, document export, template publishing, scheduler-triggered runs).
- **End-to-End (UI)**: Playwright/Electron tests covering critical UX narratives (blank workflow creation, execution console actions, settings panels, template gallery, backups).
- **CLI/Automation Tests**: Smoke and contract tests for CLI commands (workflows run, docs edit, connectors config, ops tooling).
- **Manual/Exploratory**: Installer validation, backup/restore drills, telemetry opt-in review, security scan confirmation.

## 2. Story-Level Verification

Each table lists the primary verification focus per story. “Unit” includes service-level tests; “Int” is integration; “E2E” covers renderer automation; “CLI” includes command tests; “Ops” denotes manual/operational checks.

### EP1 — Workflow Authoring

| Story ID  | Verification Focus                                                                                                                                          |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-EP1-01 | Unit: WorkflowDraftService metadata; Int: dashboard→designer flow creating draft; E2E: Playwright scenario creating blank workflow and persisting metadata. |
| US-EP1-02 | Unit: graph model commands; Int: drag/drop + persistence sync; E2E: canvas drag/drop automation with accessibility checks.                                  |
| US-EP1-03 | Unit: ActionCatalog validators; Int: inspector saving entry/exit actions; E2E: configure actions + rerun validation.                                        |
| US-EP1-04 | Unit: trigger/validator schema; Int: transition inspector storing data; E2E: validation messaging when missing config.                                      |
| US-EP1-05 | Unit: ValidationService issue generation; Int: validation panel + notification feed; CLI: `workflows validate` JSON output snapshot.                        |
| US-EP1-06 | Unit: autosave timer + repository; Int: version history diff; E2E: crash-recovery scenario; CLI: `workflows history`.                                       |
| US-EP1-07 | Unit: duplication logic; Int: template attach warnings; E2E: duplicate via dashboard; CLI: `workflows duplicate`.                                           |
| US-EP1-08 | Unit: export serializer; Int: export→import cycle; CLI: `workflows export` golden files.                                                                    |
| US-EP1-09 | Unit: command stack; Int: undo/redo persistence; E2E: keyboard + toolbar undo scenario.                                                                     |
| US-EP1-10 | Unit: scaffold generator; CLI: interactive + non-interactive scaffolding; Int: scaffolded workflow opens in designer.                                       |

### EP2 — Workflow Execution & Monitoring

| Story ID  | Verification Focus                                                                                                                       |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| US-EP2-01 | Int: dashboard run modal -> runtime start; E2E: run launched + toast; CLI: equivalent command parity.                                    |
| US-EP2-02 | Unit: event publisher formatting; Int: console timeline updates; E2E: Playwright monitoring scenario; CLI: `runs monitor` JSON snapshot. |
| US-EP2-03 | Unit: ActionInvocationService; Int: console action invocation and timeline entry; E2E manual action success/failure paths.               |
| US-EP2-04 | CLI: action list/invoke commands with fixtures; Int: shared service ensures parity.                                                      |
| US-EP2-05 | Unit: RunStateSnapshotService; Int: pause/resume persistence; E2E: console pause/resume; CLI: `runs pause/resume`.                       |
| US-EP2-06 | Unit: validator event classification; Int: notification routing; E2E: banner + dashboard alert.                                          |
| US-EP2-07 | Unit: ArtifactsService bundler; Int: download from console; CLI: `runs artifacts download` golden file.                                  |
| US-EP2-08 | Unit: restart API; Int: diff warnings; E2E: restart from node; CLI: `runs restart`.                                                      |
| US-EP2-09 | Unit: logging filter; CLI: streaming with filters; Int: console log bar toggling.                                                        |
| US-EP2-10 | Unit: NotificationPreferenceService; Int: settings panel writes; CLI: `notifications prefs`; manual quiet-hour check.                    |

### EP3 — Connector & Credential Management

| Story ID     | Verification Focus                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| US-EP3-01    | Int: settings connectors grid vs registry state; CLI: `connectors list`.                                              |
| US-EP3-02/03 | Unit: CredentialVault adapters; Int: UI form -> vault; CLI: credential set/test; Ops: keychain fallback manual check. |
| US-EP3-04    | Unit: health-check API; Int: badge updates + notifications; CLI: `connectors test`.                                   |
| US-EP3-05    | Unit: storage adapter config; Int: migration warning flow; E2E: switching connectors; CLI: `connectors storage set`.  |
| US-EP3-06    | Unit: FileSandboxGuard; Int: tree UI + validation; CLI: sandbox commands; manual attempt to access blocked path.      |
| US-EP3-07    | CLI: credential list/set/rotate contracts; Unit: vault audit logging.                                                 |
| US-EP3-08    | Unit: capability metadata service; Int: settings + designer hints; CLI: `connectors capabilities`.                    |
| US-EP3-09    | Unit: vault rotation flows; Int: audit logging + runtime switchover; CLI: rotate command.                             |
| US-EP3-10    | Unit: config bundle schema; Int: UI import/export; CLI: config commands; Ops: bundle hash verification.               |

### EP4 — Document Management

| Story ID  | Verification Focus                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------- |
| US-EP4-01 | Unit: DocumentRegistry CRUD; Int: template library UI + attach; CLI: `docs templates` commands.         |
| US-EP4-02 | Unit: Markdown/HTML formatter + autosave; E2E: live preview editing; accessibility checks.              |
| US-EP4-03 | Unit: SchemaValidationService; Int: JSON/YAML editor + blocking behavior; CLI: `docs validate`.         |
| US-EP4-04 | Unit: revision repository; Int: diff viewer; CLI: revision commands; Ops: retention enforcement.        |
| US-EP4-05 | Unit: DocumentBuilder + bundler; Int: console download; CLI: artifacts; manual large-file cancellation. |
| US-EP4-06 | CLI: docs list/edit/export flows; Unit: sandbox enforcement; Integration: external editor sync.         |

### EP5 — Automation & CLI

| Story ID  | Verification Focus                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| US-EP5-01 | CLI: `workflows run` sync/async tests; Integration: runtime parity with UI.                                         |
| US-EP5-02 | Unit: SchedulerService cron parser; Integration: scheduled run triggers; CLI scheduling commands.                   |
| US-EP5-03 | Unit: profile config storage; CLI: profiles create/use/delete tests; Integration: commands respect profile context. |
| US-EP5-04 | CLI: JSON output filtering + exit codes; Integration: piping to files; snapshot tests for sample pipelines.         |
| US-EP5-05 | CLI: connectors config apply/test; Unit: audit logging; Integration: env-var credentials.                           |
| US-EP5-06 | Unit: auth middleware; CLI: permission enforcement; Audit log tail command; manual token flow.                      |

### EP6 — Templates & Sharing

| Story ID  | Verification Focus                                                                                       |
| --------- | -------------------------------------------------------------------------------------------------------- |
| US-EP6-01 | Unit: TemplateRegistry queries; Int: gallery filters + dependency badges; CLI listing tests.             |
| US-EP6-02 | Unit: publish flow validation; Int: UI publish modal; CLI publish command; Notification check.           |
| US-EP6-03 | Unit: template dependency graph; Int: notifications + designer badges; CLI updates list.                 |
| US-EP6-04 | Unit: package signing/verification; Int: UI export/import; CLI package commands; Ops: hash verification. |
| US-EP6-05 | Unit: permission schema; Int: access control UI; CLI permissions command; Audit logging.                 |
| US-EP6-06 | CLI: template duplicate/publish/export; Integration: registry consistency tests.                         |

### EP7 — Platform Operations & Quality

| Story ID  | Verification Focus                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------ |
| US-EP7-01 | Unit: logging config loader; Int: settings logging panel; CLI logging commands; manual preview file check.               |
| US-EP7-02 | Unit: telemetry opt-in gating; Int: telemetry settings UI; CLI telemetry status; Ops: packet sniff/preview verification. |
| US-EP7-03 | Ops: installer validation script run; Integration: first-run checklist logs; CLI `ops validate` test harness.            |
| US-EP7-04 | Unit: MigrationService; Integration: backup-before-migrate; CLI migrate command; failure rollback manual test.           |
| US-EP7-05 | Unit: SecurityScanner parser; CLI security scan command; Integration: dashboard alert; manual npm audit cross-check.     |
| US-EP7-06 | Unit: BackupService builders; Integration: settings backup UI; CLI backup/restore; Ops: encrypted archive verification.  |

## 3. Component-Level Verification

Beyond per-story tests, each core component includes dedicated suites (aligned with `docs/implementation-plan.md` Section 5):

- **WorkflowRuntime**: state machine unit tests, integration runs with connectors, load tests for long workflows.
- **ConnectorRegistry & CredentialVault**: contract tests per adapter, vault rotation tests, fault-injection for missing keys.
- **Document/Template Services**: rendering snapshot tests, package signing verification, permission enforcement tests.
- **SchedulerService & CLI**: cron validation, overlapping-run prevention, CLI pipeline tests.
- **Logging/Telemetry/Backup/Security**: config hot reload tests, telemetry redaction snapshots, backup integrity tests, migration rollback verification, security scan diff tests.
- **Audit & Notification Preferences**: append-only log durability, filtering, quiet-hour enforcement, CLI/UI parity.

## 4. Next Steps

1. Translate these verification items into test tickets per epic/component.
2. Align automation tooling (Jest/Vitest, Playwright, CLI harness) with the outlined coverage.
3. Update `docs/traceability-matrix.md` with references to this plan when stories move to “In Review.”

## 5. Sprint 4 CLI Smoke Scripts

The following CLI runs are executed before every Sprint 4 demo and release candidate. Each script captures the expected exit codes and observable artifacts so QA can log results in `.ai_working/wrapup.md`.

### 5.1 Connector & Credential Registry

1. `aiwm connector register storage.local --name "Local Storage" --kind storage --version 1.0.0 --capability "read:SQLite ingest" --requires-secret connector:storage:sqlite`
   - Expected: “✅ Registered connector storage.local …”
2. `aiwm connector list`
   - Confirm `storage.local` shows `READY` status.
3. `aiwm connector test storage.local`
   - Expected OK health-check message (warn/error surfaces in console/log).
4. `aiwm connector remove storage.local`
   - Expected: `🗑️  Removed connector storage.local`.
5. `aiwm credential add connector:storage:sqlite --secret "demo-secret"`
   - Ensures vault write succeeds (OS provider when available, JSON fallback otherwise).

### 5.2 Scheduler & Automation

1. `aiwm schedule add 1 "*/5 * * * *" --timezone UTC`
   - Replace workflow ID with a published workflow; expect success message.
2. `aiwm schedule list`
   - Verify schedule shows `ACTIVE` with next run timestamp.
3. `aiwm schedule pause <id>` then `aiwm schedule resume <id>`
   - Status toggles between `paused` and `active`.
4. (Optional) allow cron to trigger and confirm `scheduler-runner` logs `run-started`/`run-completed`.
5. `aiwm schedule delete <id>` to clean up after test.

### 5.3 Retention & Ops Tooling

1. `aiwm ops backup create` followed by `aiwm ops backup list`
   - Confirms backup path creation (used to validate retention count policy).
2. `aiwm ops logs`
   - Displays the log file path surfaced in renderer diagnostics (cross-check).
3. `aiwm ops telemetry enable` / `aiwm ops telemetry send`
   - Ensure telemetry opt-in toggles, and a diagnostics JSON file is produced.
4. `aiwm ops security-scan`
   - Generates `logs/security/report-*.json`; confirm retention service prunes files older than configured window after `npm run test`.

QA should capture command output snippets and file paths in the wrap-up for traceability.
