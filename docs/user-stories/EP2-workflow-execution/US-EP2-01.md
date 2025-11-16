# Story: Launch workflow run from dashboard

- **Epic**: EP2 — Workflow Execution & Monitoring
- **Persona**: Operations Analyst
- **Priority**: P0
- **Status**: Draft

## Context

Operators initiate most runs directly from the dashboard cards. The experience should confirm configuration (version, credentials, documents) and provide immediate feedback (run ID, progress).

## User Story

As an operations analyst, I want to launch a workflow run from the dashboard so that I can start executions quickly without opening the designer.

## Acceptance Criteria

```
Given I am on the dashboard
When I click the “Run” button on a workflow card
Then a modal prompts me to confirm workflow version, connector selection, and optional run parameters before starting

Given the workflow requires manual inputs (e.g., document selection)
When I start the run
Then the modal includes those inputs or links me to the document workspace prior to launch

Given I confirm the run
When the run starts successfully
Then I see a toast with run ID, a link to the execution console, and the card reflects “Running…”

Given a run fails to start (e.g., missing credential)
When the error occurs
Then the modal displays actionable messaging and blocks launch until resolved

Given I prefer CLI
When I copy the CLI hint from the modal
Then I can run the equivalent `aiwm workflows run <slug>` command with the same parameters
```

## UX References

- `docs/ux/narratives/dashboard.md`
- `docs/ux/narratives/execution-console.md`

## Technical Notes

- Modal should call backend run service; handle optimistic updates on card.
- Provide API for templated run parameter forms.
- CLI hint includes `--version`, `--connector`, `--doc` flags as applicable.
- Open questions: Do we support scheduling directly from the modal?
