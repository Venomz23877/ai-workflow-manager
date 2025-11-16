# Story: Run installer validation & first-run checks

- **Epic**: EP7 — Platform Operations & Quality
- **Persona**: Administrator
- **Priority**: P0
- **Status**: Draft

## Context

Packaging/installer flows must verify prerequisites (dependencies, keychain availability, migrations) and run first-run diagnostics so support teams know the environment is ready.

## User Story

As an administrator, I want installer validation and first-run checks so that deployments succeed predictably.

## Acceptance Criteria

```
Given I run the Windows installer
When installation completes
Then a validation wizard runs migrations, tests CredentialVault availability, ensures file sandbox directories exist, and reports status before launching the app

Given a validation step fails
When failure occurs
Then the installer rolls back or instructs the user how to fix the issue (e.g., install VC++ runtime)

Given first-run
When the app launches
Then it executes a checklist (DB connectivity, connector registry health, log directory permissions) and stores the results for support

Given CLI usage
When I run `aiwm ops validate-install`
Then the same checks run post-install and output JSON summary

Given documentation
When `.cursor/rules/build-installer.mdc` updates
Then the installer references those guardrails
```

## Architecture Components

- Packaging scripts / Installer (electron-builder)
- `InstallationValidator` module (migrations, keychain check, sandbox directories)
- MigrationService
- CredentialVault
- CLI ops validation command

## UX References

- `.cursor/rules/build-installer.mdc`
- Future installer UX doc (TBD)

## Technical Notes

- Validation results stored in `logs/install-validation.json`.
- Provide silent install flag `--skip-validation` (not recommended) with warning.
