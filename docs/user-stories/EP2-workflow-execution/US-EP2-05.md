# Story: Pause and resume workflow run

- **Epic**: EP2 — Workflow Execution & Monitoring
- **Persona**: Operations Analyst
- **Priority**: P0
- **Status**: Draft

## Context

Operators must safely pause long-running workflows (e.g., awaiting approvals) and resume later. Pause should snapshot state, quiesce connectors, and surface consequences before action.

## User Story

As an operations analyst, I want to pause and resume workflow runs so that I can temporarily halt execution during reviews or outages.

## Acceptance Criteria

```
Given a workflow run is active
When I click “Pause” in the execution console
Then I see a confirmation dialog summarizing the effects (current node, queued actions) and, upon confirmation, the run enters Paused state with a timestamp

Given a run is paused
When I revisit the console
Then the UI displays Paused status, disables actions that require running state, and highlights “Resume” as primary CTA

Given I resume the run
When I click “Resume” or use CLI `aiwm runs resume <runId>`
Then the run restarts from the same node, timeline logs the resume event, and operators receive a toast

Given a pause attempt fails (e.g., node in non-interruptible phase)
When I confirm pause
Then the console explains why the pause failed and offers retry once the condition clears

Given SLAs require auditing
When pause/resume occurs
Then audit logs capture operator identity, timestamp, and optional reason
```

## UX References

- `docs/ux/narratives/execution-console.md`
- `docs/ux/wireframes/execution-console.md`

## Technical Notes

- Backend must snapshot state to allow safe resume; connectors should support pause hooks.
- CLI parity: `aiwm runs pause <runId> --reason`.
- Need guardrails for max pause duration; optionally auto-resume or expire runs.
- Open questions: Should we allow scheduled resumes?
