# Story: Manage document template library

- **Epic**: EP4 — Document Management
- **Persona**: Workflow Architect
- **Priority**: P0
- **Status**: Draft

## Context

Architects curate reusable document templates (Markdown, HTML, DOCX skeletons) that workflows reference. They need a centralized library to browse, tag, duplicate, and attach templates to nodes.

## User Story

As a workflow architect, I want to manage a document template library so that I can reuse curated content across workflows.

## Acceptance Criteria

```
Given I open the Templates tab in the document workspace
When the library loads
Then I see templates listed with format, tags, last modified, and usage count; filters allow search by tag or format

Given I select a template
When I click “Attach to node”
Then I can choose target workflows/nodes and the association is persisted in the workflow definition

Given I duplicate a template
When I confirm new metadata
Then the copy retains content but receives a new ID and version history starts at v1

Given templates are stored on disk/database
When I delete one
Then the UI warns me about workflows referencing it and prevents deletion unless reassignment occurs

Given CLI usage
When I run `aiwm docs templates list --json`
Then I receive the same metadata plus references to dependent workflow nodes
```

## Architecture Components

- `DocumentRegistry` (stores template metadata, tags, usage)
- `DocumentBuilder` + format adapters (for previewing)
- `WorkflowRepository` (tracks node ↔ template bindings)
- `FileConnector` (reads/writes template files)
- Renderer document workspace + CLI document commands

## UX References

- `docs/ux/narratives/document-workspace.md`
- `docs/ux/wireframes/document-workspace.md`

## Technical Notes

- Template metadata table includes `format`, `tags`, `version`, `usage_count`.
- Need referential integrity between templates and workflows; deletion requires fallback assignment.
- Provide CLI parity for list/duplicate/delete/attach.
