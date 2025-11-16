# UX Narrative — Document Workspace

## Overview

The document workspace is where authors edit templates and outputs tied to workflow actions. It must gracefully handle multiple formats (Markdown, HTML, JSON, YAML, CSV) with syntax-aware editing, preview panes, and export controls. The experience emphasizes traceability: every edit signals downstream nodes to revalidate or regenerate artifacts.

## Layout Narrative

- **Header**: breadcrumb to workflow/node, document title, format dropdown, status indicator (Fresh, Modified, Locked). Primary actions: Save, Save & Revalidate, Export.
- **Body split**:
  - **Editor column** (left) with tabs for each open document. Editor automatically switches mode based on format (markdown preview, JSON schema validation, CSV grid).
  - **Preview column** (right) showing rendered Markdown/HTML, table preview for CSV, or formatted JSON diff against last saved version.
- **Context rail** (right sidebar) housing metadata (revision history, related nodes, last generator run) and quick links to open in external editor or duplicate template.
- **Footer**: status messages (autosave, lint errors), doc path, and CLI hint (`aiwm docs edit <docId>`).

### ASCII Sketch (simplified)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Workflow ▸ Node ▸ onboarding-guide.md (Markdown)   [Save][Save+Revalidate] │
├───────────────────────────┬────────────────────────────┬───────────────────┤
│ Tabs: onboarding.md | ... │ Rendered Preview           │ Metadata          │
│ ┌───────────────────────┐ │ ┌───────────────────────┐  │ ┌──────────────┐ │
│ │# Welcome Script       │ │ │ Preview pane          │  │ │ Revision log │ │
│ │Checklist items ...    │ │ │ (live updates)        │  │ │ Last run ... │ │
│ │                       │ │ └───────────────────────┘  │ └──────────────┘ │
│ └───────────────────────┘ │ Export buttons           │ │ Dependencies    │ │
├───────────────────────────┴────────────────────────────┴───────────────────┤
│ Autosave ready | CLI: `aiwm docs export onboarding --format pdf`           │
└────────────────────────────────────────────────────────────────────────────┘
```

## Interaction Narrative

- **Format-aware editing**:
  - Markdown: split preview toggle (`Ctrl+Shift+P`), toolbar for headings/lists, frontmatter detection.
  - HTML: code editor with live preview sandbox, warnings for unsafe tags.
  - JSON/YAML: schema validation with inline error panel; auto-format button.
  - CSV: spreadsheet-like grid with column typing, import/export controls.
- **Save flows**:
  - Manual Save shows toast with timestamp; `Save & Revalidate` triggers workflow validation service against dependent nodes.
  - Autosave runs after idle period; banner indicates unsaved changes when offline.
- **Revision history**:
  - Context rail lists prior revisions with diff preview; clicking reverts into a draft copy.
  - “Pin revision” marks a version as recommended template.
- **Dependency awareness**:
  - When editing a template bound to multiple workflows, metadata shows affected nodes; saving prompts confirmation.
  - Execution console badges highlight when document edits require rerun.
- **Keyboard/CLI parity**:
  - `Ctrl+Shift+E` opens export dialog; CLI command snippet auto-updates to reflect selected format, path.

## Interaction Contracts

| Scenario          | Input                            | System Reaction                                      | Outbound Events                                   |
| ----------------- | -------------------------------- | ---------------------------------------------------- | ------------------------------------------------- |
| Autosave          | Idle > 5s                        | Document saved locally, banner “Draft saved”         | `document.autosave.completed`                     |
| Save & Revalidate | Click button                     | Document persisted, validation queue triggered       | `document.saved`, `workflow.validation.requested` |
| Format switch     | Select new format (if supported) | Conversion confirmation shown; backup created        | `document.format.changed`                         |
| Export            | Click `Export`                   | Dialog to choose format/destination; success toast   | `document.export.generated`                       |
| Schema error      | Invalid JSON                     | Inline error highlight; save disabled until resolved | `document.validation.failed`                      |

## Accessibility & Inclusivity

- Editor supports screen readers with ARIA landmarks; preview updates announced in polite live region.
- Keyboard shortcuts for all toolbar actions; accessible color themes.
- Dyslexia-friendly font option and adjustable line spacing.
- Reduced-motion mode disables live preview transitions, showing instant updates instead.

## Error & Edge Cases

- **Conflict detection**: if another process modifies the same document, merge dialog appears (diff view, choose version).
- **Large files**: lazy loading with performance warning; offer download-only mode.
- **External lock**: when document is generated during a run, header shows “Locked by Run #1827” with link to console.

## Future Enhancements

- Collaborative comments anchored to document sections.
- Template variables inspector to preview resolved placeholders.
- AI-assisted editor for quick edits with guardrails.

## References

- `docs/ux-flows.md#D.-Editing-Documents-within-a-Workflow`
- `docs/user-requirements.md` — Document management requirements
