# Story: Add and connect nodes via drag-and-drop

- **Epic**: EP1 — Workflow Authoring
- **Persona**: Workflow Architect
- **Priority**: P0
- **Status**: Draft

## Context

After creating a blank workflow, architects must rapidly assemble nodes and transitions. The drag-and-drop experience should be smooth with visual feedback, snapping, and accessible alternatives (keyboard-based placement). This story defines the core interaction for building the workflow graph.

## User Story

As a workflow architect, I want to drag nodes from the palette onto the canvas and connect them so that I can outline the control flow of my automation.

## Acceptance Criteria

```
Given the designer canvas is open
When I drag a node type (Decision, WorkStep, Loop) from the palette onto the canvas
Then the node is placed at the drop location with a default label and selected state

Given a node is selected on the canvas
When I press the keyboard shortcut (e.g., Enter) or use the context menu to rename it
Then I can change the node label and it updates immediately in the workflow definition

Given two nodes exist on the canvas
When I drag from the source node’s connector handle to a target node
Then a transition line appears, and a configuration drawer opens to define triggers/validators

Given a transition line is highlighted
When I press Delete or choose “Remove Transition” from the context menu
Then the connection is removed and the workflow definition updates

Given the canvas has multiple nodes
When I use keyboard navigation (arrow keys + Enter) to move focus between nodes
Then I can initiate a connection using keyboard shortcuts without a mouse

Given two nodes are already connected
When I attempt to create a duplicate connection between the same source and target
Then the system prevents the duplicate and surfaces a tooltip explaining the constraint

Given the network or storage layer temporarily fails during a drag operation
When I drop a node
Then the UI shows a non-blocking error toast (“Unable to save placement, retrying…”) and retries until persistence succeeds or I cancel
```

## UX References

- `docs/ux-flows.md#A.-Designing-a-New-Workflow`
- Upcoming narrative spec: `docs/ux/narratives/designer.md`

## Technical Notes

- Impacts modules: `renderer` (canvas rendering, drag/drop handlers), `main` (persisting draft updates), `core` (workflow graph model).
- Dependencies: Workflow state schema, trigger configuration UI story.
- Open Questions:
  - What library or custom implementation handles drag/drop and snapping? (Consider React Flow, custom Canvas)
  - How do we represent transitions in the underlying data structure to support undo/redo efficiently?
