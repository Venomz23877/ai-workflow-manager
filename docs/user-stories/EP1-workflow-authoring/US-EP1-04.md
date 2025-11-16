# Story: Define triggers and validators on transitions

- **Epic**: EP1 — Workflow Authoring
- **Persona**: Workflow Architect
- **Priority**: P0
- **Status**: Draft

## Context

Triggers determine when a transition fires, and validators ensure conditions are met before moving to the next node. Architects need tooling to configure both for every edge on the workflow graph, including AI-confidence thresholds, manual approvals, schedules, and custom guards. This story covers the inspector experience and data model for configuring triggers/validators and surfacing their status during validation.

## User Story

As a workflow architect, I want to define triggers and validators on transitions so that workflows advance automatically when conditions are satisfied and pause when human review or additional checks are required.

## Acceptance Criteria

```
Given two nodes are connected by a transition
When I select the transition in the designer
Then the inspector switches to transition mode and displays separate sections for Triggers and Validators

Given I add a trigger of type “AI decision”
When I specify the confidence threshold and prompt variant
Then those parameters are saved with the transition and surfaced in validation summaries

Given a transition has multiple validators
When I reorder them
Then the runtime enforces the new order and the UI reflects it immediately

Given I add a manual-approval validator
When the workflow runs
Then operators see the pending approval in the execution console and CLI

Given I attempt to publish a workflow with a transition missing either a trigger or validator
When I run validation
Then the validation summary lists the offending transition and blocks publishing until resolved
```

## UX References

- `docs/ux/narratives/designer.md` — Transition inspector behavior
- `docs/ux/narratives/execution-console.md` — Validator surfacing during runs

## Technical Notes

- Impacts modules: `renderer` (transition inspector UI), `core` (state machine config), `main` (validation service).
- Transition data structure should support arrays of triggers/validators with metadata (type, parameters, order, enabled flag).
- Validation engine must ensure at least one trigger per transition; loop nodes may allow special cases.
- Open questions:
  - Do we support time-based triggers (cron) in v1 or mark as future?
  - How are custom validator scripts packaged and versioned?
