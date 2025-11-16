# Wireframe — Visual Workflow Designer

This wireframe expands on `docs/ux/narratives/designer.md`, capturing the primary layout zones, key controls, and responsive considerations. ASCII diagram focuses on 1280×800 baseline; adapt proportions for larger canvases.

## Layout Reference

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Workflow Title (editable)   [Status Chip]  [Save Draft] [Validate] [Publish]│
├─────────────┬──────────────────────────────────────────┬───────────────────┤
│ Node Palette│                  Canvas                   │ Inspector Panel   │
│ ┌─────────┐ │  ┌─────────────────────────────────────┐ │ ┌───────────────┐ │
│ │Decision │ │  │  Mini-map (hidden < 12 nodes)      │ │ │ Tabs:          │ │
│ ├─────────┤ │  │                                     │ │ │ • Actions     │ │
│ │WorkStep │ │  │   ○ Node A (selected)               │ │ │ • Triggers    │ │
│ ├─────────┤ │  │    │ \                              │ │ │ • Metadata    │ │
│ │Loop     │ │  │    │  └─▶ ○ Node B                  │ │ ├───────────────┤ │
│ ├─────────┤ │  │    └────▶ ○ Node C (Loop)           │ │ │ Property form │ │
│ │+ Custom │ │  │  Validation badges inline           │ │ │ (inputs, tags)│ │
│ └─────────┘ │  │  Empty state hint when no nodes     │ │ └───────────────┘ │
├─────────────┴──────────────────────────────────────────┴───────────────────┤
│ Zoom [-][100%][+] | Mini-map toggle | Undo | Redo | Shortcuts | Run Preview │
└────────────────────────────────────────────────────────────────────────────┘
```

## Notes

- **Node Palette**: vertical list with icon, label, short tooltip. Includes search input at top when workflows exceed 8 node types.
- **Canvas**: supports pan with space+drag, zoom with mouse wheel (bounded 25%-200%). Validation badges appear as red circles on nodes/edges; click opens inspector.
- **Inspector tabs**: Actions (entry/exit), Triggers & Validators (list of configured items with add buttons), Metadata (tags, description, ownership). Tabs sticky while scrolling.
- **Footer controls**: Undo/Redo always visible; keyboard shortcut hint displayed when hovered.
- **Responsiveness**:
  - At widths < 1100px, inspector collapses to overlay triggered by selecting a node.
  - On ultra-wide screens, palette converts to icon-only rail with tooltips to maximize canvas width.

## Pending Decisions

- Whether to embed quick-edit popovers on the canvas for frequently tweaked properties.
- Placement of collaboration indicators once multi-user editing is introduced.

## References

- UX narrative: `docs/ux/narratives/designer.md`
- Architecture: Workflow authoring use cases, validation engine
