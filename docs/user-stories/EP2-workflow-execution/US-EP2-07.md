# Story: Download run summary and generated documents

- **Epic**: EP2 — Workflow Execution & Monitoring
- **Persona**: Operations Analyst
- **Priority**: P1
- **Status**: Draft

## Context

After a workflow completes, operators need bundled outputs (summaries, documents, logs) for review or sharing. The console should provide one-click downloads and metadata about generated artifacts.

## User Story

As an operations analyst, I want to download the run summary and generated documents so that I can share outputs with stakeholders and archive results.

## Acceptance Criteria

```
Given a workflow run completes
When I view the execution console
Then the Artifacts tab lists generated files (DOCX, PDF, Markdown, CSV) with size, timestamp, and quick actions (open, copy path, download)

Given I click “Download summary bundle”
When the bundle is prepared
Then I receive a zip containing run summary (JSON + human-readable report), generated docs, and key logs; toast confirms download location

Given documents are large
When I request download
Then progress feedback appears, and I can cancel if needed

Given I use CLI
When I run `aiwm runs artifacts download <runId> --out ./outputs`
Then the tool downloads artifacts with structured progress messages

Given compliance requires traceability
When I download
Then the system logs the action with operator identity and timestamp
```

## UX References

- `docs/ux/narratives/execution-console.md`
- `docs/ux/narratives/document-workspace.md`

## Technical Notes

- Artifact metadata stored in repository; bundler service packages selected files.
- Provide sanitized filenames and ensure secret redaction.
- CLI command should support `--filter pdf` etc.
- Open questions: Offer direct link to open in external viewer vs internal preview?
