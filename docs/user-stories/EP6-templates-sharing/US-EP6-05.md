# Story: Manage template permissions and ownership

- **Epic**: EP6 — Templates & Sharing
- **Persona**: Administrator
- **Priority**: P1
- **Status**: Draft

## Context

Templates may contain sensitive logic. Admins need to control who can publish, edit, or consume templates, and ensure ownership/approval workflows exist.

## User Story

As an administrator, I want to manage template permissions and ownership so that only authorized users can publish or modify reusable assets.

## Acceptance Criteria

```
Given I open Template Settings
When I view a template
Then I can assign owner(s), reviewer(s), and consumption roles (who can duplicate/run)

Given permissions change
When I update them
Then AuditLogService records the change and dependent workflows receive notices if access is revoked

Given I restrict a template
When a user without permission tries to duplicate it
Then the UI/CLI blocks the action with a message explaining how to request access

Given approval workflow
When a contributor submits template changes
Then owners receive a notification to approve/reject before the template version becomes active

Given CLI usage
When I run `aiwm templates permissions set onboarding --owner natalie --consumer ops-team`
Then the same role mappings update
```

## Architecture Components

- TemplateRegistry (permission metadata)
- AuthZ layer / Role manager
- NotificationService (approval requests)
- AuditLogService
- CLI template permission commands

## UX References

- Template gallery narrative (permissions section)
- `docs/ux/narratives/settings.md` (future permissions UI)

## Technical Notes

- Store roles per template (owner, reviewer, consumer groups).
- Integrate with org directory or local role definitions.
- Provide API for future UI for approvals (modal, notifications).
