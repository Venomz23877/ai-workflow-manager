# Wireframe — Document Workspace

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Workflow ▸ Node ▸ onboarding.md (Markdown)    [Save][Save & Revalidate][Exp]│
├───────────────────────────┬──────────────────────────────┬──────────────────┤
│ Tab bar: onboarding.md ...│ Rendered Preview             │ Metadata rail    │
│ ┌───────────────────────┐ │ ┌────────────────────────┐   │ ┌────────────┐   │
│ │ Markdown editor       │ │ │ Live preview pane      │   │ │ Revisions  │   │
│ │ (syntax highlight)    │ │ │ (split toggle)         │   │ │ • v12 ...  │   │
│ │ Toolbar (H1, list, etc│ │ └────────────────────────┘   │ ├────────────┤   │
│ └───────────────────────┘ │ Export buttons, format switch│ │ Dependencies│   │
├───────────────────────────┴──────────────────────────────┴──────────────────┤
│ Status: Autosave ready | CLI tip: `aiwm docs edit onboarding.md --json`     │
└────────────────────────────────────────────────────────────────────────────┘
```

## Notes

- Tabs support keyboard shortcuts (Ctrl+Tab). Cards show format icon.
- Preview column collapses to toggle button under 1100px width.
- Metadata rail lists affected workflows, last generator run, quick links to open run logs.

## References

- `docs/ux/narratives/document-workspace.md`
