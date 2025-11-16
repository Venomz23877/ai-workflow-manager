# Story: Configure notification preferences

- **Epic**: EP2 — Workflow Execution & Monitoring
- **Persona**: Operations Analyst
- **Priority**: P2
- **Status**: Draft

## Context

Different teams need different alert levels. Operators should configure when and how they receive notifications (in-app, email, future channels) for events like validator failures, run completion, or credential issues.

## User Story

As an operations analyst, I want to configure notification preferences so that I receive the right alerts without noise.

## Acceptance Criteria

```
Given I open Settings ▸ Notifications
When I adjust preferences
Then I can enable/disable event types (run started, validator failed, run completed, credential warning) and choose delivery channels (in-app, email*, CLI summary)

Given I disable an event type
When that event occurs
Then I no longer receive alerts for it, but the event still appears in history panels

Given I set quiet hours
When events occur during that window
Then notifications queue until quiet hours end, unless marked as critical

Given I use the CLI
When I run `aiwm notifications prefs --set validator_failed=cli`
Then my preferences update and are reflected in the UI settings page

Given multiple users share the same machine
When each configures preferences
Then settings remain per-user (tied to profile) and audit logs track changes
```

## UX References

- `docs/ux/narratives/settings.md` (future notifications section)
- `docs/ux/narratives/dashboard.md` (notifications sidebar)

## Technical Notes

- Preference storage per user (local profile). For email/SMS placeholders, mark as future but design schema now.
- CLI command should support `--json` export/import of preferences.
- Need default baseline (critical alerts always on).
- Open questions: How do we handle org-level defaults?
