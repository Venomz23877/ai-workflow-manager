# Story: Configure logging levels and destinations

- **Epic**: EP7 — Platform Operations & Quality
- **Persona**: Administrator
- **Priority**: P0
- **Status**: Draft

## Context

Admins must control logging verbosity and destinations (local file, console, future external sink). Settings should update across main/renderer/CLI components consistently.

## User Story

As an administrator, I want to configure logging levels and destinations so that I can balance observability with performance and privacy.

## Acceptance Criteria

```
Given I open Settings ▸ Logging
When I adjust levels (ERROR/WARN/INFO/DEBUG) for modules (main, renderer, connectors)
Then the application updates configuration immediately and persists it

Given I add a destination
When I set `File` or `Console` or `External webhook (future)`
Then the system validates the path/URL and tests connectivity

Given CLI usage
When I run `aiwm ops logging set --module main --level warn --dest file --path logs/app.log`
Then the same ConfigService entries update

Given logging changes
When they occur
Then AuditLogService records the change with user and timestamp

Given I export diagnostics
When I click “Download log bundle”
Then the configured logs pack into a ZIP along with metadata
```

## Architecture Components

- Logging/Telemetry pipeline (`WorkflowEventPublisher` adapters)
- ConfigService (logging settings)
- Settings UI logging panel
- CLI ops logging commands
- AuditLogService

## UX References

- Future settings narrative for logging (to be drafted)
- `.cursor/rules/build-installer.mdc` references logging guardrails

## Technical Notes

- Logging config stored per module; watchers update Winston/pino loggers at runtime.
- Provide rotation/compression settings.
