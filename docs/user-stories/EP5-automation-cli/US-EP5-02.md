# Story: Schedule recurring workflow runs

- **Epic**: EP5 — Automation & CLI
- **Persona**: Operations Analyst
- **Priority**: P0
- **Status**: Draft

## Context

Some workflows must run on cadence (nightly compliance checks). Analysts should schedule runs via CLI (and future UI) with cron-like syntax, monitor schedules, and pause them as needed.

## User Story

As an operations analyst, I want to schedule recurring workflow runs so that compliance checks and other automations run without manual intervention.

## Acceptance Criteria

```
Given I run `aiwm workflows schedule add policy-review --cron "0 2 * * *" --profile prod`
When executed
Then the scheduler validates the cron expression, stores the schedule, and confirms the next run time

Given schedules exist
When I run `aiwm workflows schedule list`
Then I see workflow name, cron expression, next run, last result, and status (Active/Paused)

Given I need to pause
When I run `aiwm workflows schedule pause policy-review`
Then the schedule stops firing until resumed

Given a scheduled run fails
When it happens
Then I receive notification (CLI toast + notifications subsystem) and the failure is logged with schedule metadata

Given I export schedules
When I run `aiwm workflows schedule export --out schedules.json`
Then I obtain a JSON file for backup/import
```

## Architecture Components

- `SchedulerService` (cron interpreter + persistence)
- WorkflowRuntime (triggered by scheduler)
- ConfigService (stores schedules)
- NotificationService (alerts on failure)
- CLI scheduling command set

## UX References

- `docs/ux/narratives/cli-companion.md` (scheduling hints)
- Future UI scheduler plan (to be added)

## Technical Notes

- Cron expressions parsed via node-cron or similar; support timezone selection.
- Schedules persisted in SQLite (`workflow_schedules` table) referencing workflow version/profile.
- Provide locking to prevent overlapping runs (configurable).
