# Story: Browse and filter workflow templates

- **Epic**: EP6 — Templates & Sharing
- **Persona**: Workflow Architect
- **Priority**: P0
- **Status**: Draft

## Context

Architects rely on curated templates to jump-start projects. The template gallery should surface metadata (persona, use case, difficulty) and allow filtering by tags, connectors, or document requirements.

## User Story

As a workflow architect, I want to browse and filter workflow templates so that I can quickly find starting points relevant to my team.

## Acceptance Criteria

```
Given I open the Template Gallery
When it loads
Then I see cards showing template name, persona, description, required connectors, last updated, and CTA buttons (Preview, Duplicate)

Given I use filters
When I select tags (e.g., compliance, marketing) or connectors (ChatGPT, Claude)
Then the list updates instantly without refreshing the page

Given I search by keyword
When I type
Then results show matching templates with highlighted terms

Given CLI usage
When I run `aiwm templates list --tag compliance --json`
Then I receive the same metadata for scripting

Given templates require dependencies not installed locally
When I hover the warning badge
Then I see a tooltip explaining the missing connectors/documents with links to configure them
```

## Architecture Components

- `TemplateRegistry` (stores metadata, tags, dependencies)
- Renderer template gallery UI (dashboard integration)
- `ConnectorRegistry` (for dependency markers)
- `DocumentRegistry` (references required documents)
- CLI template listing commands

## UX References

- `docs/ux-narratives/dashboard.md` (template references planned)
- Future dedicated template gallery narrative (TBD)

## Technical Notes

- Template records include `required_connectors`, `required_documents`, `persona`, `tags`.
- Support pagination/infinite scroll.
- Provide caching for gallery data to avoid repeated DB hits.
