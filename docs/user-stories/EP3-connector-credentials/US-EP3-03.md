# Story: Add Claude API key via settings UI

- **Epic**: EP3 — Connector & Credential Management
- **Persona**: Administrator
- **Priority**: P0
- **Status**: Draft

## Context

Similar to ChatGPT, teams must configure Anthropic Claude credentials. The flow should mirror other connectors for consistency.

## User Story

As an administrator, I want to add a Claude API key via the settings UI so that I can use the Claude connector in workflows.

## Acceptance Criteria

```
Given I open Settings ▸ Connectors ▸ LLM ▸ Claude
When I click “Add API Key”
Then a modal prompts for API key, optional label (e.g., “Compliance Sandbox”), and environment selection

Given I submit the key
When I click “Test & Save”
Then the system validates with Anthropic test endpoint, stores the key in the credential vault, and updates the connector card to Connected

Given validation fails
When I attempt to save
Then the error message includes HTTP response details and suggested fixes

Given I rotate keys periodically
When I save a new key
Then the old key is archived (optional) and audit log reflects rotation

Given CLI usage
When I run `aiwm connectors credentials set claude --label "Sandbox"`
Then the command performs the same validation and surfaces status
```

## UX References

- `docs/ux/narratives/settings.md`
- `docs/ux/wireframes/settings.md`

## Technical Notes

- Credential vault structure should support multiple keys per connector; default selection flagged.
- Provide optional usage limits metadata.
- Reuse shared validation component for connectors.
- Open questions: Should we allow connectors to auto-select fallback keys per workflow?
