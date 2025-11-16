# Story: View current node status and timeline

- **Epic**: EP2 — Workflow Execution & Monitoring
- **Persona**: Operations Analyst
- **Priority**: P0
- **Status**: Draft

## Context

During execution, operators rely on an updated view of the active node, pending actions, and historical events. The console should show where the workflow is, what happened, and what’s next.

## User Story

As an operations analyst, I want to view the current node status and timeline so that I can understand workflow progress and troubleshoot issues in real time.

## Acceptance Criteria

```
Given I open the execution console for a running workflow
When the workflow is active
Then the current node panel shows node name, type, status, and live outputs, while the timeline rail lists ordered events (entry, triggers, validators, actions)

Given validators or triggers are pending
When I view the timeline
Then pending items display as “In progress” with spinners and estimated durations

Given an error occurs
When I inspect the timeline
Then the relevant entry highlights in red, expands to show details, and the console provides suggested remediation steps

Given I switch to JSON/log view
When I toggle the log format
Then I still see current node summary at the top while logs stream below

Given I access the console via CLI
When I run `aiwm runs monitor <runId>`
Then I receive the same information (current node + timeline) formatted for terminal output
```

## UX References

- `docs/ux/narratives/execution-console.md`
- `docs/ux/wireframes/execution-console.md`

## Technical Notes

- Timeline events should be structured data with IDs, timestamps, severity.
- Live updates via IPC/subscriptions; console should degrade gracefully if offline (pause updates, show stale notice).
- CLI shares same event feed.
- Open questions: do we offer filtering on timeline (actions only, validators only)?
