# Wireframe — Template Gallery

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Templates                                [Publish Template] [Import]       │
│ Filters: [All][Compliance][Ops][Marketing] Persona: [Architect ▾] Search []│
├───────────────────────────┬───────────────────────────┬────────────────────┤
│ ┌───────────────────────┐ │ ┌───────────────────────┐ │ Sidebar           │
│ │ Policy Review v2      │ │ │ Marketing Loop Kit    │ │ ┌──────────────┐ │
│ │ Persona: Ops          │ │ │ Persona: Marketing    │ │ │ Collections  │ │
│ │ Conn: ChatGPT (✔)     │ │ │ Conn: Claude (!missing)│ │ │ • Favorites  │ │
│ │ Docs: Markdown        │ │ │ Docs: HTML            │ │ │ • Recent     │ │
│ │ [Preview][Use][⋯]     │ │ │ [Preview][Use][⋯]     │ │ └──────────────┘ │
│ └───────────────────────┘ │ └───────────────────────┘ │ ┌──────────────┐ │
│ …                           │ …                         │ │ Notifications│ │
│                             │                           │ │ • Update xyz │ │
│                             │                           │ └──────────────┘ │
├────────────────────────────────────────────────────────────────────────────┤
│ Preview Drawer (slides in)                                               ⇨ │
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │ Template: Policy Review v2        Owner: Sasha Carter                │   │
│ │ Persona: Operations Analyst       Last updated: Nov 12               │   │
│ │ Required connectors: ChatGPT      Required docs: Markdown template   │   │
│ │ [Use Template] [Duplicate] [Export]                                  │   │
│ │ Tabs: Overview | Documents | Versions | Permissions                  │   │
│ │ Overview content...                                                  │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
```

## Notes

- Card badges use icons + text (`✔` for available, `!` for missing dependency).
- Sidebar collapses below 1200px; preview drawer becomes full-screen overlay on tablets.
- Filters persist across sessions (stored via ConfigService).

## References

- `docs/ux/narratives/template-gallery.md`
- `docs/user-stories/EP6-templates-sharing/`
