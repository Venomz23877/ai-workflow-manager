# Epic EP6 — Templates & Sharing

## Epic Statement

Provide a workflow/template library that teams can publish, share, export/import, and keep up to date across organizations.

## Goals

- Curate template gallery with metadata, personas, and tags.
- Support export/import (signed packages) for sharing workflows and documents.
- Handle template versioning, deprecation notices, and notifications to dependent workflows.
- Offer CLI parity for template management.

## User Stories

| ID        | Title                                         | Persona            | Priority | Status | Architecture Components                                                   |
| --------- | --------------------------------------------- | ------------------ | -------- | ------ | ------------------------------------------------------------------------- |
| US-EP6-01 | Browse and filter workflow templates          | Workflow Architect | P0       | Draft  | TemplateRegistry, Renderer template gallery, WorkflowRepository           |
| US-EP6-02 | Publish workflow as reusable template         | Workflow Architect | P0       | Draft  | WorkflowRepository, TemplateRegistry, DocumentRegistry, ValidationService |
| US-EP6-03 | Notify users of template updates/deprecations | Operations Analyst | P1       | Draft  | TemplateRegistry, NotificationService, Dashboard                          |
| US-EP6-04 | Export/import templates as signed packages    | Integrator         | P1       | Draft  | TemplateExportService, ConnectorRegistry metadata, CLI template commands  |
| US-EP6-05 | Manage template permissions and ownership     | Administrator      | P1       | Draft  | AuthZ layer, TemplateRegistry, AuditLogService                            |
| US-EP6-06 | CLI template library operations               | Integrator         | P2       | Draft  | CLI template commands, TemplateRegistry, DocumentRegistry                 |

## Dependencies

- Architecture: Template registry, workflow export schema, notification subsystem.
- UX: Dashboard/template gallery narratives, document workspace references.
- Security: Signing/encryption for template packages.

## Notes & Open Questions

- Decide how templates reference connector/document requirements when shared externally.
- Determine signing strategy (org certificates vs manual hashing).
