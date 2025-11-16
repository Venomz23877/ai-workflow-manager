# Story: Configure storage connector (local SQLite default)

- **Epic**: EP3 — Connector & Credential Management
- **Persona**: Administrator
- **Priority**: P0
- **Status**: Draft

## Context

AI Workflow Manager ships with local SQLite storage but should allow configuring alternative connectors in the future. Admins must set file locations, backup policies, and readiness checks.

## User Story

As an administrator, I want to configure the storage connector so that workflows persist data reliably on the chosen backend.

## Acceptance Criteria

```
Given I open Settings ▸ Connectors ▸ Storage
When I select Local SQLite
Then I can configure DB file location, backup strategy, and migration options with inline validation (path existence, disk space warnings)

Given I choose a different storage adapter (future REST/Dynamo)
When I select it
Then the UI displays configuration fields relevant to that adapter and warns about migration requirements

Given I save configuration changes
When I click Save
Then the system validates connectivity/migrations before applying and logs the change

Given I use CLI
When I run `aiwm connectors storage set sqlite --path C:\AIWM\data.db`
Then configuration updates and the UI reflects the new path/status

Given migrations are pending
When I open the panel
Then I see a banner prompting me to run migrations with CTA to open `.cursor/rules/build-installer.mdc` references
```

## UX References

- `docs/ux/narratives/settings.md`
- `docs/ux/wireframes/settings.md`
- `docs/architecture.md` — Data storage section

## Technical Notes

- Storage config stored centrally; changes may require app restart.
- Provide command to run migrations automatically after config.
- Consider backup prompts before switching connectors.
- Open questions: do we allow multiple storage profiles selectable per workflow?
