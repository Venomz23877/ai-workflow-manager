# Story: Edit Markdown/HTML with live preview

- **Epic**: EP4 — Document Management
- **Persona**: Workflow Architect
- **Priority**: P0
- **Status**: Draft

## Context

Docs tied to workflows often exist as Markdown or HTML. Authors need a split editor with syntax highlighting, preview, autosave, and workflow-awareness (revalidation prompts).

## User Story

As a workflow architect, I want to edit Markdown/HTML documents with a live preview so that I can polish content without leaving the app.

## Acceptance Criteria

```
Given I open a Markdown document
When I type in the editor
Then syntax highlighting updates in real time and the preview pane refreshes within 200ms, respecting reduced-motion settings

Given I toggle preview
When disabled
Then the editor expands full width and preview stays hidden until re-enabled

Given I switch to HTML mode
When editing
Then the preview renders sanitized HTML, warning me about unsafe tags

Given I pause typing
When idle > 5s
Then autosave writes the document and shows timestamp in footer

Given I click “Save & Revalidate”
When doc is linked to workflows
Then the system flags dependent nodes for revalidation and displays a banner summarizing impacted workflows
```

## Architecture Components

- DocumentWorkspace renderer module (editor + preview)
- Markdown/HTML formatter services under `src/core/files/formatters/`
- Autosave engine (shared with workflow drafts)
- WorkflowDocumentLinkService (flags dependent nodes)
- Notification/Validation services for downstream revalidation prompts

## UX References

- `docs/ux/narratives/document-workspace.md`
- `docs/ux/wireframes/document-workspace.md`

## Technical Notes

- Editor built on Monaco/CodeMirror with markdown/HTML modes and accessibility support.
- Preview uses sanitized HTML renderer, inline CSS respecting theme.
- Autosave leverages debounced persistence; collisions handled via revision system (US-EP4-04).
