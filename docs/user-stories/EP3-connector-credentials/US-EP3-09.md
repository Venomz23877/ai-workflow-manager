# Story: Rotate API key with audit log

- **Epic**: EP3 — Connector & Credential Management
- **Persona**: Administrator
- **Priority**: P1
- **Status**: Draft

## Context

Security policies require regular credential rotation. The system should guide admins through secure rotation, ensure no downtime, and capture audit records.

## User Story

As an administrator, I want to rotate API keys with full auditing so that we meet security requirements without breaking workflows.

## Acceptance Criteria

```
Given I open a connector credential in Settings
When I click “Rotate key”
Then the UI prompts me to enter the new key, optionally keep the old one active until tests pass, and update the credential vault atomically

Given the new key fails validation
When I attempt to rotate
Then rotation aborts, old key remains active, and I see detailed error guidance

Given rotation succeeds
When saved
Then workflows automatically switch to the new key without downtime, and an audit entry records old/new metadata (hash only), operator, timestamp, and optional reason

Given CLI usage
When I run `aiwm connectors credentials rotate chatgpt --label prod`
Then the command guides me through the same process and prints audit reference ID

Given compliance review
When I export audit logs
Then rotation events appear with searchable metadata
```

## UX References

- `docs/ux/narratives/settings.md`
- `docs/ux/narratives/cli-companion.md`

## Technical Notes

- Vault operations should be transactional (write new key, update pointer, purge old key if requested).
- Provide reminder scheduler for rotations.
- Audit log storage should be append-only with tamper resistance.
- Open questions: Should we support dual-key mode (primary/fallback) simultaneously?
