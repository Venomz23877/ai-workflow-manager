# Story: CLI command to scaffold workflow

- **Epic**: EP1 — Workflow Authoring
- **Persona**: Integrator
- **Priority**: P2
- **Status**: Draft

## Context

Developers and power users want to create workflows programmatically or as part of automation scripts. A CLI scaffolding command should prompt for metadata, create an empty workflow (or from template), and optionally include starter nodes.

## User Story

As an integrator, I want a CLI command to scaffold workflows so that I can create drafts quickly, check them into source control, and hand them to architects for refinement.

## Acceptance Criteria

```
Given I run `aiwm workflows scaffold onboarding-playbook`
When prompted
Then the CLI asks for title, description, default template (blank/template slug), and creates a draft workflow

Given I pass `--template policy-review`
When template exists
Then the scaffolded workflow duplicates that template automatically

Given I supply `--json config.json`
When the file contains metadata (name, description, tags)
Then the CLI uses those values without prompting interactively

Given the workflow slug already exists
When I attempt to scaffold
Then the CLI aborts with an informative error and suggests `--force` or new slug

Given the workflow is scaffolded
When I open the designer later
Then onboarding hints detect it was created via CLI and surface recent CLI actions in activity panel
```

## UX References

- `docs/ux/narratives/cli-companion.md`
- `docs/ux/narratives/designer.md` (onboarding hints)

## Technical Notes

- Command should optionally create starter nodes via flags (e.g., `--add decision --add workstep`).
- Output includes new workflow ID/slug and instructions to open in UI (`aiwm workflows open <slug>`).
- Scaffold logic reuses duplication/export codepaths to avoid drift.
- Open questions: Do we allow inline JSON definitions of nodes during scaffolding?
