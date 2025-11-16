# Story: Apply database migrations safely

- **Epic**: EP7 — Platform Operations & Quality
- **Persona**: Engineer
- **Priority**: P1
- **Status**: Draft

## Context

Schema changes should run via managed migrations with backups, dry runs, and rollback. Engineers need tools to apply migrations safely across environments.

## User Story

As an engineer, I want to apply database migrations safely so that schema updates don’t corrupt user data.

## Acceptance Criteria

```
Given migrations exist
When I run `aiwm ops migrate --dry-run`
Then the tool analyzes pending migrations, prints planned steps, and blocks if conflicts exist

Given I run without `--dry-run`
When migrations execute
Then the tool creates a backup snapshot, applies migrations transactionally, logs progress, and reports success/failure

Given a migration fails
When it happens
Then the system automatically restores from backup and logs the failure with instructions

Given the app launches
When migrations are pending
Then the UI warns me and offers to run migrations or exit

Given CLI exit codes
When migrations run
Then exit code reflects success (0), warnings (1), or failure (2)
```

## Architecture Components

- MigrationService (better-sqlite3-migrations or custom)
- BackupService (snapshot before migrations)
- WorkflowRepository / Document tables (targets)
- CLI ops migrate command
- Logging/Audit services

## UX References

- `.cursor/rules/build-installer.mdc`
- Future migration guide (TBD)

## Technical Notes

- Migrations tracked in `migrations` table (version, checksum, applied_at).
- Provide hook for connectors beyond SQLite later.
