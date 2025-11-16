# Story: Save workflow draft and version history

- **Epic**: EP1 — Workflow Authoring
- **Persona**: Workflow Architect
- **Priority**: P1
- **Status**: Draft

## Context

Authors need confidence that their work is saved automatically, with manual checkpoints and the ability to review or revert to earlier versions. Drafts should autosave, manual saves should capture descriptions, and publishing should increment an immutable version record.

## User Story

As a workflow architect, I want workflow drafts to autosave and maintain version history so that I can recover from crashes, compare changes, and roll back if needed.

## Acceptance Criteria

```
Given I edit a workflow draft
When I pause for more than 5 seconds
Then the system autosaves changes and shows a “Draft saved” toast with timestamp

Given I click “Save Draft”
When prompted
Then I can optionally add a note (e.g., “Added validator to Loop C”) that appears in version history

Given I publish a workflow
When validation passes
Then a new immutable version entry is created with version number, author, timestamp, and change note

Given I view version history
When I select a prior version
Then I can compare (diff) definitions and optionally restore it into a new draft

Given the app crashes mid-edit
When I reopen
Then I see a recovery banner describing the autosaved state and offering to restore or discard it
```

## UX References

- `docs/ux/narratives/designer.md` — Save/autosave interactions
- `docs/ux/narratives/dashboard.md` — surfacing draft state on cards

## Technical Notes

- Persist drafts locally (SQLite) with conflict detection; publish pushes to `workflow_versions`.
- Version notes stored with metadata; diff uses JSON structure comparison.
- CLI commands: `aiwm workflows history <slug>`, `aiwm workflows restore <slug> --version N`.
- Open questions: retention policy for draft history; encryption for sensitive backups.
