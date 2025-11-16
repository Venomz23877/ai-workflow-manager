# Story: Pipe CLI output to automation pipelines

- **Epic**: EP5 — Automation & CLI
- **Persona**: Integrator
- **Priority**: P1
- **Status**: Draft

## Context

Automation pipelines rely on structured outputs and exit codes. The CLI must provide JSON streaming, quiet modes, and filtering to integrate with tools like jq, PowerShell, or custom scripts.

## User Story

As an integrator, I want to pipe CLI output into my automation pipelines so that other tools can react to workflow events.

## Acceptance Criteria

```
Given I run `aiwm workflows run policy-review --json | jq '.event'`
When executed
Then output is newline-delimited JSON with stable keys (timestamp, eventType, nodeId, payload), suitable for parsing

Given I set `--quiet`
When command finishes
Then only machine-readable output prints (no decorative cards)

Given I filter events
When I pass `--filter validator_failed --filter run_completed`
Then only matching events stream

Given I redirect logs to file
When I run `--out logs.jsonl`
Then the CLI writes to disk while optionally mirroring summary output to stdout

Given errors occur
When commands exit
Then exit codes align with severity (e.g., 2 for validation failure, 3 for connector issue) and docs list the mapping
```

## Architecture Components

- CLI output formatter (JSONL + card renderers)
- WorkflowEventPublisher / Logging pipeline
- Filter middleware (event subscriptions)
- ConfigService (user preferences for quiet mode, output defaults)
- Documentation (CLI reference)

## UX References

- `docs/ux/narratives/cli-companion.md`
- `docs/ux/wireframes/cli-companion.md`

## Technical Notes

- Implement streaming via RxJS/EventSource pattern; allow buffering for file writes.
- Provide `--format card|table|json`.
- Document exit code matrix in CLI help.
