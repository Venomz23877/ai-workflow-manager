# Wireframe — Execution Console

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Workflow: Policy Review   Run #1827   Status: RUNNING   [Pause][Stop][CLI] │
├───────────┬─────────────────────────────────────────────┬──────────────────┤
│ Timeline  │ Current Node Panel                         │ Control Drawer   │
│ 12:00 Entry ┌────────────────────────────────────────┐  │ Tabs:           │
│ 12:01 Valid │ Node name + type badge                 │  │ • Node Actions  │
│ 12:02 Trig. │ AI output stream (bubbles)             │  │ • Triggers/Val. │
│ ...        │ Progress bars for doc builders          │  │ • Artifacts     │
│            │ Mini-map of workflow (optional)         │  │-----------------│
│            └────────────────────────────────────────┘  │ Action buttons   │
├───────────┴─────────────────────────────────────────────┴──────────────────┤
│ Log stream: [INFO][WARN][ERROR]  JSON toggle  Auto-scroll toggle           │
└────────────────────────────────────────────────────────────────────────────┘
```

## Notes

- Timeline left rail collapses to top tabs on smaller viewports.
- Control drawer becomes bottom sheet on tablets.
- Log stream supports copying entries; truncated lines expand on Enter.

## References

- `docs/ux/narratives/execution-console.md`
