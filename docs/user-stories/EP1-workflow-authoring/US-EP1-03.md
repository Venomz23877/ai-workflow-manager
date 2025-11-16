# Story: Configure node entry and exit actions

- **Epic**: EP1 — Workflow Authoring
- **Persona**: Workflow Architect
- **Priority**: P0
- **Status**: Draft

## Context

After placing nodes and connections, architects need to describe what each node does. Entry actions capture the automated steps (e.g., run an LLM prompt, fetch external data) performed when the node activates, while exit actions define persistence or notifications fired on completion. This story ensures the designer UI and CLI expose structured forms for configuring those actions consistently.

## User Story

As a workflow architect, I want to configure entry and exit actions for each node so that the workflow runtime performs the right AI calls, document operations, and side effects when nodes start and finish.

## Acceptance Criteria

```
Given I have selected a node on the canvas
When I open the Actions tab in the inspector
Then I can add, remove, and reorder entry actions from a predefined catalog (LLM prompt, file read/write, document builder, connector call)

Given I configure an entry action that requires parameters
When I fill out the form (e.g., prompt text, connector selection)
Then validation occurs inline with helpful errors if required fields are missing

Given a node already has entry and exit actions defined
When I duplicate the node or entire workflow
Then the duplicated node retains its action definitions

Given I edit exit actions for a node that is part of a published workflow version
When I save the draft changes
Then a change indicator appears, and publishing requires revalidation

Given I configure an action referencing credentials or files
When those dependencies are missing or invalid
Then the UI surfaces warnings and deep links to settings or file sandbox configuration
```

## UX References

- `docs/ux/narratives/designer.md` — Inspector tabs
- `docs/ux/wireframes/designer.md`

## Technical Notes

- Impacts modules: `renderer` (inspector UI), `main` (IPC handlers), `core` (node configuration schema).
- Requires action catalog metadata so UI and CLI can render dynamic forms.
- Persist action sequences within workflow JSON definition; order must be deterministic for undo/redo.
- Open questions:
  - How do we support custom action plugins authored by integrators?
  - Do we allow inline scripting or only declarative configuration in v1?
