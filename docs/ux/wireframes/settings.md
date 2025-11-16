# Wireframe — Settings & Connector Management

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Settings ▸ Connectors                                 Last saved: 2m ago  │
├─────────┬────────────────────────────────────────────┬─────────────────────┤
│ Nav     │ Connector matrix                          │ Summary / Audit     │
│ ▸ General  ┌────────────┐ ┌────────────┐             │ ┌───────────────┐   │
│ ▸ Connect  │ Storage    │ │ LLM        │             │ │ Unsaved edits │   │
│ ▸ Creds    │ Local SQLite| │ ChatGPT   │             │ │ • ChatGPT key │   │
│ ▸ Sandbox  │ Connected  │ │ Needs Key  │             │ ├───────────────┤   │
│ ▸ Docs     │ [Configure]│ │ [Add key]  │             │ │ Audit log     │   │
│ ▸ Advanced └────────────┘ └────────────┘             │ │ • Key rotated │   │
│         Credential Form (masked input + test button) │ └───────────────┘   │
│         File Sandbox tree with toggles               │ CLI snippet area    │
├─────────┴────────────────────────────────────────────┴─────────────────────┤
│ Footer: Help link | CLI tip: `aiwm connectors list`                         │
└────────────────────────────────────────────────────────────────────────────┘
```

## Notes

- Nav rail collapses to icons on narrow widths.
- Summary panel shows audit entries, CLI equivalents, unsaved change badges.
- Credential test results surface inline success/error tags.

## References

- `docs/ux/narratives/settings.md`

---

## Logging & Telemetry Panels

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Settings ▸ Logging                                   Last saved: 30s ago   │
├─────────┬────────────────────────────────────────────┬─────────────────────┤
│ Nav     │ Modules                                    │ Preview / Summary   │
│ ▸ General  Main:  [ERROR|WARN|INFO|DEBUG]            │ ┌───────────────┐   │
│ ▸ Connect  Renderer:[ERROR|WARN|INFO|DEBUG]          │ │ Live preview  │   │
│ ▸ Logging  Connectors:[ERROR|WARN|INFO|DEBUG]        │ │ log lines ... │   │
│ ▸ Telemetry Destinations: [File] [Console] [Webhook] │ └───────────────┘   │
│ ▸ Backup   File path: [C:\logs\aiwm.log] (rotation)  │ Unsaved changes...  │
├─────────┴────────────────────────────────────────────┴─────────────────────┤
│ Buttons: [Test Destination] [Download log bundle]                          │
└────────────────────────────────────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Settings ▸ Telemetry                                Status: Disabled       │
├─────────┬────────────────────────────────────────────┬─────────────────────┤
│ Nav     │ Toggle [ Off ○● On ]                      │ Summary              │
│ ▸ ...   │ Privacy statement text + confirmation box │ Recent uploads list │
│         │ [Preview Payload] [Send diagnostics once] │                      │
├─────────┴────────────────────────────────────────────┴─────────────────────┤
│ Footer: Link to privacy docs | CLI tip: `aiwm ops telemetry enable`        │
└────────────────────────────────────────────────────────────────────────────┘
```

## Backup Panel

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Settings ▸ Backup                                   Last backup: 1h ago    │
├─────────┬────────────────────────────────────────────┬─────────────────────┤
│ Nav     │ [Create Backup] [Restore Backup]          │ Schedule             │
│ ▸ ...   │ Backup list:                              │ ┌──────────────┐    │
│         │ ┌───────────────┐                         │ │ Auto Backup  │    │
│         │ │ Timestamp     │ Size │ Status │ Actions │ │ [On] cron ▾  │    │
│         │ │ 2025-11-14    │ 1.2G │ OK     │ (DL ▾)  │ │ Retention: 5 │    │
│         │ └───────────────┘                         │ └──────────────┘    │
├─────────┴────────────────────────────────────────────┴─────────────────────┤
│ Restore modal preview: items included, warnings, confirm checkbox          │
└────────────────────────────────────────────────────────────────────────────┘
```

## Notes

- Logging preview scrolls asynchronously without blocking the main form.
- Telemetry toggle requires confirmation checkbox before enabling.
- Backup table supports sorting by date/size; actions menu includes “View manifest”.

## References

- `docs/ux/narratives/settings.md`
