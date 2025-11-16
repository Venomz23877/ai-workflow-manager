# UX Narrative & Prototyping Plan — AI Workflow Manager

## Objective

Define the approach and deliverables for expressing UX intent through narrative specs, ASCII sketches, and in-repo coded prototypes aligned with `docs/ux-flows.md`.

## Approach Shift

The team opted to forgo external design tools (e.g., Figma). UX deliverables will stay entirely within the repo so they remain versioned alongside code and documentation. We will use:

- **Narrative Specs**: Expanded prose describing interactions, edge cases, and accessibility considerations.
- **ASCII/Markdown Sketches**: Simple diagrams or tables to communicate layout and hierarchy.
- **Code Prototypes**: Lightweight React/Electron views or Storybook-esque examples stored under `src/ux-prototypes/` (directory to be created) to demonstrate interactive flows.

## Deliverable Structure

- `docs/ux/narratives/dashboard.md`
- `docs/ux/narratives/designer.md`
- `docs/ux/narratives/execution-console.md`
- `docs/ux/narratives/document-workspace.md`
- `docs/ux/narratives/settings.md`
- `docs/ux/narratives/cli-companion.md`
- `docs/ux/sketches/*.md` for ASCII layouts where helpful.
- `src/ux-prototypes/` for coded samples (to be scaffolded later).

Each file will include:

1. Overview narrative referencing `docs/ux-flows.md`.
2. ASCII sketch or layout table when necessary.
3. Annotation list and event handling notes.
4. Accessibility checklist (focus order, semantics, shortcuts).
5. Links to any supporting code prototypes.

## Workflow

1. **Week 1 (current)**
   - Finalize UX requirements, confirm screen inventory, decide sketch format per screen.

2. **Week 2**
   - Produce narrative drafts and accompanying ASCII sketches; review with Product/Architecture.
   - Lock interaction patterns (drag/drop behaviors, notifications, validation states).

3. **Week 3**
   - Implement interactive code prototypes for high-risk flows (designer drag/drop, execution console updates).
   - Document component behaviors and list reusable UI primitives.

4. **Week 4**
   - Polish narratives, integrate feedback, finalize accessibility notes.
   - Update `docs/ux-flows.md` to reference final wireframes.
   - Align code prototypes with architecture and story acceptance criteria.

## Asset Management

- Narrative/sketch markdown files stay under version control without binary assets.
- Code prototypes live in `src/ux-prototypes/` with README covering setup and usage.
- If screenshots become necessary later, add them under `docs/ux/reference/` with clear provenance.

## Open Questions

- Do we need a minimal shared CSS/Design token library before coding prototypes?
- Should we schedule user testing sessions using the coded prototypes?
- What localization requirements might affect layout narrative (LTR vs RTL)?

## Next Actions

- [ ] Create `docs/ux/narratives/` and migrate flows into individual screen specs.
- [ ] Establish ASCII sketch template for recurring layouts.
- [ ] Decide location and build tooling for `src/ux-prototypes/`.
- [ ] Schedule weekly UX review sessions.

This plan keeps UX design traceable and code-adjacent, ensuring narrative flows, ASCII sketches, and runnable prototypes evolve in lockstep with user stories and architecture decisions.
