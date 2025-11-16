# Story: Export generated documents to DOCX/PDF bundle

- **Epic**: EP4 — Document Management
- **Persona**: Operations Analyst
- **Priority**: P1
- **Status**: Draft

## Context

Completed workflows produce documents that must be shared with stakeholders. Operators need a one-click way to package outputs (DOCX, PDF, Markdown) plus run summaries.

## User Story

As an operations analyst, I want to export generated documents as a DOCX/PDF bundle so that I can share deliverables with stakeholders easily.

## Acceptance Criteria

```
Given a workflow run completes
When I click “Download bundle” in the execution console
Then the app packages generated documents (DOCX, PDF, Markdown) plus a run summary into a ZIP and shows progress feedback

Given documents are large
When downloading
Then progress bars display per file, and I can cancel mid-way

Given I only need certain formats
When I open the export dialog
Then I can select formats (DOCX, PDF, Markdown) before bundling

Given CLI usage
When I run `aiwm runs artifacts download <runId> --formats docx,pdf`
Then I receive the same bundle with checksum

Given compliance auditing
When a bundle is downloaded
Then an audit entry records operator, timestamp, run ID, and included files
```

## Architecture Components

- `DocumentBuilder` strategies (DOCX/PDF)
- `ArtifactsService` (collects outputs, packages ZIP)
- `FileConnector` (handles filesystem permissions)
- ExecutionConsole UI & CLI artifacts commands
- `AuditLogService`

## UX References

- `docs/ux/narratives/execution-console.md`
- `docs/ux/narratives/document-workspace.md`

## Technical Notes

- Bundler should support streaming ZIP creation to avoid memory spikes.
- Include metadata JSON describing each artifact, hashed for integrity.
- Provide asynchronous export when bundle generation is heavy (optional toast + notification).
