# UX Narrative — Settings & Connector Management

## Overview

Settings is structured as a wizard-style experience with modular panels for connectors, credentials, file sandboxing, and advanced preferences. It emphasizes clarity and safety—every change validates immediately, surfaces audit notes, and mirrors CLI commands for parity.

## Layout Narrative

- **Left nav rail** listing sections: General, Connectors, Credentials, File Sandbox, Document Paths, Advanced.
- **Header**: section title, description, and last saved timestamp. Inline status badges show environment (Local, Staging, Production).
- **Content area**:
  - **Connectors section**: matrix cards for Storage, LLM, File, Document builders. Each card displays current selection, status badge (Connected/Needs Key), quick actions (Test, Configure).
  - **Credential forms**: masked inputs, “Test Connection” button, success/failure feedback.
  - **File sandbox**: tree picker for allowed directories, toggles for read/write, preview of resolved paths.
- **Right summary rail**: unsaved changes list, audit log snippet, CLI equivalent commands.

### ASCII Sketch (simplified)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Settings ▸ Connectors                         Last saved: 2m ago           │
├───────┬───────────────────────────────────────────────────────┬───────────┤
│ Nav   │ Storage Connector                                    │ Summary   │
│ ▸ General│ ┌─────────────┐  ┌─────────────┐                  │ ┌───────┐ │
│ ▸ Connect│ │ Local SQLite│  │ REST (coming)│                 │ │Audit  │ │
│ ▸ Creds  │ │ Connected    │  │ Disabled     │                 │ │• ...  │ │
│ ▸ File   │ │ [Configure]  │  │ [Learn more] │                 │ └───────┘ │
│ ▸ Docs   │ └─────────────┘  └─────────────┘                  │ CLI: ... │
│ ▸ Adv.   │ LLM Connectors                                    │ Unsaved… │
│          │ ┌─────────────┐  ┌─────────────┐                  │           │
│          │ │ ChatGPT     │  │ Claude       │                  │           │
│          │ │ Needs key   │  │ Connected    │                  │           │
│          │ │ [Add key]   │  │ [Configure]  │                  │           │
├───────┴───────────────────────────────────────────────────────┴───────────┤
│ Help: connectors guide | CLI tip: `aiwm connectors list`                  │
└────────────────────────────────────────────────────────────────────────────┘
```

## Interaction Narrative

- **Connector cards**:
  - Clicking `Configure` opens side panel with connector-specific settings (e.g., SQLite path, REST base URL). Changes validate on blur; errors show inline.
  - Status badges update live; tooltips explain failure causes (network, missing credential).
- **Credential forms**:
  - Masked inputs with “Show” toggle. Testing a key triggers spinner and success/failure toast. On success, credential vault logs rotation event.
  - CLI snippet updates to `aiwm connectors credentials set chatgpt <key>`.
- **File sandbox**:
  - Tree view allows selecting directories; each entry has toggle for read/write permissions. Preview panel lists resulting allowlist.
  - Attempting to deselect all directories prompts warning (workflows need at least one path).
- **Unsaved changes**:
  - Summary rail lists pending edits; hitting `Save All` runs validation and persists settings atomically.
  - Navigating away with unsaved changes prompts modal.
- **Audit log**:
  - Shows last few events (“ChatGPT key rotated by Sasha”). Link jumps to full history.

## Interaction Contracts

| Scenario                 | Input                                | System Reaction                                 | Outbound Events                        |
| ------------------------ | ------------------------------------ | ----------------------------------------------- | -------------------------------------- |
| Add LLM key              | Paste key, click `Test & Save`       | Validation call to connector; badge turns green | `credential.saved`, `connector.tested` |
| Switch storage connector | Select different card                | Confirmation dialog warns about migrations      | `connector.selection.changed`          |
| Update file sandbox      | Toggle directory access              | Summary updates, Save enabled                   | `filesandbox.updated`                  |
| Save settings            | Click `Save All`                     | All sections validated; success toast           | `settings.saved`                       |
| Revert change            | Click “Discard” next to pending edit | Field resets to last saved value                | `settings.change.discarded`            |

## Logging & Telemetry Panels

- **Navigation**: new sections “Logging” and “Telemetry” appear under Advanced.
- **Logging Panel**:
  - Level selectors per module (Main, Renderer, Connectors, CLI) presented as segmented controls.
  - Destination cards show File, Console, External Webhook (future). Choosing File reveals path picker and rotation settings; selecting External asks for URL, auth token, and test button.
  - Preview area streams recent log entries honoring the selected level so admins see the effect immediately.
  - Summary rail lists unsaved logging changes distinctly to avoid mixing with connector edits.
- **Telemetry Panel**:
  - Toggle with description of data collected; requires explicit confirmation (checkbox “I understand the privacy statement”) before enabling.
  - “Preview payload” button opens modal showing anonymized JSON sample.
  - Badge indicates last upload status; “Send diagnostics once” button triggers one-off upload without enabling telemetry.
  - Links to privacy docs and `.cursor/rules/privacy` guardrails.

### Logging/Telemetry Interaction Notes

- Changing levels updates running loggers instantly; toast confirms.
- Testing destinations runs connection check and surfaces latency, certificate info.
- Telemetry toggle emits alerts if disabled in environments where ops expects metrics (with override).
- CLI parity hints show equivalent commands (`aiwm ops logging set ...`, `aiwm ops telemetry enable`).

## Backup Panel

- **Layout**:
  - “Create Backup” primary button, “Restore Backup” secondary.
  - Table listing existing backups (timestamp, location, size, retention status) with actions (Download, Restore, Delete).
  - Configuration form for automatic backups (toggle, schedule dropdown, retention count).
- **Workflow**:
  - Clicking “Create Backup” opens modal summarizing included components (workflows, documents, configs). Progress bar tracks bundling, with background option for long operations.
  - Restore flow shows diff preview (what will change), checkbox requiring acknowledgment before proceeding.
  - Notifications integrate with summary rail so users see “Last backup failed” warnings.
- **CLI Hints**: `aiwm ops backup create --out ...`, `aiwm ops backup restore ...`.

## Interaction Contracts — Logging/Telemetry/Backup

| Scenario              | Input                    | System Reaction                                                | Outbound Events              |
| --------------------- | ------------------------ | -------------------------------------------------------------- | ---------------------------- |
| Change logging level  | Adjust segmented control | Logger updates immediately; preview reflects new level         | `logging.level.changed`      |
| Test log destination  | Click `Test`             | Connection test runs; success/failure banner shown             | `logging.destination.tested` |
| Enable telemetry      | Toggle on + confirm      | Telemetry settings saved, preview available                    | `telemetry.enabled`          |
| Send diagnostics once | Click button             | Batches local metrics, uploads once, leaves telemetry disabled | `telemetry.diagnostics.sent` |
| Create backup         | Click `Create Backup`    | BackupService packages data with progress bar                  | `backup.created`             |
| Restore backup        | Select archive, confirm  | Restore validation runs; success/failure reported              | `backup.restored`            |

## Accessibility & Inclusivity

- Left nav supports keyboard navigation and ARIA roles.
- Form fields include descriptive labels, helper text, and error messaging linked via `aria-describedby`.
- Status badges combine color, icon, and text for colorblind accessibility.
- Provide localized copy for hints/warnings and ensure screen readers announce dynamic updates (e.g., “ChatGPT connector connected”).

## Error & Edge Cases

- **Keychain unavailable**: credentials panel detects failure, offers fallback encrypted file workflow with caution notice.
- **Connector misconfiguration**: when testing fails, show actionable guidance (HTTP status, suggestion). Prevent saving until resolved or user explicitly overrides with acknowledgment.
- **Multi-profile support**: future environment dropdown (Dev/Prod) warns when editing non-default profile.

## Future Enhancements

- Role-based access control to hide credential panels from non-admins.
- Scheduled credential rotation reminders.
- Connector capability viewer (supported models, rate limits).

## References

- `docs/ux-flows.md#B.-Configuring-Connectors-&-Credentials`
- `docs/user-requirements.md` — Credential & configuration management
- `.cursor/rules/` for guardrails referenced in help links
- `docs/user-stories/EP5-automation-cli/` and `EP7-platform-operations/` for logging/telemetry/backup AC
