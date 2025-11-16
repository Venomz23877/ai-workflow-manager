# Story: Stream structured logs to file or terminal

- **Epic**: EP2 — Workflow Execution & Monitoring
- **Persona**: Integrator
- **Priority**: P1
- **Status**: Draft

## Context

Integrators need to pipe workflow logs into observability stacks or analyze them offline. The system should stream structured JSON logs with filters and allow redirecting to files without losing metadata.

## User Story

As an integrator, I want to stream structured logs to a file or terminal so that I can analyze workflow runs and integrate with monitoring tools.

## Acceptance Criteria

```
Given a workflow run is active
When I run `aiwm runs monitor <runId> --json --out logs.jsonl`
Then logs stream in structured JSON Lines format, written to the specified file while also optionally showing summarized console output

Given I only care about certain event types
When I pass `--filter validator_failed --filter action_invoked`
Then only matching events are streamed

Given the connection drops
When streaming
Then the CLI retries gracefully and indicates gaps in the log

Given I run from within the UI
When I click “Download logs” in the console
Then I receive the same JSONL file plus a human-readable summary

Given logs contain sensitive data
When exporting
Then the system redacts secrets and notes redactions in metadata
```

## UX References

- `docs/ux/narratives/execution-console.md` — log bar
- `docs/ux/narratives/cli-companion.md`

## Technical Notes

- Logging pipeline should support subscription with filters; store logs in SQLite or file buffer.
- Provide schema definition for log events (timestamp, level, node, payload, correlation ID).
- Support gzip compression via `--compress`.
- Open questions: do we integrate with external sinks (e.g., HTTP webhook) in v1?
