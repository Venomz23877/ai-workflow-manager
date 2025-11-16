# User Story Framework — AI Workflow Manager

This guide defines how we will capture product requirements during the specification sprint. All user stories live under `docs/user-stories/` grouped by epic.

## File & Naming Conventions

- Epics use folders prefixed with a short code (e.g., `EP1-workflow-authoring/`).
- Individual stories live in markdown files named `US-<epic>-<sequence>.md` (e.g., `US-EP1-01.md`).
- Each story file contains the sections described below; acceptance criteria use Gherkin-style statements.

## Story Template

```
# Story: <Concise title>

- **Epic**: <Epic name / code>
- **Persona**: <Primary user persona>
- **Priority**: P0 | P1 | P2 (P0 = must for launch)
- **Status**: Draft | In Review | Approved

## Context
<Narrative describing the problem, background, assumptions. Reference architecture or UX docs when relevant.>

## User Story
As a <persona>, I want <goal>, so that <outcome>.

## Acceptance Criteria
Given <precondition>
When <action>
Then <expected result>

(Add additional Given/When/Then blocks as needed.)

## UX References
- `docs/ux-flows.md#<section>` (flow)
- Wireframe: `<link or path>`

## Technical Notes
- Impacts modules: `<renderer | main | core | connectors | files | etc.>`
- Dependencies: `<other stories, architecture sections>`
- Open Questions: `<list>`
```

## Epic Structure

| Epic Code | Title                             | Description                                      |
| --------- | --------------------------------- | ------------------------------------------------ |
| EP1       | Workflow Authoring                | Visual designer, node configuration, validation  |
| EP2       | Workflow Execution                | Action console, triggers, monitoring, CLI parity |
| EP3       | Connector & Credential Management | Storage/LLM setup, vault interactions            |
| EP4       | Document Management               | Template editing, generation, exports            |
| EP5       | Automation & CLI                  | Headless execution, scripting, logs              |
| EP6       | Templates & Sharing               | Workflow/template library, export/import         |
| EP7       | Platform Operations               | Logging, telemetry, installer, upgrades          |

Additional epics can be appended as requirements expand. Each epic should include at least one “hero” story capturing the main use case plus supporting stories for edge cases and error handling.

## Workflow for Story Creation

1. Create a new file using the template above.
2. Link to relevant architecture sections and UX artifacts.
3. Submit for review via pull request; tagging Product, UX, Architecture reviewers.
4. Update `Status` to **Approved** once sign-off occurs.
5. Capture traceability in the project matrix (`docs/project-delivery-plan.md`).

Maintaining this structure ensures user needs map cleanly to architectural components and UX deliverables, enabling smooth handoff into implementation planning.
