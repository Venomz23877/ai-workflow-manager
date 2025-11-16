# Story: Test connector credentials and view status badge

- **Epic**: EP3 — Connector & Credential Management
- **Persona**: Administrator
- **Priority**: P0
- **Status**: Draft

## Context

Admins need quick assurance that stored credentials still work. Testing should be instant, with status badges updating across UI/CLI.

## User Story

As an administrator, I want to test connector credentials and see status badges so that I know which connectors are ready for use.

## Acceptance Criteria

```
Given I view a connector card
When I click “Test connection”
Then the UI triggers a lightweight API call, shows spinner, and updates the badge to Connected (green) or Failed (red) with timestamp

Given a test fails
When failure occurs
Then I can click “Details” to see the error message, response code, and recommended remediation steps

Given I prefer CLI
When I run `aiwm connectors test chatgpt`
Then the CLI performs the same test and prints status plus latency metrics

Given connectors auto-test nightly
When a test fails
Then the dashboard notifications panel surfaces the issue and suggests reconfiguration

Given multiple environments (Dev/Prod)
When I view the card
Then each environment displays its own status badge and last-tested timestamp
```

## UX References

- `docs/ux/narratives/settings.md`
- `docs/ux/narratives/dashboard.md` (notifications surfacing)

## Technical Notes

- Implement background job to test connectors on schedule; store results in DB.
- Provide API to fetch last test results, latencies, error summaries.
- CLI `--json` output for integration with monitoring.
- Open questions: Should we expose test webhooks for custom connectors?
