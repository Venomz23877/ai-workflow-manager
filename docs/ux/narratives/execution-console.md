# UX Narrative — Execution Console

## Overview

The execution console is the mission-control view for running workflows. It gives operators real-time insight into the active node, queued actions, validator outcomes, and document output progress. The experience balances clarity (timeline, logs) with control (manual actions, pause/resume, CLI parity cues) to encourage confident interventions.

## Layout Narrative

- **Header bar**: workflow name, current run ID, run status (Running, Paused, Failed), primary actions (Pause/Resume, Stop, Download Logs). Includes breadcrumb back to dashboard and a shortcut to open the same run in the CLI.
- **Main content split**:
  - **Node focus panel** (left two-thirds) showing current node name, type badge, entry/exit action summaries, and live AI output stream (chat-style bubbles for LLM responses, progress chips for document builders).
  - **Timeline rail** (left column) listing chronological events (entry, triggers, validators, actions). Each timeline item expands to reveal payload details or errors.
- **Right control drawer**:
  - **Node Actions** tab with buttons for manual actions (Request Alternative, Force Next Iteration, Regenerate Document).
  - **Triggers & Validators** tab showing active validators, their status, retry timers.
  - **Artifacts** tab listing documents produced in this run with quick open/download.
- **Footer log bar**: streaming, filterable log lines (info/warn/error) with toggles for structured JSON vs friendly text.

### ASCII Sketch (simplified)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Workflow: Policy Review  | Run #1827  | Status: RUNNING  [Pause][Stop][CLI]  │
├───────┬───────────────────────────────────────────────┬──────────────────────┤
│Timeline│ Current Node: Loop - Summary Refinement      │ Node Actions        │
│ 12:00 │ ┌───────────────────────────────────────────┐ │ [Request alt]      │
│ Entry │ │ AI Output (stream)                        │ │ [Force next]       │
│ 12:01 │ │ • Draft v3 ...                            │ │ [Regenerate doc]   │
│ Valid │ │ • Validator hint ...                      │ │--------------------│
│ 12:02 │ │ Progress bars for doc builder             │ │ Triggers/Validators│
│ ...   │ │ Timeline badges for triggers              │ │ • confidence OK    │
│       │ └───────────────────────────────────────────┘ │ • policy pending   │
├───────┴───────────────────────────────────────────────┴──────────────────────┤
│ Logs: [INFO][WARN][ERROR] | JSON ☑ | Auto-scroll ☑                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Interaction Narrative

- **Run state buttons**:
  - `Pause` transitions to Paused state with confirmation toast; button toggles to `Resume`.
  - `Stop` opens confirmation modal summarizing consequences (run marked Failed, downstream actions canceled).
  - CLI button copies equivalent command (`aiwm workflows monitor <runId>`) to clipboard.
- **Timeline interactions**:
  - Clicking an event expands details inline (LLM prompts/responses, validator thresholds).
  - Errors pin themselves to top until acknowledged.
  - Infinite scroll loads older events; search filter supports event type keywords (`validator_failed`).
- **Node actions**:
  - Buttons trigger confirmation micro-dialogs if destructive. Results stream to timeline/log with correlation ID.
  - Disabled actions show tooltips explaining prerequisites (e.g., “Wait for validator to complete”).
- **Artifacts tab**:
  - Provides inline preview for Markdown/HTML; DOCX/PDF open external viewer.
  - “Pin to dashboard” surfaces frequently accessed artifacts in home view.
- **Footer logs**:
  - Toggle between human-readable and raw JSON; copying a log line attaches metadata (timestamp, node, severity).
  - `Pause auto-scroll` allows inspection while run continues; toast reminds user when new logs arrive.

## Interaction Contracts

| Scenario           | Input                       | System Reaction                                            | Outbound Events                |
| ------------------ | --------------------------- | ---------------------------------------------------------- | ------------------------------ |
| Pause run          | Click `Pause`               | Run state transitions to Paused; timeline logs pause event | `workflow.run.paused`          |
| Resume run         | Click `Resume`              | Run state transitions to Running; node actions re-enabled  | `workflow.run.resumed`         |
| Invoke action      | Click `Request alternative` | Action queued, spinner shown; output appended to stream    | `workflow.action.invoked`      |
| Validator failure  | Validator returns false     | Timeline item turns red, sidebar badge highlights error    | `workflow.validator.failed`    |
| Download artifacts | Click file in Artifacts tab | File saved/opened; analytics event emitted                 | `workflow.artifact.downloaded` |

## Accessibility & Inclusivity

- Live regions announce run state changes and validator failures for screen readers.
- Keyboard shortcuts: `Space` toggles pause/resume, `Ctrl+L` focuses log stream, arrow keys navigate timeline entries.
- High-contrast and reduced-motion modes supported; streaming animations replaced with subtle fades.
- Color-coded severity supplemented with icons/text (“Warning”, “Error”).

## Error & Edge Cases

- **Lost connectivity**: header shows offline badge, attempts to reconnect; actions disabled with tooltip until back online.
- **Stalled node**: progress tracker detects inactivity beyond threshold and surfaces escalation banner with recommended actions.
- **Multiple runs**: launching another run opens tab-like switcher; warns if operator tries to control two runs simultaneously.
- **Credential revoked mid-run**: prompts quick vault flow or fallback connector selection.

## Future Enhancements

- Multi-run comparison view with split timelines.
- Embedded video/gif attachments for complex validations.
- “Coach mode” overlay offering recommended manual interventions based on telemetry.

## References

- `docs/ux-flows.md#C.-Running-and-Monitoring-a-Workflow`
- `docs/user-requirements.md` — Workflow execution requirements
- `docs/architecture.md` — Trigger & event engine, logging sections
