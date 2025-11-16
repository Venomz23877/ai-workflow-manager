# Story: Undo and redo canvas actions

- **Epic**: EP1 — Workflow Authoring
- **Persona**: Workflow Architect
- **Priority**: P1
- **Status**: Draft

## Context

Designing workflows involves experimentation. Authors must undo/redo structural changes (add/remove nodes, connections, property edits) without fear. The feature should work via keyboard shortcuts, toolbar buttons, and CLI commands (event log replay).

## User Story

As a workflow architect, I want undo/redo support in the designer so that I can iterate quickly and recover from mistakes.

## Acceptance Criteria

```
Given I add nodes or transitions
When I press Ctrl+Z (or toolbar Undo)
Then the most recent change is reverted, and the canvas animates back to previous state

Given I undo several actions
When I press Ctrl+Shift+Z (Redo)
Then changes replay in order with the same animations/validation updates

Given I undo past an autosave point
When I attempt to leave
Then the app prompts whether to keep the current state or revert to the autosaved snapshot

Given multiple users edit sequentially on the same machine profile
When undo history is restored
Then it only includes actions from the current session (per user) to avoid cross-user confusion

Given I run `aiwm workflows history undo --steps 1`
When executed
Then the CLI replays the event log to revert the last change and prints summary output
```

## UX References

- `docs/ux/narratives/designer.md` — Undo/redo interactions
- `docs/ux/wireframes/designer.md` — Footer controls

## Technical Notes

- Maintain command/event stack with serialization to support CLI undo.
- Certain irreversible actions (deleting documents) should require confirmation before being added to stack.
- Need guardrail for memory usage on very large workflows (cap stack length, allow manual snapshot).
- Open questions: Do we expose history timeline UI beyond simple undo/redo?
