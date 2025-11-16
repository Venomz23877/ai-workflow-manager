# UX Narrative — Template Gallery

## Overview

The Template Gallery gives workflow architects a curated starting point. It emphasizes discoverability (filters, search, personas), readiness cues (dependency badges), and rapid adoption (Preview, Duplicate, Publish). The gallery lives within the dashboard context but can expand to full-screen when browsing large libraries.

## Layout Narrative

- **Hero strip** summarizing template collections (“Compliance Playbooks”, “Marketing Labs”), showing counts and a “Publish Template” CTA.
- **Filter bar** includes tag pills, persona dropdown, connector dependency filter, and search input.
- **Card grid/list toggle** for responsive layouts:
  - Cards highlight template title, persona badges, description snippet, required connectors/documents (icons with tooltips), last updated, owner avatar.
  - Action buttons: `Preview`, `Duplicate`, `Export`. Overflow menu for `Publish update`, `View versions`, `Manage permissions`.
- **Sidebar (right rail)** toggles between:
  - **Collections** (starred templates, recently viewed, team favorites).
  - **Dependency status** (shows missing connectors/documents in local environment with fix links).
  - **Notifications** for template updates/deprecations relevant to the user.
- **Preview drawer** slides over the grid showing:
  - Summary metadata, change log, dependency matrix (connectors/documents), preview images (future), and a “Use Template” CTA.
  - Tabs for Workflow overview, Document attachments, Versions, Permissions.

### ASCII Sketch (simplified)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Templates ▸ Compliance Collection                     [Publish Template]   │
│ Filters: [All][Compliance][Marketing] Persona: [Architect ▾] Search [___]   │
├───────────────────────┬───────────────────────┬───────────────────────┬────┤
│ ┌───────────────┐     │ ┌───────────────┐     │ ┌───────────────┐     │Side│
│ │Policy Review  │     │ │Marketing Loop │ ... │ │Onboarding Lab │     │bar │
│ │Persona: Ops   │     │ │Persona: Arch  │     │ │Persona: Ops   │     │    │
│ │Conn: ChatGPT   │     │ │Conn: Claude  │     │ │Conn: ChatGPT  │     │    │
│ │Docs: Markdown  │     │ │Docs: HTML    │     │ │Docs: Markdown │     │    │
│ │[Preview][Use]  │     │ │[Preview][Use]│     │ │[Preview][Use] │     │    │
│ └───────────────┘     │ └───────────────┘     │ └───────────────┘     │    │
└───────────────────────┴───────────────────────┴───────────────────────┴────┘
Preview Drawer (slides from right when open)
```

## Interaction Narrative

- **Filtering/search** updates cards without reloading, with applied-filter chips and “Clear” button.
- **Dependency badges**:
  - Red if required connector/document missing locally; clicking opens settings/document workspace.
  - Yellow for upcoming deprecations.
- **Preview drawer**:
  - `Use Template` opens duplication modal with workflow metadata.
  - `Publish update` available if user owns the template.
  - Versions tab lists history with diff links.
- **Notifications rail** shows updates; clicking entry filters gallery to affected template.
- **Keyboard navigation** uses arrow keys + Enter; `Ctrl+K` focuses search.

## Accessibility

- Cards include ARIA labels summarizing persona, dependencies, actions.
- Filters accessible via keyboard and screen readers.
- High-contrast theme ensures dependency badges use icons + text.
- Drawer supports `Esc` to close and focus return to prior card.

## Future Enhancements

- Compare view showing differences between template versions before adoption.
- Template rating/feedback system.
- Collaboration indicators (owners/reviewers shown inline).

## References

- `docs/user-stories/EP6-templates-sharing/US-EP6-01.md`
- `docs/user-stories/EP6-templates-sharing/US-EP6-02.md`
- `docs/traceability-matrix.md` (EP6 section)
