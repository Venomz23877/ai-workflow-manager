# Story: Add ChatGPT API key via settings UI

- **Epic**: EP3 — Connector & Credential Management
- **Persona**: Administrator
- **Priority**: P0
- **Status**: Draft

## Context

Admins must store ChatGPT API keys securely using the credential vault. The UI should guide them through input, validation, testing, and auditing.

## User Story

As an administrator, I want to add a ChatGPT API key via the settings UI so that the LLM connector can authenticate safely.

## Acceptance Criteria

```
Given I open Settings ▸ Connectors ▸ LLM ▸ ChatGPT
When I click “Add API Key”
Then a form appears with masked input, environment label, and optional description

Given I enter a key
When I click “Test & Save”
Then the app validates the key by calling OpenAI test endpoint, surfaces success/failure, stores the key in the credential vault, and updates the connector status to Connected

Given the OS keychain is unavailable
When I try to save
Then the UI instructs me to configure the fallback encrypted store before proceeding

Given I add a new key
When saved
Then an audit log entry is created with timestamp, user, and reason (optional field)

Given I prefer CLI
When I run `aiwm connectors credentials set chatgpt`
Then the command prompts for the key, tests it, and updates the same status indicators in the UI
```

## UX References

- `docs/ux/narratives/settings.md`
- `docs/ux/wireframes/settings.md`

## Technical Notes

- Integrate with OS keychain wrappers (node-keytar) or fallback encrypted file.
- Store metadata (created_by, last_tested_at).
- Provide test endpoint stub for offline mode.
- Open questions: Do we support multiple ChatGPT profiles (prod/sandbox)?
