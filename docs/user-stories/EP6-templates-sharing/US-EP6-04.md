# Story: Export/import templates as signed packages

- **Epic**: EP6 — Templates & Sharing
- **Persona**: Integrator
- **Priority**: P1
- **Status**: Draft

## Context

Sharing templates between organizations requires portable, secure packages containing workflow definitions, documents, and metadata. Packages should be signed/hashed to ensure integrity.

## User Story

As an integrator, I want to export and import templates as signed packages so that I can share workflows across environments securely.

## Acceptance Criteria

```
Given I run `aiwm templates export onboarding --out onboarding.aipkg --sign`
When executed
Then the CLI (and UI) bundle workflow definition, referenced documents/templates, metadata, and dependency manifest into a package, sign it (if key available), and output checksum

Given I import a package
When I run `aiwm templates import onboarding.aipkg`
Then the tool verifies signature/hash, lists dependencies (connectors, docs), prompts for confirmation, and registers the template

Given dependencies are missing
When importing
Then the tool warns me and offers to install prerequisites (connectors, doc templates) or continue with placeholders

Given audit requirements
When packages are exported/imported
Then AuditLogService records events referencing package name, hash, user

Given UI parity
When I click “Export template” from gallery
Then I step through the same flow with progress feedback
```

## Architecture Components

- `TemplateExportService` / `TemplateImportService`
- `ConnectorRegistry` (dependency manifest)
- `DocumentRegistry` (documents bundled with template)
- `AuditLogService`
- CLI and renderer export/import flows

## UX References

- Template gallery narrative (TBD)
- `docs/ux/narratives/designer.md` (export controls)

## Technical Notes

- Package format: ZIP with manifest.json, workflow definition, documents, README, signature file.
- Signing uses optional organization certificate or hashed secret.
- Provide version compatibility checks.
