# Story: Run workflows headlessly via CLI

- **Epic**: EP5 — Automation & CLI
- **Persona**: Integrator
- **Priority**: P0
- **Status**: Draft

## Context

Integrators must trigger workflows from CI/CD scripts or remote servers without the renderer. CLI commands should mirror UI run parameters and stream results.

## User Story

As an integrator, I want to run workflows headlessly via the CLI so that I can automate execution in pipelines or remote environments.

## Acceptance Criteria

```
Given the CLI is installed
When I run `aiwm workflows run policy-review --version published --llm chatgpt --doc policy.md --json`
Then the command validates parameters, authenticates, starts the workflow, streams structured events, and exits only after completion (unless `--async` is passed)

Given I pass `--async`
When the run starts
Then the CLI returns immediately with run ID and instructions for monitoring

Given credentials are missing
When I attempt to run
Then the CLI prompts to add them (or errors with instructions)

Given I pipe output to another tool
When `--json` is used
Then each event prints as JSON line including timestamp, node, status, allowing downstream processing

Given the run fails
When the command exits
Then exit code is non-zero and includes failure summary
```

## Architecture Components

- CLI workflow run command
- WorkflowRuntime (main process service)
- CredentialVault (for secret retrieval)
- WorkflowEventPublisher + Logging pipeline (for streaming output)
- Notification/Run state APIs shared with renderer

## UX References

- `docs/ux/narratives/cli-companion.md`
- `docs/traceability-matrix.md` (EP5 rows)

## Technical Notes

- CLI should reuse same IPC/REST endpoint as renderer to prevent logic duplication.
- Provide `--env` flag for selecting profiles; defaults to local.
- Output must include correlation ID for cross-tool debugging.
