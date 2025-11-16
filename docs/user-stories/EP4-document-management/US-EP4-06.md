# Story: Edit and validate documents via CLI

- **Epic**: EP4 — Document Management
- **Persona**: Integrator
- **Priority**: P1
- **Status**: Draft

## Context

Automation workflows and remote operators need CLI parity for document tasks: opening in external editors, validating, exporting.

## User Story

As an integrator, I want to edit and validate documents via CLI so that I can automate document maintenance without the UI.

## Acceptance Criteria

```
Given I run `aiwm docs list`
When executed
Then I see documents with IDs, formats, linked workflows, and last modified timestamps

Given I edit via CLI
When I run `aiwm docs edit onboarding.md --editor code`
Then the CLI opens the file in my configured editor, watches for save, re-imports it, and runs validation

Given I need to validate
When I run `aiwm docs validate onboarding.md`
Then the CLI applies the same schema/format validations as the UI and exits non-zero on failure

Given I export
When I run `aiwm docs export onboarding.md --format pdf --out ./docs`
Then the document builder runs headlessly and writes the file with progress updates

Given offline mode
When the renderer isn’t running
Then CLI commands still function, using the same DocumentRegistry and services
```

## Architecture Components

- CLI document command suite (`docs list/edit/validate/export`)
- DocumentRegistry & DocumentBuilder services
- SchemaValidationService
- FileConnector + FileSandboxGuard
- ConfigService (CLI editor preferences)

## UX References

- `docs/ux/narratives/cli-companion.md`
- `docs/ux/narratives/document-workspace.md`

## Technical Notes

- CLI should respect file sandbox; editing outside allowlist blocked.
- On Windows, support `start`/`code` commands; on macOS `open`; allow custom editor command.
- Provide `--json` outputs for automation.
