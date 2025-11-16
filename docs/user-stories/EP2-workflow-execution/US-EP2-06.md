# Story: Receive alert when validator fails

- **Epic**: EP2 — Workflow Execution & Monitoring
- **Persona**: Operations Analyst
- **Priority**: P0
- **Status**: Draft

## Context

Validator failures often require manual intervention. Operators need immediate, actionable alerts in the console, dashboard, and optional channels (notifications panel, future email).

## User Story

As an operations analyst, I want alerts when validators fail so that I can resolve issues quickly and keep workflows progressing.

## Acceptance Criteria

```
Given a validator fails during a run
When it happens
Then the execution console displays a prominent banner, timeline entry, and node badge describing the failure, along with recommended remediation steps

Given I am on the dashboard
When validator failures exist for my workflows
Then the Notifications sidebar lists them with links to open the run at the failing node

Given I enable alert subscriptions
When a validator fails
Then I receive a notification (toast now, future email/webhook) containing workflow/run details

Given I resolve the issue (manual action or config change)
When validation passes on rerun
Then the alert clears automatically and the dashboard badge updates

Given I monitor via CLI
When validator fails
Then `aiwm runs monitor` prints warning lines with red severity, along with instructions to run `aiwm actions invoke ...`
```

## UX References

- `docs/ux/narratives/execution-console.md`
- `docs/ux/narratives/dashboard.md`

## Technical Notes

- Validator events should include metadata: validator ID, node, severity, recommended action.
- Notification framework should de-duplicate repeated failures.
- CLI exit codes should indicate failure states for automation.
- Open questions: Do we support escalation policies (notify different personas)?
