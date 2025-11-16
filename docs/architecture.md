# AI Workflow Manager — Architecture Overview

## Purpose

This document captures the application’s structural blueprint so future contributors can extend the system without reverse-engineering the codebase. It focuses on module boundaries, data flow, and extension points such as storage connectors.

## System Summary

AI Workflow Manager is an Electron-based desktop application with a React renderer, a TypeScript main process, and a shared core library. It follows a hexagonal (ports-and-adapters) architecture so the domain layer (workflow runtime, use cases) stays independent of UI or infrastructure concerns. The renderer and CLI act as driving adapters on the inbound side, while connectors, credential vault, logging, and file/document services sit on the outbound side. Data persistence is currently handled by a local SQLite database (`better-sqlite3`), but the architecture anticipates pluggable backends via outbound ports.

## High-Level Component Map

- **Inbound Adapters**
  - **Renderer (`src/renderer/`)**: React/Vite front end delivering the primary UX. Communicates with use cases over IPC using application services as ports.
  - **CLI (`src/cli/`)**: Commander-based toolkit offering parity with the UI for automation and scripting. Leverages the same application services via IPC or direct invocation.
  - **Preload (`src/preload/`)**: Context bridge exposing a curated API surface to the renderer while keeping domain services in the main process.

- **Domain Layer (`src/core/domain/`)**
  - Application services orchestrating use cases (workflow authoring, execution, document management). Implemented using command handlers and repositories.
  - Workflow runtime modeled as a state machine (consider `xstate` or custom implementation) with explicit states, events, guards, and actions.
  - Domain entities/value objects representing workflows, nodes, transitions, triggers, validators, documents.

- **Outbound Ports & Adapters**
  - **Storage Connector Port (`WorkflowDataConnector`)** with adapters (`LocalSqliteConnector`, future REST/Dynamo adapters).
  - **LLM Connector Port (`LLMConnector`)** with adapters (`ChatgptConnector`, `ClaudeConnector`) and mock implementations.
  - **File/Document Services Port (`FileConnector`, `DocumentBuilder`)** enabling local filesystem access and document generation strategies (`DocxDocumentBuilder`, `PdfDocumentBuilder`).
  - **Credential Vault Port (`CredentialVault`)** with platform-specific adapters (Windows Credential Manager, macOS Keychain, Linux Secret Service) wrapped in decorators for audit logging.
  - **Logging/Telemetry (`WorkflowEventPublisher`)** following Observer pattern to broadcast domain events to log sinks, UI subscribers, and future telemetry pipelines.

- **Infrastructure**
  - Repositories (`WorkflowRepository`, `WorkflowRunRepository`, etc.) encapsulating SQLite operations and providing persistence services to the domain.
  - Event bus within main process managing command dispatch and domain events.
  - Background workers for long-running actions, scheduled triggers, and notifications.

## Data Storage & Connector Pattern

### Goals

- Support multiple backing data systems (local SQLite, cloud-hosted REST API, future SaaS integrations).
- Allow runtime selection of a connector based on user or deployment configuration.
- Keep renderer/main layers agnostic of the actual storage implementation.

### Connector (Ports & Adapters) Pattern

1. **Port Interfaces**
   - `WorkflowDataPort`: CRUD, query, transaction support for workflows/runs.
   - `ConnectorRegistryPort`: service for registering/resolving outbound adapters at runtime.

2. **Adapters**
   - `LocalSqliteAdapter` implements ports by delegating to repositories.
   - `RestApiAdapter` (future) acts as outbound adapter translating domain operations to HTTP requests.
   - Additional adapters (DynamoDB, etc.) implement the same port; adapters can be decorated for retries/logging.

3. **Configuration & Discovery**
   - Registry maps configuration keys to adapter factories; supports lazy instantiation and hot-swapping.
   - Application services query the registry via the port, avoiding direct adapter knowledge.

4. **Cross-Cutting Concerns**
   - Decorators implement resilience (circuit breaker, retry with exponential backoff, caching).
   - Observability injects instrumentation (metrics, traces) without polluting domain logic.

5. **IPC Exposure**
   - Inbound adapters (renderer/CLI) call application services. Services interact with ports; infrastructure decides which adapter backs the port. This preserves the hexagonal boundary.

### Data Flow Example

Renderer → IPC (`get-workflows`) → Domain Service → Connector Factory → `LocalSqliteConnector` (default) → SQLite DB  
Switching to a REST backend only changes configuration: the factory instantiates `RestApiConnector` instead, leaving upstream calls untouched.

## File Access & Document Editing

- **FileConnector Interface**: Define a unified contract for file operations (`readDocument`, `writeDocument`, `listDocuments`, `convertFormat`) so workflows and UI tools remain agnostic of underlying storage (local file system, remote object store, etc.).
- **Format Support**: Initial focus on TXT, Markdown, JSON, YAML, CSV/TSV, and HTML snippets. Each format has a parser/serializer service under `src/core/files/formatters/`.
- **Integration Points**:
  - Workflow actions can invoke file services to fetch or persist artifacts.
  - LLM connectors can read/write documents as part of prompt engineering.
  - Renderer exposes editors/viewers tailored to the content type (syntax highlighting, preview panes).
- **Security Considerations**: Restrict file access to whitelisted directories and sanitize content before presenting in the UI.
- **Future Extensions**: Add adapters for cloud storage (S3, SharePoint) using the same FileConnector interface; support binary formats when dedicated tooling is available.

## Workflow Engine

- **State Machine Runtime**
  - Implemented using the State pattern (or `xstate`) with explicit state charts for each workflow. Nodes map to states; triggers become events; validators act as guards.
  - Command handlers (`StartWorkflowCommand`, `TriggerActionCommand`, etc.) coordinate state transitions and publish domain events.

- **Node Definitions**
  - Each node type describes entry actions, exit actions, available user actions, triggers, and validators. Definitions live as domain configuration objects independent of UI. See `docs/workflow-engine.md` for semantics.

- **Execution Managers**
  - Long-running actions executed by background workers using Command pattern to encapsulate side effects.
  - Domain events published via `WorkflowEventPublisher` to observers (log, notification, UI).

- **Persistence**
  - Repositories maintain workflow definitions and run state snapshots. Commands mutate aggregates; queries read from repositories. CQRS separation (lightweight) ensures UI reads don’t depend on write model internals.

- **CLI/Renderer Integration**
  - Inbound adapters translate user interactions into commands; outbound events streamed back to UI/CLI observers.

## LLM Connector Strategy

- **LLMConnector Interface**: Provides unified methods for prompt execution, streaming responses, and token usage metrics. Implementations include `ChatgptConnector` (OpenAI SDK) and `ClaudeConnector` (`@anthropic-ai/sdk`).
- **Configuration & Credential Handling**: API keys stored via credential vault, selected through settings UI or CLI commands. Connectors advertise capabilities (models, rate limits) so the UI can adjust options dynamically.
- **Testing & Mocks**: Mock connectors simulate responses for offline use and automated tests, ensuring workflows can run without external dependencies.

## Document Generation Capabilities

- **Strategy Pattern**: `DocumentBuilder` interface with concrete strategies (`DocxBuilder`, `PdfBuilder`, `HtmlExporter`, `MarkdownExporter`). Enables consistent APIs for building and saving documents.
- **Composite Templates**: Templates composed of sections; allow DocumentBuilder to traverse composite structures (header, body, appendices). Facilitates reuse across nodes.
- **Action Integrations**: Workflow actions use builders via ports, enabling node actions to request document generation without knowing the underlying format.
- **Template Management**: Template registry interacts with document services to fetch template components and apply transformations before builder execution.
- **DocumentRegistry**: Stores metadata for standalone documents/templates (format, tags, linked workflows) and exposes APIs to editors, CLI, and export pipelines.
- **TemplateRegistry**: Tracks reusable workflow templates, their dependencies (connectors, documents), permissions, and version history. Template publish/export flows operate through this registry.

## Run Artifacts & Downloads

- `ArtifactsService` aggregates outputs produced during workflow runs (documents, logs, metadata) and stores descriptors in the persistence layer for later retrieval.
- Bundler module packages requested artifacts into ZIP bundles along with run summary JSON, hash, and audit metadata to support download/export stories.
- Renderer execution console and CLI commands stream artifact metadata from the same service, ensuring parity for download progress, filtering, and access controls.

## Automation & Scheduling

- `SchedulerService` stores cron-like definitions referencing workflows and profiles. It triggers WorkflowRuntime via the same command bus used by manual runs, ensuring consistent validation and credential handling.
- Schedules persist in SQLite (`workflow_schedules` table) with fields for cron expression, timezone, profile, last_run_status, and next_run_at.
- Scheduler integrates with NotificationService to send alerts on failures or missed runs, and respects quiet hours defined in NotificationPreferenceService.
- CLI and future UI surfaces interact with SchedulerService through a shared API for add/list/pause/resume/export operations.

## Template & Sharing Services

- `TemplateExportService` bundles workflow definitions, associated documents, and dependency manifests into signed packages. Uses DocumentRegistry and ConnectorRegistry metadata to build manifests.
- `TemplateImportService` verifies signatures/checksums, validates dependencies, and registers templates in TemplateRegistry. Supports dry-run previews and audit logging.
- Permission metadata (owner, reviewer, consumer roles) stored alongside template records to enforce access control in both UI and CLI.

## Backup & Recovery

- `BackupService` orchestrates creation of encrypted archives containing workflows, templates, documents, configuration, schedules, and connector metadata (never raw secrets). Archives include manifests and checksums for verification.
- Restore flows validate archives, preview contents, apply changes transactionally, and roll back on failure. Integrates with AuditLogService for traceability.
- Automatic backups leverage SchedulerService plus retention policies managed via ConfigService.
- CredentialVault participates by exporting only metadata/IDs; actual secrets must be re-entered post-restore.

## Security & Vulnerability Monitoring

- `SecurityScanner` wraps `npm audit` (and future advisory feeds) to produce structured vulnerability reports stored under logs/security. Integrates with NotificationService for high-severity findings and with ConfigService for scan schedules.
- Acknowledgment workflow stores remediation targets in ConfigService/AuditLogService, allowing dashboards to highlight overdue fixes.

## UX & Settings Architecture

- **Visual Designer**: Planned renderer module featuring drag-and-drop node palette, connection editing, property inspector, and validation feedback. Backed by the same serialized workflow format used by the runtime.
- **Settings Panels**: Centralized configuration UI for connectors, credentials, document paths, and workflow defaults. Mirrors CLI commands for parity.
- **Editors**: Embed syntax-highlighted editors for text/Markdown/JSON/YAML, structured viewers for CSV/TSV, and HTML preview/editing capabilities.
- **CLI Parity**: CLI commands expose critical management tasks (connector selection, credential updates, workflow execution) to support headless operation.

## Security, Logging, and Operations

- **Credential Vault**
  - Vault port implemented by platform-specific adapters; decorated with audit logging and caching.
  - Supports rotation workflows, master password fallback, and CLI access.
  - Secrets retrieved on-demand; domain services receive opaque tokens or client instances rather than raw keys.

- **Logging/Telemetry**
  - `WorkflowEventPublisher` acts as central observer hub. Logging adapters subscribe to publish structured JSON logs.
  - Telemetry exporters (future) subscribe separately to send anonymized metrics.
  - Ensure correlation IDs propagate through commands/events for traceability.

- **Testing Strategy**
  - Separate command-handling tests (domain), adapter contract tests, and end-to-end scenario tests.
  - Use mock adapters for connectors in unit tests; integration tests run against SQLite fixture.
- **In-App Test Console**
  - Renderer diagnostics screen that lists automated component tests (unit smoke, integration harnesses, CLI checks) and allows running them directly from the UI.
  - Main process exposes a `TestRunnerService` that spawns test commands/scripts and streams results back to the renderer via IPC, storing summaries for later review.
  - Supports filtering tests by component (WorkflowRuntime, ConnectorRegistry, DocumentBuilder, etc.) and captures logs/artifacts (e.g., JSON reports) for download.
  - Integrates with AuditLogService and NotificationService to record test executions and alert on failures.

- **Packaging Considerations**
  - Installer runs migration commands, seeds sample workflows, and verifies vault availability.
  - Error handling includes rollback strategy if migrations fail.

## Architecture Expansion Work Items

The following sections outline specifications that remain to be fully defined. Each subsection will be expanded during the current specification sprint.

### Workflow State & Persistence Model

- **Domain Schema**
  - `workflows` table (id, name, description, status, version, created_at, updated_at).
  - `workflow_versions` table for immutable snapshots (workflow_id, version_number, definition_json, changelog, created_by).
  - `workflow_nodes` table (id, workflow_version_id, type, label, entry_actions_json, exit_actions_json, metadata_json).
  - `workflow_transitions` table (id, workflow_version_id, source_node_id, target_node_id, trigger_config_json, validator_config_json).
  - `workflow_templates` table referencing curated, reusable definitions.
- **Runtime State**
  - `workflow_runs` table (id, workflow_version_id, status, started_at, completed_at, current_node_id, context_json).
  - `workflow_run_events` table (timestamp, run_id, type, payload_json, emitter) to record node entry/exit, trigger evaluation, validator outcomes.
  - Snapshots stored as compressed JSON blobs capturing `context_json` plus node-specific state to enable pause/resume.
- **Runtime Services**
  - `RunStateSnapshotService` captures/restores snapshots for pause/resume/restart scenarios, coordinating with WorkflowRuntime and persistence layer.
- **Storage Strategy**
  - Use normalized SQLite schema for queryability; keep versioned definitions as JSON to preserve structure with minimal migrations.
  - Apply migration tooling (e.g., `better-sqlite3-migrations`) with semantic versioning of schema.
  - Maintain at least the last 10 workflow versions locally; allow configuration to purge older versions.
- **Versioning Policy**
  - Auto-increment version on “publish” events; drafts stored in `workflow_drafts` table until published.
  - Support diff by comparing `definition_json`; future enhancement: JSON diff viewer in UI.
  - Branching/version comparisons deferred—track as Future Work.
- **Snapshots & Auditing**
  - Capture snapshot on pause, manual save, and prior to upgrade migrations.
  - Retain run events for 90 days (configurable); export CLI command to archive older history.
- **Open Questions**
  - Should we encrypt portions of `context_json` that may contain sensitive AI inputs?
  - Do we need referential integrity between templates and workflows for governance?
  - What is the default retention period for completed run snapshots?

### Trigger & Event Engine

- **Core Concepts**
  - Event bus runs inside the main process using typed channels (`workflow:trigger`, `workflow:validator`, `workflow:loop`).
  - Supports priority queue (Immediate > Scheduled > Deferred) with configurable concurrency per workflow.
  - Events persisted to `workflow_run_events` table to allow replay and debugging.
- **Trigger Evaluation**
  - Immediate triggers fire synchronously after entry/exit actions complete; validators run before transition commits.
  - Scheduled triggers register with a timer service (setInterval equivalent) stored in `workflow_run_schedules`.
  - External triggers (CLI commands, webhook integrations) enqueue events via IPC API; require authentication layer.
- **Validator Execution**
  - Validators execute in defined order; failure short-circuits transition and raises `validator_failed` event.
  - Provide retry count and cool-down configuration to avoid rapid re-fire.
  - Validation results surfaced to UI via IPC stream and recorded in run events.
- **Loop Management**
  - Loop nodes maintain iteration counters within `context_json`; guardrails enforce max iterations, timeout, and manual override flag.
  - `loop_iteration` events log each cycle; `loop_throttle` policy prevents rapid loops (e.g., minimum delay config).
  - Manual break triggers set `loop.break=true` in context and transition to fallback node.
- **Error Handling & Observability**
  - Failed triggers/validators captured with stack traces; error severity dictates whether workflow pauses or continues.
  - Notification subsystem (UI toast + optional email future) subscribes to failure events.
  - Provide CLI command to inspect pending trigger queue and force execution.
- **Open Questions**
  - Should we expose a declarative schedule syntax (cron-like) for scheduled triggers?
  - How do we authenticate or rate limit external trigger sources (webhook security)?
  - Do we allow custom validator scripting in early versions or limit to predefined actions?

### Credential Vault Implementation

- Enumerate target keychain providers (Windows Credential Manager, macOS Keychain, Linux Secret Service) and fallback encrypted file format.
- Define vault API (save, retrieve, rotate, audit) plus CLI bindings.
- Plan for backup/export and multi-user machine considerations.
- Open questions:
  - Do we require master password setup when OS keychain unavailable?
  - How do we handle headless/server deployments?

### Document Template Registry

- Describe template catalog storage (database tables + filesystem pointers).
- Capture dependency graph between templates and workflow nodes for change detection.
- Plan version metadata, approval workflows, and rollback behavior.
- Open questions:
  - What diff tooling is needed for template reviews?
  - Should templates live inside user profiles or shared workspace directories?

### LLM Connector Lifecycle

- Specify rate limit handling, exponential backoff, and circuit breaker rules.
- Define streaming protocol support and content filtering hooks.
- Determine prompt/response logging retention respecting security requirements.
- Open questions:
  - Where do we persist token usage metrics?
  - How do we redact sensitive inputs before logging?

### Logging & Telemetry Pipeline

- Choose log format (structured JSON) and storage location per platform.
- Decide on local viewer vs external export, plus retention/rotation policies.
- Plan opt-in telemetry upload (if any) with anonymization steps.
- Open questions:
  - Do we integrate with existing monitoring tools or ship a simple viewer?
  - How are user-submitted error reports packaged?

### Installer & First-Run Initialization

- Map native dependencies (better-sqlite3, docx, pdf-lib) to packaging steps.
- Define first-run wizard tasks (create data directories, prompt for credentials, import sample workflows).
- Plan upgrade strategy (migration scripts, backup automation).
- Open questions:
  - How do we detect corrupt or partial installations?
  - What telemetry (if any) confirms successful activation?

### Collaboration & Sharing Roadmap

- Outline export/import format for workflows and templates (JSON, signed packages).
- Consider future multi-user synchronization (shared folders, git integration, remote store).
- Identify short-term sharing mechanisms (manual export, CLI commands).
- Open questions:
  - Do we reserve IDs or namespaces for future cloud sync?
  - What metadata is needed for ownership and permissions?

## Build and Distribution Pipeline

- **Build Outputs**: `npm run build` creates `dist/renderer`, `dist/main/main.js`, and `dist/preload/preload.js`. `npm run build:cli` compiles the CLI to `dist/cli/cli/index.js`.
- **Packaging**: `npm run package` (or platform-specific variants) invokes `electron-builder`, producing installers in `release/`.
- **Rule Reference**: see `.cursor/rules/build-installer.mdc` for the packaging checklist.

## Configuration Management

- Centralize runtime configuration (connector selection, API endpoints, auth) under `src/core/config/`.
- Provide environment-aware defaults and allow overrides through CLI flags, GUI settings screens, or environment variables.
- `ConfigService` exposes typed getters/setters consumed by renderer settings panels, CLI, and background services.
- `NotificationPreferenceService` stores per-user alert preferences and quiet hours, sharing the same persistence layer as other settings.
- `FileSandboxGuard` enforces the directory allowlist configured through settings/CLI before any file connector reads or writes.
- Settings orchestrator (`SettingsFacade`) coordinates connector registry updates, credential vault operations, and audit logging so UI/CLI stay consistent.

## Future Enhancements

- **Connector Toolkit**: Scaffolding scripts to generate new connectors with test stubs and documentation links.
- **Testing Strategy**: Contract tests per connector to verify they honor the common interface using shared fixtures.
- **Security**: Secrets management for cloud connectors (encrypted storage, OS keychains).
- **Sync Layer**: For remote sources, add offline caching and conflict resolution strategies within the core layer.

## Documentation Links

- Quick start and packaging steps: `QUICKSTART.md`, `README.md`
- Process guardrails: `.cursor/rules/`
- Session history and objectives: `.ai_working/wrapup.md`
