# Epic EP5 — Automation & CLI

## Epic Statement

Provide a powerful CLI and automation surface so operators and integrators can script workflows, schedule runs, and manage the platform headlessly.

## Goals

- CLI parity with UI for workflow lifecycle, connector management, document editing.
- Support scripting pipelines (JSON output, exit codes, watch modes).
- Enable scheduling, profiles, and remote execution hooks.
- Ensure guardrails (permission checks, audit logs) apply across CLI automation.

## User Stories

| ID        | Title                                   | Persona            | Priority | Status | Architecture Components                                                      |
| --------- | --------------------------------------- | ------------------ | -------- | ------ | ---------------------------------------------------------------------------- |
| US-EP5-01 | Run workflows headlessly via CLI        | Integrator         | P0       | Draft  | CLI workflow commands, WorkflowRuntime, CredentialVault, Logging pipeline    |
| US-EP5-02 | Schedule recurring workflow runs        | Operations Analyst | P0       | Draft  | SchedulerService, CLI scheduling commands, WorkflowRuntime                   |
| US-EP5-03 | Manage CLI profiles and environments    | Integrator         | P1       | Draft  | ConfigService (profiles), CredentialVault, CLI config commands               |
| US-EP5-04 | Pipe CLI output to automation pipelines | Integrator         | P1       | Draft  | CLI JSON output, WorkflowEventPublisher, Logging pipeline                    |
| US-EP5-05 | Script connector/credential setup       | Integrator         | P1       | Draft  | CLI connectors commands, ConnectorRegistry, CredentialVault, AuditLogService |
| US-EP5-06 | Enforce permissions and audit in CLI    | Administrator      | P2       | Draft  | AuthN/AuthZ layer, CredentialVault, AuditLogService, CLI middleware          |

## Dependencies

- Architecture: WorkflowRuntime, ConnectorRegistry, CredentialVault, Logging/Event infrastructure.
- UX: CLI companion narrative/wireframes (ASCII outputs).
- Ops: Scheduler and audit log requirements from EP7.

## Notes & Open Questions

- Determine authentication strategy for CLI on shared machines (profiles vs API tokens).
- Align scheduling story with future UI scheduler (possible EP6/EP7 overlap).
