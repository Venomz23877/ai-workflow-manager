# Story: Restart workflow from specific node

- **Epic**: EP2 — Workflow Execution & Monitoring
- **Persona**: Operations Analyst
- **Priority**: P1
- **Status**: Draft

## Context

When failures occur late in execution, restarting the entire workflow wastes time. Operators should restart from a specific node (with safeguards) using snapshots of run context.

## User Story

As an operations analyst, I want to restart a workflow from a specific node so that I can recover from failures or rerun a subset of steps without repeating the whole process.

## Acceptance Criteria

```
Given a workflow run has failed or completed
When I click “Restart from node” in the run summary
Then I choose the target node (limited to nodes with saved context), confirm required parameters, and a new run starts from that node with a reference to the original run

Given restarting could cause side effects (e.g., duplicate document generation)
When I attempt it
Then the UI warns me and offers options (regenerate documents vs reuse existing)

Given I use the CLI
When I run `aiwm runs restart <runId> --node loop-c --resume-context`
Then the new run ID is returned, referencing the parent run

Given dependencies changed since the original run (documents updated, connector switched)
When I initiate restart
Then the tool surfaces a diff summary and requires confirmation

Given policy forbids restarting published workflows without approval
When I attempt restart
Then permission checks enforce the rule and instruct me to request approval
```

## UX References

- `docs/ux/narratives/execution-console.md`
- `docs/ux/narratives/dashboard.md` (run history section)

## Technical Notes

- Requires capturing node-level snapshots (context JSON, artifacts).
- Implementation should create new run record referencing `parent_run_id`.
- CLI should support `--new-version` to restart against updated workflow definitions.
- Open questions: Should we restrict to same workflow version by default?
