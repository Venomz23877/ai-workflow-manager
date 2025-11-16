# Epic EP1 — Workflow Authoring

## Epic Statement

Enable workflow architects to design, validate, and manage agentic workflows through a visual canvas and supporting CLI commands without writing code.

## Goals

- Provide intuitive drag-and-drop tooling for creating nodes (Decision, WorkStep, Loop, future types).
- Surface property inspectors for configuring entry/exit actions, triggers, validators, and document bindings.
- Ensure validation feedback guides users to resolve issues before publishing or running workflows.
- Support template creation and duplication to jump-start new workflows.

## User Stories (Draft)

| ID        | Title                                         | Persona            | Priority | Status | Architecture Components                                                                                        |
| --------- | --------------------------------------------- | ------------------ | -------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| US-EP1-01 | Create workflow from blank canvas             | Workflow Architect | P0       | Draft  | Renderer (dashboard/designer), Preload IPC bridge, WorkflowDraftService, WorkflowRepository, ValidationService |
| US-EP1-02 | Add and connect nodes via drag-and-drop       | Workflow Architect | P0       | Draft  | Renderer designer canvas, WorkflowDraftService, WorkflowGraphModel, ValidationService                          |
| US-EP1-03 | Configure node entry/exit actions             | Workflow Architect | P0       | Draft  | Renderer inspector, ActionCatalog metadata, WorkflowDraftService, ConnectorRegistry                            |
| US-EP1-04 | Define triggers and validators on transitions | Workflow Architect | P0       | Draft  | Renderer transition inspector, TriggerConfigService, ValidationService, WorkflowDraftService                   |
| US-EP1-05 | View and resolve validation messages          | Workflow Architect | P0       | Draft  | ValidationService, Renderer validation panel, NotificationService, CLI validation command                      |
| US-EP1-06 | Save workflow draft and version history       | Workflow Architect | P1       | Draft  | WorkflowDraftService, WorkflowVersionRepository, LocalSqliteConnector, Autosave engine                         |
| US-EP1-07 | Duplicate workflow from template              | Workflow Architect | P1       | Draft  | WorkflowRepository, TemplateRegistry, Renderer/CLI duplication flows                                           |
| US-EP1-08 | Export workflow definition to JSON            | Integrator         | P1       | Draft  | WorkflowExportService, WorkflowRepository, CLI export command                                                  |
| US-EP1-09 | Undo/redo canvas actions                      | Workflow Architect | P1       | Draft  | Renderer command stack, WorkflowDraftService, EventStore                                                       |
| US-EP1-10 | CLI command to scaffold workflow              | Integrator         | P2       | Draft  | CLI scaffolding command set, WorkflowDraftService, TemplateRegistry                                            |

## Dependencies

- Architecture: Workflow state & persistence model, trigger engine design.
- UX: Wireframes for designer canvas, node inspector, validation overlays.
- Connectors: Node configuration references available connectors/actions.

## Notes & Open Questions

- Determine versioning scope for initial release (full history vs recent snapshot).
- Clarify how templates are stored and shared (local vs team library).
- Align CLI scaffolding commands with UI workflow schema.
