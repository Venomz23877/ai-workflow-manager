# Story: Backup and restore configurations & data

- **Epic**: EP7 — Platform Operations & Quality
- **Persona**: Administrator
- **Priority**: P1
- **Status**: Draft

## Context

Disaster recovery requires consistent backups of workflows, documents, connector configs, and credentials (metadata only). Admins need one-click (or CLI) backup/restore flows with integrity checks.

## User Story

As an administrator, I want to backup and restore configurations/data so that I can recover from hardware failures or migrate machines.

## Acceptance Criteria

```
Given I open Settings ▸ Backup
When I click “Create backup”
Then the app packages workflows, templates, documents, configs, schedules, and connector metadata into an encrypted archive, storing it in a chosen location

Given I restore
When I select a backup file
Then the system verifies checksum, previews contents, warns about overwriting, and applies changes transactionally (with rollback on failure)

Given CLI usage
When I run `aiwm ops backup create --out backup.aiwm`
Then the same process runs headlessly with progress output

Given scheduling
When I enable automatic nightly backups
Then backups rotate per retention policy and notify me on failure

Given credentials
When backups run
Then secret values aren’t stored directly; only metadata/IDs included, with instructions to re-enter secrets post-restore
```

## Architecture Components

- BackupService (orchestrator)
- WorkflowRepository, DocumentRegistry, ConfigService, TemplateRegistry
- CLI backup/restore commands
- Settings backup panel
- CredentialVault (metadata only)

## UX References

- Future settings backup narrative
- `docs/traceability-matrix.md` once updated

## Technical Notes

- Archive format: encrypted ZIP/tar with manifest, hashed for integrity.
- Provide retention policy config & cleanup job.
- Restore runs validations before applying; partial failure triggers rollback + report.
