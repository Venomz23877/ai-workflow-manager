# Story: Monitor vulnerabilities and dependency health

- **Epic**: EP7 — Platform Operations & Quality
- **Persona**: Administrator
- **Priority**: P1
- **Status**: Draft

## Context

Dependencies evolve with security fixes. Admins need tooling to run vulnerability scans (npm audit, GitHub advisory), view results, and plan remediation.

## User Story

As an administrator, I want to monitor vulnerabilities and dependency health so that I can keep the platform secure.

## Acceptance Criteria

```
Given I run `aiwm ops security scan`
When executed
Then the CLI runs npm audit (or equivalent), aggregates results, categorizes severity, and stores them in a report file

Given vulnerabilities exist
When the scan finishes
Then the dashboard displays a warning badge with link to the report and recommended actions

Given recurring scans
When scheduled (weekly)
Then NotificationService alerts me only when new or unresolved high-severity issues remain

Given remediation
When I mark an issue as “Acknowledged”
Then it’s tracked with target fix date and reappears if overdue

Given offline environments
When scans can’t reach advisory feeds
Then the tool falls back to local database and warns about limited coverage
```

## Architecture Components

- SecurityScanner service (wraps npm audit)
- CLI ops security commands
- NotificationService + dashboard badges
- ConfigService (scan schedule)
- AuditLogService (record acknowledgment/resolution)

## UX References

- Dashboard notifications narrative
- `.ai_working/project_todo.md` operations items

## Technical Notes

- Reports stored under `logs/security/` with timestamped JSON + Markdown summary.
- Provide `--json` flag for automation; exit non-zero on high severity unless `--allow` passed.
