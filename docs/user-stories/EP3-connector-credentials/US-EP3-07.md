# Story: Manage credentials via CLI commands

- **Epic**: EP3 — Connector & Credential Management
- **Persona**: Integrator
- **Priority**: P0
- **Status**: Draft

## Context

Integrators working on remote servers or automation pipelines need to add, rotate, and test credentials without the UI. CLI commands must match UI validation and auditing.

## User Story

As an integrator, I want to manage connector credentials via CLI commands so that I can automate setup and maintenance tasks.

## Acceptance Criteria

```
Given I run `aiwm connectors credentials list`
When executed
Then I see a table of connectors, credential labels, last rotated date, and status (masked values)

Given I need to set a new key
When I run `aiwm connectors credentials set chatgpt --label prod`
Then the CLI prompts for masked input, tests the credential, stores it securely, and prints success/audit info

Given I need to rotate or delete a key
When I run `aiwm connectors credentials rotate claude --label prod`
Then the CLI guides me through adding the replacement key before removing the old one

Given I export credentials metadata (not secrets)
When I run `aiwm connectors credentials export --out creds.json`
Then I receive a JSON file listing connectors, labels, status, but no secret values

Given CLI changes occur
When they do
Then the UI reflects updated status badges without needing a restart
```

## UX References

- `docs/ux/narratives/cli-companion.md`
- `docs/ux/narratives/settings.md`

## Technical Notes

- CLI should integrate with OS keychain APIs; fallback encryption when headless.
- Logging: all CLI credential changes recorded with user identity (via OS login).
- Provide non-interactive mode using env vars or `--key-file`.
- Open questions: How do we authenticate CLI users on shared machines?
