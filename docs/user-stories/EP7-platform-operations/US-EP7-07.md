# Story: Run component tests from in-app Test Console

- **Epic**: EP7 — Platform Operations & Quality
- **Persona**: Engineer
- **Priority**: P1
- **Status**: Draft

## Context

Teams want a quick way to run automated component tests without leaving the desktop app. A dedicated diagnostics screen should surface smoke tests, contract checks, and CLI harnesses, and provide structured output plus audit/notification hooks.

## User Story

As an engineer, I want to trigger automated component tests from a Test Console inside the app so that I can verify installs and diagnose issues without switching to external tooling.

## Acceptance Criteria

```
Given I open Settings ▸ Diagnostics ▸ Test Console
When I view the available test suites
Then I see grouped entries (WorkflowRuntime smoke, ConnectorRegistry contracts, DocumentBuilder checks, CLI harness) with status badges and last-run data

Given I select one or more suites
When I click “Run Selected Tests”
Then the UI streams logs in real time and shows pass/fail counts, duration, and links to saved artifacts

Given a run completes
When results are available
Then AuditLogService records the execution and NotificationService can alert on failures

Given the CLI is installed
When I click “Open in CLI”
Then the console shows the equivalent CLI command (e.g., `aiwm ops test --suite connector-registry`) that reproduces the run

Given a test suite requires environment variables
When prerequisites are missing
Then the Test Console flags the missing configuration and prevents execution until resolved
```

## Architecture Components

- TestConsole renderer module (diagnostics UI)
- Preload IPC surface for diagnostics/test commands
- TestRunnerService (main process) orchestrating Node child processes / scripts
- AuditLogService + NotificationService integration
- ConfigService entries for suite definitions and default CLI command paths
- ArtifactStore for saved reports/log bundles

## UX References

- `ux/narratives/settings.md` (Diagnostics/Test Console section to be added)
- `ux/wireframes/settings.md` (extend diagnostics panel with Test Console)
- `docs/ux-flows.md#diagnostics` (future update)

## Technical Notes

- Test suites defined in JSON/TS config mapping to npm scripts or custom runners; `TestRunnerService` spawns commands via `cross-spawn`.
- Results normalized to `{suiteId, status, durationMs, artifacts[]}` and cached locally for offline review.
- Streaming logs through IPC channel with backpressure handling; truncate to avoid freezing renderer.
- CLI command fallback ensures parity between UI and automation pipelines.
