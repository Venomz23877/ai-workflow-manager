# UX Narrative — Visual Workflow Designer

## Overview

The designer canvas is the creative heart of AI Workflow Manager. When a workflow architect opens a draft (blank or from a template), the screen transforms into a workbench: nodes feel tactile, transitions animate gently, and supportive guidance whispers from the margins. The goal is to let users think in flows, not forms.

## Layout Narrative

- **Header**: pinned to the top with workflow name, status chip (Draft/Published), and quick actions (Save Draft, Validate, Publish). Title is inline editable; status chip changes color based on validation state.
- **Left Palette**: vertical dock listing node categories. Each entry uses a minimalist card with icon + label (“Decision”, “WorkStep”, “Loop”). Hovering reveals a short description tooltip (“Branch logic based on AI or manual input”).
- **Canvas**: central infinite plane with faint grid lines. When empty, a friendly illustration and message (“Drag nodes here to start your agentic workflow”) fade in. Nodes snap to grid but allow nudging with arrow keys (1px increments).
- **Right Inspector**: collapsible panel showing properties of the selected node or transition. Tabs separate “Actions” (entry/exit), “Triggers & Validators”, and “Metadata”. Contextual help appears inline when fields are empty.
- **Footer Bar**: houses zoom controls, mini-map toggle, undo/redo buttons, and a “Keyboard Shortcuts” link that opens a cheat-sheet dialog.

### ASCII Sketch (simplified)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Workflow: Onboarding Playbook      [Draft]   [Save Draft] [Validate] [Pub] │
├───────┬───────────────────────────────────────────────────┬────────────────┤
│Palette│                                                     │ Inspector    │
│       │   (Grid canvas with nodes, transitions, hints)      │              │
│ [D]   │                                                     │  Actions     │
│ [W]   │      ○ Decision A─────▶○ WorkStep B                 │  Triggers    │
│ [L]   │              │             ↑                       │  Metadata    │
│       │              ├────────▶○ Loop C                    │              │
├───────┴───────────────────────────────────────────────────┴────────────────┤
│ Zoom  | 100% |  Mini-map  |  Undo  |  Redo  |  Shortcuts | Run Validation │
└────────────────────────────────────────────────────────────────────────────┘
```

## Interaction Narrative

- **Drag & Drop**: dragging a node makes the palette card “lift” with a subtle shadow; the canvas highlights valid drop zones. Upon drop, the node “winks” into place with a microanimation, auto-selecting for immediate editing.
- **Keyboard Accessibility**: pressing `Tab` cycles through nodes; `Enter` opens rename input; `Ctrl+Arrow` nudges position; `Ctrl+Shift+C` begins connection mode where arrow keys choose target node, `Enter` confirms connection.
- **Connection Feedback**: when drawing a transition, the target node glows; on drop, a configuration drawer slides from the inspector with a pre-filled trigger stub (“Manual selection”). Failures (e.g., dropping on invalid target) shake the transition line and show tooltip (“Cannot connect node to itself”).
- **Validation Messaging**: unresolved issues display as red badges on affected nodes; clicking the badge opens the inspector with contextual guidance. Footer displays a summary (“3 issues remaining”).
- **Undo/Redo**: every structural change (add/remove node, connection, rename) adds to the history stack. Undo animates the node back to its prior position for spatial memory.
- **Save & Auto-Save**: manual “Save Draft” button remains for reassurance, but an auto-save toast (“Draft saved”) appears after idle periods (e.g., 5 seconds). Publishing is disabled until validation passes.
- **Help & Onboarding**: first-time users see a guided tour overlay with arrows pointing to palette, canvas, inspector. Tour can be replayed via the header help menu.

## Interaction Contracts

| Scenario              | Input                                    | System Reaction                                                      | Outbound Events                                       |
| --------------------- | ---------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| Add node via drag     | Pointer drag from palette to canvas drop | Node entity created, selected; command dispatched (`AddNodeCommand`) | `workflow.node.added`, draft auto-save request        |
| Add node via keyboard | `Ctrl+N`, node type selection dialog     | Node placed near current focus, label input engaged                  | `workflow.node.added`                                 |
| Rename node           | Focus node, press `Enter`, submit text   | Update node label in domain model, optimistic UI update              | `workflow.node.renamed`                               |
| Connect nodes         | Pointer drag or keyboard connect mode    | Transition entity created; transition inspector opens                | `workflow.transition.created`                         |
| Remove transition     | Delete key or context menu               | Transition deleted; canvas rerenders, undo entry logged              | `workflow.transition.deleted`                         |
| Undo/Redo             | `Ctrl+Z` / `Ctrl+Shift+Z`                | Command dispatcher replays event log to prior state                  | `workflow.command.undo`, `workflow.command.redo`      |
| Auto-save             | Idle > 5s or explicit save               | Draft persisted through repository; toast shown                      | `workflow.draft.saved`, `workflow.autosave.succeeded` |
| Validation run        | Click “Validate”                         | Domain validation service executes; issues surfaced                  | `workflow.validation.completed` (with status)         |

Each contract ties UI gestures to command handlers and event emissions, ensuring renderer and CLI observers stay in sync.

## Accessibility & Inclusivity

- High-contrast theme option toggle in footer at all times.
- Nodes accessible via screen reader, announcing type, label, connection count.
- Drag actions mirrored with keyboard shortcuts and context menus.
- Motion-reduced mode disables animations and uses instant transitions.

## Error & Edge Cases

- **Disconnected nodes**: highlight with dashed border + badge prompt to connect.
- **Circular dependency attempt**: show modal explaining loop nodes handle repetition; offer to convert to Loop node.
- **Unsaved changes on exit**: if user attempts to exit designer with unsaved draft, modal presents options (“Save Draft”, “Discard”, “Cancel”).
- **Large workflows**: mini-map activates automatically above 12 nodes; search bar appears at top of palette to jump to node by name.

## Future Enhancements

- Collaborative presence indicators (avatars on nodes) for multi-user editing.
- Commenting system anchored to nodes/transitions.
- Template suggestions based on node arrangement patterns.

## References

- User stories: `US-EP1-01`, `US-EP1-02` (additional to be linked).
- Architecture: Workflow state & persistence, trigger engine sections.
- Execution flows: `docs/ux-flows.md#A.-Designing-a-New-Workflow`.
