# Story: Invoke node action from execution console

- **Epic**: EP2 — Workflow Execution & Monitoring
- **Persona**: Operations Analyst
- **Priority**: P0
- **Status**: Draft

## Context

Operators often need to nudge workflows—request alternative AI outputs, force next iterations, or manually approve transitions. The console should expose node-specific actions with clear feedback and guardrails.

## User Story

As an operations analyst, I want to invoke node actions from the execution console so that I can intervene in workflows without leaving the monitoring view.

## Acceptance Criteria

```
Given I am viewing a running workflow
When I open the Node Actions tab
Then I see available manual actions (e.g., “Request alternative summary”, “Force next iteration”) with tooltips describing each action

Given an action has prerequisites (e.g., validator must finish)
When I try to run it early
Then the action is disabled with a tooltip explaining the requirement

Given I invoke an action
When it executes
Then I receive immediate feedback (spinner → success/failure), timeline/log entries reflect the action, and the action button indicates completion

Given an action fails
When failure occurs
Then the console surfaces error details and suggests retry or fallback actions

Given I need parity in CLI
When I run `aiwm actions invoke <runId> <nodeId> <actionName>`
Then the command triggers the same workflow action with matching validation
```

## UX References

- `docs/ux/narratives/execution-console.md`
- `docs/ux/wireframes/execution-console.md`

## Technical Notes

- Actions call backend command handlers; responses include correlation IDs for logging.
- Need permission model (some actions restricted to admins).
- Provide throttle to avoid repeated actions (cool-down per node/action).
- CLI integration shares same API to avoid duplication.
