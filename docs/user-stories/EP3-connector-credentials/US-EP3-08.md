# Story: View connector capabilities (models, limits)

- **Epic**: EP3 — Connector & Credential Management
- **Persona**: Workflow Architect
- **Priority**: P1
- **Status**: Draft

## Context

Architects need to know what each connector offers (supported models, max tokens, rate limits) to design workflows appropriately. Capabilities should be visible in settings and when selecting connectors per workflow.

## User Story

As a workflow architect, I want to view connector capabilities so that I can pick the right LLM/storage/file options for my workflows.

## Acceptance Criteria

```
Given I open Settings ▸ Connectors ▸ LLM
When I select a connector (ChatGPT, Claude)
Then I see a capabilities table listing supported models, max token counts, streaming support, latency tiers, and rate limit notes

Given I configure a node in the designer
When I select an LLM connector
Then the inspector shows capability highlights (e.g., “Claude: 200K context”) and warns if my prompts exceed limits

Given CLI usage
When I run `aiwm connectors capabilities --connector chatgpt --json`
Then I receive the same capability metadata in structured form

Given capabilities change (vendor updates)
When I refresh the panel
Then the app fetches latest metadata from connector registry or remote manifest and indicates last updated timestamp

Given a capability is unavailable on my current plan
When I view the connector
Then the UI marks features as “Coming soon” or “Upgrade required”
```

## UX References

- `docs/ux/narratives/settings.md`
- `docs/ux/narratives/designer.md` (node inspector hints)

## Technical Notes

- Capability metadata stored with connectors; update via manifest file or remote fetch.
- Provide caching and offline fallback.
- CLI should support `--format table`/`json`.
- Open questions: Do we allow custom connectors to define their own capability schema?
