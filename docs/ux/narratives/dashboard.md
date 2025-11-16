# UX Narrative — Dashboard & Workflow Library

## Overview

The dashboard is the orchestrator’s home base. It answers two questions instantly: _what needs my attention?_ and _what can I start next?_ The layout balances monitoring (status chips, notifications) with creation affordances (CTA buttons, template gallery) so workflow architects and operators can move fluidly between drafting, running, and reviewing workflows.

## Layout Narrative

- **Hero strip** across the top greets the signed-in user, surfaces their most recent workflow, and hosts the “Create Workflow” split-button (Blank vs Template).
- **Workflow library grid** occupies the center. Cards show workflow name, status (Draft/Published/Needs Fix), last run timestamp, and two primary actions (Open Designer, Run). Hover reveals secondary actions (Duplicate, Export, Archive).
- **Right sidebar** doubles as an insight rail with tabs:
  - **Notifications**: trigger failures, credential warnings, doc export completions.
  - **Tasks**: validation issues assigned to the user.
  - **News**: release notes or tips of the day.
- **Footer utility row** lists CLI parity tips (`ai-workflow workflows list`), sync status, and links to docs/guardrails.

### ASCII Sketch (simplified)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Welcome back, Sasha!                        [Create Workflow ▼] [Import]    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Last touched: Policy Review v2 (Needs Fix)  | Run last >                     │
├──────────────────────┬──────────────────────────────────────────┬───────────┤
│ Workflow Cards       │                                          │ Sidebar   │
│ ┌───────────────┐    │  ┌───────────────┐   ┌───────────────┐   │ ┌───────┐│
│ │ Sales Playbook│    │  │ Policy Review │   │ Onboarding Lab│   │ │Notif. ││
│ │ Published     │    │  │ Needs Fix     │   │ Draft         │   │ │• ...  ││
│ │ Last run 1h   │    │  │ Last run 3h   │   │ No runs yet   │   │ └───────┘│
│ │ [Open][Run ]  │    │  │ [Fix][Run ]   │   │ [Edit][Run ]  │   │ ┌───────┐│
│ └───────────────┘    │  └───────────────┘   └───────────────┘   │ │Tasks ││
│ ...                  │  ...                                    │ │• ...  ││
├──────────────────────┴──────────────────────────────────────────┴───────────┤
│ CLI tip: `aiwm workflows list --status draft` | Sync: OK | Docs | Guardrails│
└─────────────────────────────────────────────────────────────────────────────┘
```

## Interaction Narrative

- **Create Workflow split-button** opens a contextual menu. Choosing “Blank” jumps straight to the designer; selecting a template opens a modal listing curated templates with preview thumbnails.
- **Card interactions**:
  - Primary button (Open) honors workflow status (disabled if user lacks permission).
  - Secondary CTA (Run) prompts for run context when necessary (select credential set, target documents).
  - Hover reveals inline quick-links: Duplicate, Export JSON, Archive.
  - Status chips pulse when attention required (“Needs Fix” animates with a subtle wiggle).
- **Filter/search**:
  - Pill filters (All, Drafts, Published, Needs Fix).
  - Search supports fuzzy name matching and tags (e.g., `#marketing`).
  - Results update live without leaving the page.
- **Notifications tab** groups alerts by severity. Clicking an item focuses the relevant workflow card, opening the inspector overlay with more detail.
- **Task tab** mirrors validation items assigned to the user; checking a task opens the designer at that node.
- **Keyboard/Screen-reader**:
  - `Tab` iterates through cards; `Enter` opens; `Shift+Enter` runs.
  - Cards announce workflow title, status, last run, and available actions.

## Interaction Contracts

| Scenario             | Input                           | System Reaction                                         | Outbound Events                                          |
| -------------------- | ------------------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| Start blank workflow | Click `Create Workflow → Blank` | Draft created, designer opens with onboarding hints     | `workflow.draft.created`                                 |
| Duplicate workflow   | Hover card, click `Duplicate`   | Modal requests new name; copy created with status Draft | `workflow.duplicate.requested`, `workflow.draft.created` |
| Run workflow         | Click `Run`                     | Run context dialog collects parameters, run enqueued    | `workflow.run.started`                                   |
| Dismiss notification | Click dismiss icon              | Alert archived; snackbar confirms dismissal             | `notification.dismissed`                                 |
| Filter by status     | Click `Needs Fix` pill          | Card grid re-filters; active filter badge highlighted   | `workflow.library.filtered`                              |

## Accessibility & Inclusivity

- All actionable elements exceed WCAG contrast ratios (4.5:1); color-only status indicators reinforced with icons/tooltips.
- Keyboard shortcuts for top actions (`Ctrl+N` new workflow, `Ctrl+F` focus search).
- Narrated descriptions for visually rich cards to support screen readers.
- Motion-reduced mode disables card hover animations.

## Error & Edge Cases

- **Sync offline**: hero strip displays offline banner with “Retry Sync” button; Run actions disabled with tooltip.
- **Credential expired**: affected workflows get warning badges; clicking prompts credential vault flow.
- **Empty state**: when no workflows exist, grid shows illustrated prompt with CTA to import sample workflows.

## Future Enhancements

- Collaborative indicators showing who last touched a workflow.
- Saved filter sets per persona (Architect vs Operator views).
- Inline analytics (run success rate, average duration).

## References

- `docs/ux-flows.md#A.-Designing-a-New-Workflow`
- `docs/user-requirements.md` — Dashboard goals
- Planned wireframes under `docs/ux/wireframes/dashboard.md` (TBD)
