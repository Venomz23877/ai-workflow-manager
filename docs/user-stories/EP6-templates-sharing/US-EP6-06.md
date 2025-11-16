# Story: CLI template library operations

- **Epic**: EP6 — Templates & Sharing
- **Persona**: Integrator
- **Priority**: P2
- **Status**: Draft

## Context

Automation workflows require full CLI control over templates—listing, publishing, duplicating, exporting, importing, and permission management.

## User Story

As an integrator, I want to manage templates via the CLI so that automation scripts can keep libraries in sync across environments.

## Acceptance Criteria

```
Given I run `aiwm templates list`
When executed
Then templates display in table form with metadata, and `--json` outputs machine-readable data

Given I duplicate a template
When I run `aiwm templates duplicate onboarding onboarding-eu`
Then the CLI copies the template, updates metadata, and prints new IDs

Given I publish via CLI
When I run `aiwm templates publish policy-review --meta meta.json`
Then it reuses the same logic as the UI publish flow (validation, registry update, notifications)

Given I export/import
When I use `aiwm templates export` / `import`
Then the CLI handles signing verification, dependency checks, and audit logging

Given I manage permissions
When I run `aiwm templates permissions set ...`
Then the CLI enforces role checks and logs the change
```

## Architecture Components

- CLI template command suite (list/duplicate/publish/export/import/permissions)
- TemplateRegistry
- DocumentRegistry (for attachments)
- ValidationService
- AuditLogService

## UX References

- `docs/ux/narratives/cli-companion.md`

## Technical Notes

- Provide `--profile` flag for multi-environment operations.
- Commands should support piping package content via stdin/stdout for CI usage.
