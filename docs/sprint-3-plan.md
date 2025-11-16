## Sprint 3 Plan — Operations & Automation Hardening

### Objectives

1. Instrument the platform with structured logging, opt-in telemetry, and diagnostics CLI tools.
2. Deliver SchedulerService + notification preferences groundwork to unblock future automation.
3. Provide baseline backup and security scanning utilities for local deployments.
4. Extend documentation/Test Console to reflect the new operational components.

### Completed Scope

- LoggingService & TelemetryService hooked into document exports, draft publish flow, and CLI (`ops logs`, `ops telemetry ...`).
- NotificationPreferenceService and SchedulerService persistence with CLI commands (`schedule add/list/pause/resume`).
- BackupService (create/list/restore) and SecurityScanner (npm audit wrapper) wired through CLI and logging.
- Renderer workflow tab now surfaces draft validation/publish controls; document workspace exports all formats.
- Vitest suites cover logging, scheduler, publish, document services, and are available through the Test Console.
- `docs/implementation-plan.md` updated with Sprint 3 status and remaining work.

### Remaining Follow-ups

1. Replace placeholder scheduler cadence with cron parsing/timers and wire runs into WorkflowRuntime once the execution bus is ready.
2. Add renderer settings panels for notification preferences, logging/telemetry opt-in, and schedule management.
3. Automate periodic backups/security scans via SchedulerService and record notifications based on preferences.
4. Extend TemplateRegistry with permissions/import/export plus document diff previews in the renderer.

### Definition of Done

- Logging/telemetry, scheduler/notifications, backup/security scanner available via CLI/IPC ✅
- Renderer/CLI sprint parity (draft publish, document exports, telemetry toggles) ✅
- Tests updated (`logging-service`, `scheduler-service`, `workflow-publish`, `document-service`) and surfaced via Test Console ✅
- Documentation refreshed to capture Sprint 3 deliverables ✅
