# Wireframe — Dashboard & Workflow Library

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Welcome back, <User>                               [Create Workflow ▼]    │
│ Last touched: Policy Review (Needs Fix)            [Resume editing]       │
├───────────────────────────────────────────────────────────────────────────┤
│ Filters: [All][Draft][Published][Needs Fix]   Search: [______________]    │
├───────────────────────┬───────────────────────┬───────────────────────┬───┤
│ ┌───────────────────┐ │ ┌───────────────────┐ │ ┌───────────────────┐ │   │
│ │ Workflow Name     │ │ │ Workflow Name     │ │ │ Workflow Name     │ │...│
│ │ Status chip       │ │ │ Status chip       │ │ │ Status chip       │    │
│ │ Last run time     │ │ │ Last run time     │ │ │ Last run time     │    │
│ │ [Open][Run][⋯]    │ │ │ [Open][Run][⋯]    │ │ │ [Open][Run][⋯]    │    │
│ └───────────────────┘ │ └───────────────────┘ │ └───────────────────┘    │
├───────────────────────────────────────────────────────────────────────────┤
│ Sidebar (Notifications / Tasks / Tips)                                    │
│ ┌───────────────┐                                                         │
│ │Notifications  │                                                         │
│ │• Loop stalled │                                                         │
│ ├───────────────┤                                                         │
│ │Tasks          │                                                         │
│ │• Fix validator│                                                         │
│ └───────────────┘                                                         │
├───────────────────────────────────────────────────────────────────────────┤
│ Footer: CLI tip | Sync status | Docs link | Guardrails link               │
└───────────────────────────────────────────────────────────────────────────┘
```

## Notes

- Cards resize responsively; on narrow screens switch to list view.
- Sidebar collapses on <1024px width and becomes slide-in drawer.
- Status chips use text + icon to avoid color-only cues.

## References

- `docs/ux/narratives/dashboard.md`
