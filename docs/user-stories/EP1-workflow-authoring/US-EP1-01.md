# Story: Create workflow from blank canvas

- **Epic**: EP1 — Workflow Authoring
- **Persona**: Workflow Architect
- **Priority**: P0
- **Status**: Draft

## Context

Workflow architects need a fast path to spin up new automations without starting from templates. The blank canvas experience should feel approachable yet powerful, guiding users to define core metadata (name, description) and providing visual affordances for the first nodes. This story ensures the foundational “create workflow” capability exists before more advanced authoring features (templates, duplication).

## User Story

As a workflow architect, I want to create a new workflow from a blank canvas so that I can start mapping a custom agentic process tailored to my team’s needs.

## Acceptance Criteria

```
Given I am on the dashboard
When I select “Create Workflow” and choose “Blank Workflow”
Then a new workflow draft is created with default metadata (untitled, version 0) and I am taken to the visual designer canvas

Given the blank canvas is open
When no nodes exist yet
Then the UI displays onboarding hints explaining how to drag nodes from the palette

Given the blank workflow draft is open
When I edit the workflow name and description in the header
Then the draft metadata is saved locally without requiring a publish action

Given I close the designer without adding nodes
When I return to the dashboard
Then the workflow appears in the list as a draft with the last edited timestamp and can be reopened

Given I am using a keyboard and screen reader
When focus enters the blank canvas
Then the hints are announced and I can navigate to the palette using keyboard controls

Given the app loses power or crashes during editing
When I reopen AI Workflow Manager
Then the draft workflow is restored to the last auto-saved state with a banner noting recovery
```

## UX References

- `docs/ux-flows.md#A.-Designing-a-New-Workflow` (narrative flow)
- Wireframe placeholder: `docs/ux/wireframes/designer.md` (to be added)

## Technical Notes

- Impacts modules: `renderer` (dashboard, designer), `main` (workflow draft IPC handlers), `core` (workflow draft persistence)
- Dependencies: Workflow state & persistence model (`workflows`, `workflow_drafts` tables)
- Open Questions:
  - Should the onboarding hints include interactive tooltips or static text?
  - Do we auto-create a first node stub or leave the canvas empty?
