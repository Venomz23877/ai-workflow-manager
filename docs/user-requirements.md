# User Needs & Application Requirements

This document captures the initial set of user-facing requirements guiding AI Workflow Manager. It will evolve as we refine personas and gather feedback.

## Primary Personas

1. **Workflow Architect**
   - Designs multi-step AI processes for internal teams or clients.
   - Needs drag-and-drop tooling, reusable templates, and clear execution semantics.

2. **Operations Analyst**
   - Executes existing workflows, monitors progress, and reviews outputs.
   - Prefers guided UI but may rely on CLI for automation.

3. **Integrator / Developer**
   - Extends the system with new connectors, actions, and automation scripts.
   - Requires documentation, SDKs, and test harnesses.

## High-Level Goals

- Rapidly build and iterate on AI-assisted workflows with visual tooling and CLI support.
- Blend local reliability (bundled SQLite, offline-ready document handling) with optional remote integrations (LLM APIs, future data stores).
- Maintain a consistent user experience regardless of underlying connectors or storage locations.
- Provide secure, auditable handling of credentials and sensitive outputs.

## Primary Use Cases

1. **AI Sales Playbook Assistant**
   - _Scenario_: A sales operations lead designs a workflow that qualifies inbound leads, drafts personalized outreach emails, and schedules follow-up tasks.
   - _Flow_: Decision node checks CRM data → WorkStep node generates tailored email via ChatGPT connector → Loop node iterates until email passes validation and attachments are added → Document action exports the final outreach packet to DOCX and PDF.

2. **Internal Policy Review Pipeline**
   - _Scenario_: A compliance officer automates policy updates by aggregating regulations, summarizing changes, and generating Markdown documentation for the intranet.
   - _Flow_: WorkStep node fetches latest regulations via REST connector → Loop node refines summaries with Claude until confidence threshold met → WorkStep node updates local Markdown/HTML docs → Trigger publishes to shared folder once validators pass.

3. **Marketing Content Iteration Lab**
   - _Scenario_: A marketing strategist manages creative iterations on campaign copy with team feedback captured through the CLI.
   - _Flow_: Decision node branches based on brand tone → WorkStep node drafts content and images → Loop node cycles revisions while team members trigger actions from CLI → Document service exports final assets (HTML snippets + PDF brief).

4. **Data Analysis & Reporting Bot**
   - _Scenario_: A data analyst composes a workflow that pulls CSV data, runs AI-assisted analysis, and outputs a structured report.
   - _Flow_: WorkStep node reads local CSV via file connector → Decision node selects analysis path (trend vs anomaly) → WorkStep node crafts narrative using LLM → Document action produces combined Markdown and PDF report with charts embedded.

5. **Customer Support Playbook Generator**
   - _Scenario_: A support manager creates tailored troubleshooting guides for new product releases.
   - _Flow_: WorkStep node ingests product specs (JSON/YAML) → Loop node iterates Q&A generation until validators confirm coverage → Decision node routes guides by audience (internal vs customer) → Outputs stored as HTML knowledge-base pages and DOCX manuals.

## Functional Requirements

### Workflow Authoring & Execution

- Users can create workflows composed of nodes (Decision, WorkStep, Loop, etc.) with entry/exit actions, triggers, and validators.
- Visual editor supports drag-and-drop node placement, connector wiring, property editing, and validation.
- CLI tooling enables scriptable creation, modification, and execution of workflows.
- Runtime state machine persists workflow progress, allowing pause/resume and history inspection.
- Workflows can invoke document-generation actions (DOCX/PDF/HTML) and file mutations (TXT/MD/JSON/YAML/CSV).
- Nodes can call AI services through pluggable connectors (ChatGPT, Claude) with consistent UI/CLI interfaces.

### Connectors & Integrations

- Default storage connector uses bundled SQLite; users can configure remote storage via documented connector contracts.
- LLM connectors are selectable per workflow or globally, with credential input via settings UI/CLI.
- File connectors handle local filesystem access securely, paving the way for future remote storage adapters.
- Document services encapsulate library usage (`docx`, `pdf-lib`) for generating Microsoft Word and PDF artifacts.

### Credential & Configuration Management

- API keys and secrets are stored securely using OS keychain integration or encrypted local store.
- Settings UI and CLI provide CRUD operations for credentials, connector selection, document paths, and workflow defaults.
- Configuration changes trigger validation and safe reload of impacted services.

### User Interaction

- Renderer offers dashboards for workflow selection, node execution status, and document previews.
- Editors provide syntax highlighting, validation, and previews for supported file types; HTML previews display rendered content side-by-side.
- CLI commands mirror UI functionality for headless operation and automation scripts.
- Notification system surfaces workflow events (trigger fires, validator failures, document creation).

### Testing & Reliability

- Contract tests ensure all connectors comply with shared interfaces.
- Integration tests cover end-to-end scenarios (workflow execution, document generation, connector interactions).
- Packaging includes smoke tests for installers and post-install validation scripts.
- Logging/telemetry layers capture key metrics and errors; logs are user-accessible for troubleshooting.

## Non-Functional Requirements

- **Security**: Sensitive data is isolated; connectors obey least-privilege access; logs avoid leaking secrets.
- **Performance**: Workflow actions should provide responsive feedback; long-running tasks stream progress updates.
- **Extensibility**: Plug-in architecture for connectors, nodes, and actions with clear documentation.
- **Portability**: Installers support Windows/macOS/Linux; offline mode remains usable when remote services are unavailable.
- **Usability**: Visual designer and editors emphasize clarity, undo/redo support, and contextual help.

## Open Questions / Future Research

- Advanced collaboration features (multi-user editing, version history).
- Remote storage connectors (cloud databases, file services).
- Workflow simulation/testing sandbox.
- Policy enforcement (guardrails, compliance checks).
- Integration with external task runners or orchestration systems.

## References

- `docs/architecture.md` — detailed system design and module breakdown.
- `docs/workflow-engine.md` — node taxonomy and runtime semantics.
- `.ai_working/project_todo.md` — backlog of planned enhancements.
- `docs/press-release.md` — narrative framing for launch positioning.

---

This requirements document should be reviewed at the start of each major planning cycle to align scope, prioritize features, and track assumptions.
