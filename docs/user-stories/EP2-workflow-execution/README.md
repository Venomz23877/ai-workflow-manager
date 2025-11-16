# Epic EP2 — Workflow Execution & Monitoring

## Epic Statement

Provide operators with real-time visibility and control over running workflows through the execution console, notifications, and CLI parity.

## Goals

- Surface current node, action queue, triggers, and validator status during execution.
- Allow manual intervention (invoke actions, force transitions, pause/resume) via UI and CLI.
- Capture run history, logs, and generated artifacts for review.
- Notify users of failures, validation blocks, or manual action requirements.

## User Stories (Draft)

| ID        | Title                                        | Persona            | Priority | Status | Architecture Components                                                                                |
| --------- | -------------------------------------------- | ------------------ | -------- | ------ | ------------------------------------------------------------------------------------------------------ |
| US-EP2-01 | Launch workflow run from dashboard           | Operations Analyst | P0       | Draft  | Renderer dashboard, RunLaunchService, WorkflowRuntime, CredentialVault                                 |
| US-EP2-02 | View current node status and timeline        | Operations Analyst | P0       | Draft  | ExecutionConsole UI, WorkflowRuntime, WorkflowEventPublisher, LoggingPipeline                          |
| US-EP2-03 | Invoke node action from execution console    | Operations Analyst | P0       | Draft  | ExecutionConsole node-actions panel, ActionInvocationService, WorkflowRuntime                          |
| US-EP2-04 | Trigger node action via CLI command          | Operations Analyst | P0       | Draft  | CLI command surface, ActionInvocationService, WorkflowRuntime, WorkflowEventPublisher                  |
| US-EP2-05 | Pause and resume workflow run                | Operations Analyst | P0       | Draft  | WorkflowRuntime state machine, RunStateSnapshotService, ExecutionConsole UI, CLI runs commands         |
| US-EP2-06 | Receive alert when validator fails           | Operations Analyst | P0       | Draft  | ValidationService, NotificationService, Dashboard notifications rail, CLI monitor                      |
| US-EP2-07 | Download run summary and generated documents | Operations Analyst | P1       | Draft  | DocumentBuilder services, FileConnector, ArtifactsService, ExecutionConsole UI, CLI artifacts commands |
| US-EP2-08 | Restart workflow from specific node          | Operations Analyst | P1       | Draft  | WorkflowRuntime, RunSnapshotService, ExecutionConsole restart flow, CLI restart command                |
| US-EP2-09 | Stream structured logs to file/terminal      | Integrator         | P1       | Draft  | WorkflowEventPublisher, Logging/Telemetry pipeline, ExecutionConsole log bar, CLI monitor              |
| US-EP2-10 | Configure notification preferences           | Operations Analyst | P2       | Draft  | Settings UI (notifications), NotificationPreferenceService, ConfigService, CLI notification commands   |

## Dependencies

- Architecture: Trigger/event engine, logging pipeline, workflow persistence.
- UX: Wireframes for execution console, notifications panel, CLI output.
- Connectors: Access to document services and LLM connectors during runs.

## Notes & Open Questions

- Define retention policy for run history and logs.
- Clarify alert delivery channels (in-app, email, future integrations).
- Determine how partial runs interact with workflow versioning.
