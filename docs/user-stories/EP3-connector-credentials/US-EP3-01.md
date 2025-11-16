# Story: View available connectors and current selections

- **Epic**: EP3 — Connector & Credential Management
- **Persona**: Administrator
- **Priority**: P0
- **Status**: Draft

## Context

Admins need a single view of which connectors (storage, LLM, file, document) are available and which are currently active. This view should surface status (connected, needs key, coming soon) and quick actions.

## User Story

As an administrator, I want to view available connectors and current selections so that I can understand the system configuration at a glance.

## Acceptance Criteria

```
Given I open Settings ▸ Connectors
When the panel loads
Then I see cards for each connector category with the active adapter highlighted, status badge (Connected, Needs Key, Coming Soon), and quick actions (Configure, Learn more)

Given a connector is misconfigured
When I view the card
Then it shows warning badge with tooltip describing the issue and linking to configuration

Given I use CLI
When I run `aiwm connectors list`
Then I see the same information (category, selected adapter, status, last updated) in table or JSON format

Given connectors exist but I lack permissions
When I open the panel
Then restricted connectors appear read-only with lock icon and explanatory text
```

## UX References

- `docs/ux/narratives/settings.md`
- `docs/ux/wireframes/settings.md`

## Technical Notes

- Connector registry exposes metadata (name, description, capabilities, status).
- Need API endpoint for listing connectors, statuses, last test results.
- CLI reuse: `aiwm connectors list --json`.
- Open questions: Do we allow per-workflow overrides from this view?
