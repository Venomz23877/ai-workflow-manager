# Story: Track document revisions and diffs

- **Epic**: EP4 — Document Management
- **Persona**: Workflow Architect
- **Priority**: P1
- **Status**: Draft

## Context

Documents evolve alongside workflows. Authors need revision history, diff viewing, and rollback so they can audit changes and revert mistakes.

## User Story

As a workflow architect, I want to track document revisions and view diffs so that I can audit changes and restore previous versions when needed.

## Acceptance Criteria

```
Given I edit a document
When I click the “Revisions” tab
Then I see a list of prior versions with timestamp, author, change note, and diff preview button

Given I open a diff
When comparing two revisions
Then content differences highlight inline (markdown diff, HTML diff, JSON structural diff)

Given I choose “Restore”
When confirmed
Then the selected revision becomes the current draft, a new revision entry is created, and dependent workflows are notified

Given CLI usage
When I run `aiwm docs revisions list onboarding.md`
Then I receive the same metadata and can run `aiwm docs revisions restore --version 12`

Given retention policies
When the history exceeds the configured limit
Then older revisions archive automatically with a warning banner and option to export before purge
```

## Architecture Components

- `DocumentRevisionRepository` (SQLite tables, blob storage)
- DocumentWorkspace metadata rail & diff viewer
- `AuditLogService` for restore events
- Notification/Validation services (post-restore revalidation)
- CLI document revision commands

## UX References

- `docs/ux/narratives/document-workspace.md`
- `docs/ux/wireframes/document-workspace.md`

## Technical Notes

- Store revisions as compressed blobs plus metadata; diff computed on demand.
- Support textual diff for Markdown/HTML, structural diff for JSON/YAML.
- Provide retention configuration via settings (ties into ConfigService).
