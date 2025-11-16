# Story: Notify users of template updates or deprecations

- **Epic**: EP6 — Templates & Sharing
- **Persona**: Operations Analyst
- **Priority**: P1
- **Status**: Draft

## Context

Templates evolve. Teams using older versions need proactive notifications when updates or deprecations occur so they can migrate workflows.

## User Story

As an operations analyst, I want notifications when templates I depend on change so that I can update my workflows promptly.

## Acceptance Criteria

```
Given a template receives a new version
When I have workflows derived from that template
Then the dashboard Notifications panel shows an alert with summary, version diff link, and CTA to open comparison

Given a template is deprecated
When the owner marks it
Then dependent workflows display warning badges in the designer/dashboard until upgraded

Given I subscribe/unsubscribe
When I adjust template notifications
Then NotificationPreferenceService updates my settings and they sync across devices

Given CLI usage
When I run `aiwm templates updates list --template onboarding`
Then I see available updates and upgrade instructions

Given I upgrade
When I click “Apply update”
Then the tool runs diff, merges changes (with conflict prompts), and updates the workflow version
```

## Architecture Components

- TemplateRegistry (version tracking, dependencies)
- NotificationService + NotificationPreferenceService
- Dashboard UI (notifications rail) & Designer warnings
- CLI template update commands
- WorkflowDiffService (for comparing template versions vs workflows)

## UX References

- `docs/ux/narratives/dashboard.md`
- Template gallery narrative (TBD)

## Technical Notes

- Maintain mapping between template version and workflows (stored in registry).
- Diff engine highlights structural differences; manual merge UI out of scope for MVP but flagged as future.
