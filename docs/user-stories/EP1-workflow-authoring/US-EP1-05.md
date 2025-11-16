# Story: View and resolve validation messages

- **Epic**: EP1 — Workflow Authoring
- **Persona**: Workflow Architect
- **Priority**: P0
- **Status**: Draft

## Context

Workflows must pass validation before publishing or running. Architects need clear, actionable feedback tied to specific nodes, transitions, or configuration fields. The designer should provide inline cues plus a consolidated panel, while the CLI mirrors the same data.

## User Story

As a workflow architect, I want to view and resolve validation messages so that I can fix configuration issues and publish reliable workflows.

## Acceptance Criteria

```
Given I run validation from the designer
When issues exist
Then a panel lists each error with severity, affected element, and “Jump to” link

Given a node has a validation error
When I hover the badge on the canvas
Then a tooltip summarizes the issue and clicking opens the inspector focused on the problematic field

Given I fix an issue
When validation re-runs
Then the message disappears automatically without needing manual dismissal

Given I export validation results via CLI
When I run `aiwm workflows validate <slug> --json`
Then the output includes structured entries with IDs, severities, and suggested fixes

Given a validation failure blocks publishing
When I attempt to publish anyway
Then publishing is disabled and a banner explains which issues remain
```

## UX References

- `docs/ux/narratives/designer.md` — validation messaging
- `docs/ux/narratives/execution-console.md` — validator surfacing

## Technical Notes

- Validation service should return deterministic identifiers for issues.
- Support warnings vs errors; warnings allow publish with confirmation.
- CLI command shares backend logic to avoid drift.
- Open questions: Should we allow inline “snooze” of warnings for drafts?
