# Story: Export workflow definition to JSON

- **Epic**: EP1 — Workflow Authoring
- **Persona**: Integrator
- **Priority**: P1
- **Status**: Draft

## Context

Integrators need to share workflows with other environments, run code reviews, or feed automation pipelines. Exporting to JSON (and future signed packages) should be simple, include metadata, and respect secrets/credentials.

## User Story

As an integrator, I want to export a workflow definition to JSON so that I can version it in Git, share it, or feed automated deployment scripts.

## Acceptance Criteria

```
Given I view a workflow in the designer
When I choose “Export → JSON”
Then I receive a JSON file containing workflow metadata, nodes, transitions, documents references, and timestamps (excluding secrets)

Given I run `aiwm workflows export <slug> --format json --out workflow.json`
When the command succeeds
Then the CLI prints the output path and checksum

Given the workflow references credentials or secret values
When exporting
Then the JSON contains opaque references (IDs) and a warning to fetch secrets via credential vault commands

Given I import the exported JSON later
When dependencies exist (documents, connectors)
Then the tool checks compatibility and surfaces missing items before allowing import

Given the workflow version is Draft
When I export
Then the JSON indicates `versionStatus: draft`; exporting a published version sets `versionStatus: published`
```

## UX References

- `docs/ux/narratives/designer.md` — export controls
- `docs/ux/narratives/dashboard.md` — card hover actions

## Technical Notes

- Define JSON schema under `docs/connector-interface.md` (future) or `docs/architecture.md`.
- Include checksum/hash to detect tampering.
- Support `--include-history` flag to export multiple versions.
- Consider signing packages in later iterations.
