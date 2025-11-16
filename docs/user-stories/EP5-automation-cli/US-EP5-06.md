# Story: Enforce permissions and audit in CLI

- **Epic**: EP5 — Automation & CLI
- **Persona**: Administrator
- **Priority**: P2
- **Status**: Draft

## Context

CLI commands must respect user roles and produce audit trails just like the UI. Administrators need assurance that unauthorized commands fail and that every action is logged.

## User Story

As an administrator, I want CLI commands to enforce permissions and generate audit logs so that automation remains compliant with security policies.

## Acceptance Criteria

```
Given role-based permissions are configured
When a user without admin rights runs `aiwm connectors credentials set`
Then the CLI denies the request with an explanatory message and exit code

Given commands succeed
When they modify workflows, connectors, or documents
Then AuditLogService records command name, arguments (sanitized), user identity, timestamp, and outcome

Given I run `aiwm audit tail`
When executed
Then I can view recent CLI-triggered events filtered by user, command, or status

Given shared machines
When CLI starts
Then it prompts for user identity (or uses OS profile) and caches session tokens securely

Given automation tokens
When a headless agent runs commands with `AIWM_TOKEN`
Then permissions map to the token’s role and audit entries reference the token ID
```

## Architecture Components

- CLI auth middleware (profile/token manager)
- AuthN/AuthZ layer (role checks)
- CredentialVault / Secure token storage
- AuditLogService + audit CLI commands
- ConfigService (permission mappings)

## UX References

- `docs/ux/narratives/cli-companion.md`
- `.cursor/rules/` (security guardrails referenced in CLI help)

## Technical Notes

- Support multiple auth modes: OS user SSO, API token, future org SSO.
- Audit logs stored append-only; CLI tail command reuses same API as UI auditor.
- Consider `--impersonate` guardrails for admin debugging.
