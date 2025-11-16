# Story: Export/import connector configuration bundle

- **Epic**: EP3 — Connector & Credential Management
- **Persona**: Administrator
- **Priority**: P2
- **Status**: Draft

## Context

Admins need to replicate configurations across machines or keep backups. Exporting a sanitized bundle (connector selections, non-secret metadata, file sandbox settings) and importing it later streamlines setup.

## User Story

As an administrator, I want to export and import connector configuration bundles so that I can replicate environments and recover quickly.

## Acceptance Criteria

```
Given I open Settings ▸ Connectors
When I click “Export config”
Then I receive a JSON (or signed) bundle containing connector selections, capability settings, file sandbox rules, and credential metadata (but not secret values), along with checksum

Given I need to restore on another machine
When I click “Import config” and choose the bundle
Then the UI previews differences, warns about missing credentials, and applies compatible settings upon confirmation

Given CLI usage
When I run `aiwm connectors config export --out config.json`
Then the tool generates the same bundle; `aiwm connectors config import config.json` applies it with prompts

Given bundle tampering or version mismatch
When import runs
Then validation fails with clear messaging and no changes are applied

Given security policies
When exporting
Then audit logs capture who exported, timestamp, and reason; bundle optionally encrypted with passphrase
```

## UX References

- `docs/ux/narratives/settings.md`
- `.ai_working/project_todo.md` — configuration management guidelines

## Technical Notes

- Define bundle schema (metadata, connectors, file sandbox, doc paths).
- Provide versioning to handle breaking changes.
- Credential metadata includes IDs so keys can be re-associated after import.
- Open questions: Should we support signing bundles with org certificates?
