# Story: Trigger node action via CLI command

- **Epic**: EP2 — Workflow Execution & Monitoring
- **Persona**: Operations Analyst
- **Priority**: P0
- **Status**: Draft

## Context

Headless or remote operators must invoke actions from the terminal. CLI commands should mirror UI safeguards (validation, prerequisite checks) and provide structured feedback for automation scripts.

## User Story

As an operations analyst, I want to trigger node actions via CLI so that I can intervene in runs from automation scripts or remote terminals.

## Acceptance Criteria

```
Given a workflow run is active
When I run `aiwm actions list <runId> --node <nodeId>`
Then I see available actions, their descriptions, and prerequisite status

Given I invoke an action
When I run `aiwm actions invoke <runId> <nodeId> <actionName> --reason "Need alt"`
Then the command validates prerequisites, executes the action, and prints success info (timestamp, correlation ID)

Given validation fails
When the CLI detects unmet conditions
Then it aborts with a descriptive error and non-zero exit code

Given I pass `--json`
When the command completes
Then output includes structured payload (status, action metadata, next steps)

Given I run in watch mode
When I use `--watch`
Then the CLI streams follow-up events from the run until I exit
```

## UX References

- `docs/ux/narratives/cli-companion.md`
- `docs/ux/narratives/execution-console.md`

## Technical Notes

- CLI should reuse same backend endpoints as UI; wrap responses.
- Support authentication/permissions consistent with UI.
- Provide shell completion metadata for action names.
- Open questions: do we log operator reason messages for auditing?
