# Story: Script connector and credential setup

- **Epic**: EP5 — Automation & CLI
- **Persona**: Integrator
- **Priority**: P1
- **Status**: Draft

## Context

Infrastructure-as-code workflows need to bootstrap connectors and credentials automatically (e.g., in onboarding scripts). CLI should provide commands to set connectors, apply configs, and validate status without the UI.

## User Story

As an integrator, I want to script connector and credential setup so that new environments can be provisioned via automation.

## Acceptance Criteria

```
Given I run `aiwm connectors config apply config.json`
When executed
Then the CLI validates the config bundle, updates connector selections, runs health checks, and prints a summary table

Given I set credentials from env vars
When I run `aiwm connectors credentials set chatgpt --key-env OPENAI_KEY`
Then the CLI reads the environment variable (without echoing) and stores/testing the key

Given I need to test all connectors
When I run `aiwm connectors test --all`
Then the CLI iterates through each connector, printing status + latency

Given automation pipelines
When I pass `--json`
Then success/failure details output in structured format

Given audit requirements
When changes occur
Then AuditLogService captures entries referencing the CLI command and user identity
```

## Architecture Components

- CLI connector/credential command suite
- ConnectorRegistry (selection + health checks)
- CredentialVault adapters
- ConfigService (bundles)
- AuditLogService

## UX References

- `docs/ux/narratives/cli-companion.md`
- `docs/traceability-matrix.md`

## Technical Notes

- Config bundle schema shared with EP3 export/import.
- Support dry-run mode (`--dry-run`) to preview changes.
- Commands should return non-zero on failures to allow CI gating.
