# Story: Duplicate workflow from template

- **Epic**: EP1 — Workflow Authoring
- **Persona**: Workflow Architect
- **Priority**: P1
- **Status**: Draft

## Context

Teams often start from proven workflows. Authors should duplicate an existing workflow or template, adjust metadata, and immediately edit the copy. Duplication must ensure references (documents, connectors) remain valid or flagged for update.

## User Story

As a workflow architect, I want to duplicate a workflow from a template so that I can customize a proven pattern without rebuilding it from scratch.

## Acceptance Criteria

```
Given I open the dashboard
When I choose “Duplicate” on a workflow card
Then a modal asks for new name, description, tags, and saves a draft copy with all nodes/actions intact

Given I open the Templates panel
When I duplicate a template
Then the resulting workflow marks referenced documents/credentials that need confirmation (badges in inspector)

Given the source workflow uses credentials the current user cannot access
When duplication occurs
Then the copy replaces those references with placeholders and surfaces warnings

Given I duplicate via CLI
When I run `aiwm workflows duplicate <source> <target>`
Then a new draft is created and listed in `aiwm workflows list --status draft`

Given I duplicate a published workflow
When the copy is created
Then version history starts at draft version 0; original remains unchanged
```

## UX References

- `docs/ux/narratives/dashboard.md` — card hover actions
- `docs/ux-flows.md#F.-Managing-Workflow-Templates`

## Technical Notes

- Duplication should deep copy workflow definition JSON plus metadata; document references should point to same file IDs but flagged for review.
- Need service to map connector references to user’s available connectors; fallback to defaults.
- CLI command should optionally accept `--include-runs false` (default).
- Open questions: do we support cross-account template import/export in v1?
