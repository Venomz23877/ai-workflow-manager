# Story: Manage CLI profiles and environments

- **Epic**: EP5 — Automation & CLI
- **Persona**: Integrator
- **Priority**: P1
- **Status**: Draft

## Context

Teams operate across environments (Dev, Staging, Prod). CLI should support named profiles with separate connectors, credentials, and config.

## User Story

As an integrator, I want to manage CLI profiles and environments so that I can run workflows against different configurations without editing config files manually.

## Acceptance Criteria

```
Given I run `aiwm profiles list`
When executed
Then I see available profiles with description, connector selections, and default status

Given I create a profile
When I run `aiwm profiles create prod --config config.prod.json`
Then the CLI validates the config, stores it via ConfigService, and copies relevant credentials/allowlists

Given I switch profiles
When I run `aiwm profiles use prod`
Then subsequent CLI commands target that profile until I switch back (persisted per shell/user)

Given I delete a profile
When dependencies exist (schedules, workflows)
Then the CLI prevents deletion until reassignment occurs

Given I run a command with `--profile staging`
When executed
Then the command overrides the current default for that invocation only
```

## Architecture Components

- ConfigService (profile storage + validation)
- CredentialVault (per-profile secrets)
- CLI profile command set
- ConnectorRegistry (resolves selections per profile)
- SchedulerService (ties schedules to profiles)

## UX References

- `docs/ux/narratives/cli-companion.md`

## Technical Notes

- Profiles stored as JSON documents referencing config tables; include connectors, file sandbox, notifications.
- Provide encryption for profile configs containing secrets.
- CLI should show active profile in prompts (optional).
