# Story: Publish workflow as reusable template

- **Epic**: EP6 — Templates & Sharing
- **Persona**: Workflow Architect
- **Priority**: P0
- **Status**: Draft

## Context

Once a workflow is tested, architects should publish it as a template available to others. Publishing should run validation, capture metadata, and push references to the template registry.

## User Story

As a workflow architect, I want to publish a workflow as a reusable template so that teammates can adopt it quickly.

## Acceptance Criteria

```
Given I am viewing a workflow
When I click “Publish as template”
Then a modal asks for template metadata (title, persona, description, tags, connectors/documents required) and runs validation before publishing

Given validation fails
When I attempt to publish
Then the modal blocks publishing and points me to unresolved issues

Given publishing succeeds
When complete
Then the template appears in the gallery with status “New” and notifies relevant teams via dashboard notifications

Given template versioning
When I update a workflow and re-publish
Then the registry records a new template version while retaining history

Given CLI usage
When I run `aiwm templates publish onboarding --meta meta.json`
Then the command validates, publishes, and prints template ID/version
```

## Architecture Components

- WorkflowRepository & WorkflowExportService
- TemplateRegistry (metadata, versioning)
- ValidationService (pre-publish check)
- NotificationService (publish announcements)
- CLI template publish command

## UX References

- `docs/ux/narratives/designer.md` (export/publish controls)
- Template gallery narrative (TBD)

## Technical Notes

- Template entry stores pointer to workflow definition version plus document/template dependencies.
- Consider approval workflow for template publishing (future).
