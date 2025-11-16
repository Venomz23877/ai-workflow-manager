# Sprint 4 Plan — Diagnostics & Automation

## Objectives

- Wire SchedulerService into WorkflowRuntime with renderer diagnostics/settings for logs, telemetry, notifications, and schedules.
- Deliver ConnectorRegistry/CredentialVault contracts across core, renderer, and CLI surfaces.
- Extend TemplateRegistry with permissions, export/import manifests, and renderer previews.
- Introduce retention automation for logging, telemetry, backups, and security scans.

## Scope Summary

1. **Scheduler & Diagnostics**
   - Replace placeholder hourly tick with cron parsing + persistence.
   - Connect SchedulerService to WorkflowRuntime command bus and NotificationService.
   - Build renderer settings panes for logs, telemetry, notifications, and schedule visibility.
2. **Connectors & Credentials**
   - Implement ConnectorRegistry interfaces, adapter factories, and health checks.
   - Build CredentialVault adapters (Win/Mac/Linux/fallback) with ConfigService storage.
   - Expose registry + vault flows via CLI (`aiwm connectors …`) and renderer settings.
3. **Template Registry Enhancements**
   - Add permission model (owners, editors, read-only consumers).
   - Implement TemplateExport/Import manifests and diff-aware previews.
   - Surface template diagnostics (dependencies, revision history) in renderer.
4. **Retention & Automation**
   - Define retention policies for logs, telemetry payloads, backups, and security scan reports.
   - Schedule automated cleanup jobs and notifications for expiring artifacts.
   - Ensure AuditLogService captures retention actions.

## Milestones & Deliverables

| Milestone                       | Deliverables                                                                    | Owners              | Target   |
| ------------------------------- | ------------------------------------------------------------------------------- | ------------------- | -------- |
| M1 — Scheduler Foundations      | Cron parser, persisted schedules, WorkflowRuntime wiring, CLI smoke tests       | Automation          | Week 1   |
| M2 — Diagnostics UI/IPC         | Renderer settings views, IPC bridges for logs/telemetry/notifications/schedules | Desktop             | Week 1–2 |
| M3 — Connector Registry & Vault | Interfaces, adapters, ConfigService schema, CLI + renderer management flows     | Core Runtime        | Week 2   |
| M4 — Template Extensions        | Permissions schema, export/import manifests, renderer previews                  | Document Experience | Week 2–3 |
| M5 — Retention Automation       | Policy config, scheduled cleanup jobs, notifications, tests                     | Platform Ops        | Week 3   |

## Dependencies & Risks

- **ConfigService maturity**: new sections for connectors, vault, diagnostics, and retention must be finalized before UI/CLI wiring.
- **WorkflowRuntime command bus**: Scheduler integration depends on stable APIs; coordinate with Runtime owners before merging.
- **Security review**: CredentialVault adapters and template manifest signing require threat modeling; schedule review by mid-sprint.
- **Testing bandwidth**: new cron + retention logic increases integration-test load; ensure CI capacity for additional suites.

## Acceptance Criteria

- Scheduler can create/list/pause/resume/delete cron-based runs via CLI/UI, triggering WorkflowRuntime commands and respecting notification preferences.
- Renderer settings show current logging/telemetry/notification states with live previews, persisted via ConfigService.
- ConnectorRegistry exposes add/list/test/remove across CLI/UI, backed by CredentialVault storage with audit logs for secret operations.
- TemplateRegistry enforces permissions, exports/imports signed manifests, and renders dependency previews in the document workspace.
- Retention policies configurable per artifact type with automated cleanup jobs and audit entries; manual override commands exist.
- `npm run test` covers new scheduler, connector, template, and retention modules; CLI smoke scripts documented in wrap-up.

## Work Breakdown

1. **Scheduler & Diagnostics**
   - [x] Implement cron parser + validation utilities.
   - [x] Extend SchedulerService schema (intervals, timezones, notification hooks).
   - [x] Wire runtime command bus + NotificationService events.
   - [x] Build renderer diagnostics panel + IPC handlers.
2. **Connector Registry & Credential Vault**
   - [x] Define TypeScript interfaces + registration API.
   - [ ] Implement OS-specific vault adapters with fallback encrypted store.
   - [x] Add ConfigService bindings + migration.
   - [ ] Create CLI commands (list/register/test/remove) and renderer settings forms.
3. **Template Registry Enhancements**
   - [x] Add permissions/ACL schema + enforcement.
   - [x] Implement export/import manifest generator + signature verification.
   - [ ] Build renderer previews (dependency tree, revision diff view).
4. **Retention Automation**
   - [x] Extend ConfigService with retention policies per artifact.
   - [x] Implement cleanup jobs + Scheduler wiring.
   - [x] Add telemetry/logging summarizing retention runs and audit entries.

## Testing & Verification

- Unit tests for cron parsing, vault adapters, template permissions, retention policies.
- Integration tests for scheduler-triggered workflow runs and connector registry operations.
- CLI smoke scripts for connectors, scheduler, and retention commands documented in `.ai_working/wrapup.md`.
- Renderer UI QA checklist for diagnostics/settings and template previews.

## Reporting

- Update `.ai_working/project_todo.md` as milestones complete.
- Include sprint progress in daily wrap-ups; capture blockers in `.ai_working/lessons_learned.md`.
