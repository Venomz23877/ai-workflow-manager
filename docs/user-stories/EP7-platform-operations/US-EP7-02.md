# Story: Opt-in telemetry with anonymization

- **Epic**: EP7 — Platform Operations & Quality
- **Persona**: Administrator
- **Priority**: P0
- **Status**: Draft

## Context

Telemetry should be optional and privacy-preserving. Admins decide whether to upload anonymized usage metrics; UI and CLI must respect that choice.

## User Story

As an administrator, I want to opt in to anonymized telemetry so that I can monitor usage while respecting privacy requirements.

## Acceptance Criteria

```
Given I open Settings ▸ Telemetry
When I toggle telemetry on
Then the UI explains what data is collected, references documentation, and requires confirmation before enabling

Given telemetry is disabled
When components attempt to send metrics
Then data stays local and no outbound requests occur

Given telemetry is enabled
When events emit
Then personally identifiable information is stripped or hashed before export, and I can view a preview of outbound payloads

Given CLI usage
When I run `aiwm ops telemetry status`
Then I see whether telemetry is enabled, destination URL, and last upload timestamp

Given audit requirements
When telemetry config changes
Then AuditLogService captures the change with user and justification
```

## Architecture Components

- TelemetryExporter (local buffering + optional remote transport)
- ConfigService (telemetry settings)
- Settings UI telemetry panel & CLI telemetry commands
- NotificationService (reminders about disabled telemetry)
- AuditLogService

## UX References

- Future telemetry section in settings narrative
- `.cursor/rules/` privacy guardrails

## Technical Notes

- Provide local cache for telemetry events; flush only if enabled.
- Support manual “Send diagnostics” button to upload once without enabling ongoing telemetry.
