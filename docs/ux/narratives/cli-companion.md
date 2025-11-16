# UX Narrative — CLI Companion

## Overview

The CLI mirrors the desktop experience for operators and integrators who prefer scripts or remote execution. It provides discoverable commands, rich output (ASCII cards plus optional JSON), and clear handoffs back to the UI. The CLI should feel welcoming to non-developers while remaining powerful for automation pipelines.

## Experience Principles

- **Parity**: Every critical action available in the UI (list workflows, run, inspect logs, edit documents, manage connectors) has an equivalent CLI command.
- **Narration**: Default output uses human-readable tables/cards; `--json` flag switches to structured output for scripting.
- **Guidance**: Smart suggestions appear after commands (“Run `aiwm workflows view <id>` to inspect details”).
- **Safety**: Destructive commands (delete workflow, purge run history) require confirmation or `--yes`.

## Command Surface Highlights

| Command                                  | Purpose                              | Notes                                                     |
| ---------------------------------------- | ------------------------------------ | --------------------------------------------------------- |
| `aiwm workflows list`                    | List workflows with status, last run | Supports filters `--status draft`, `--tag marketing`      |
| `aiwm workflows run <slug>`              | Start a workflow run                 | Flags for run context (`--llm chatgpt`, `--doc draft.md`) |
| `aiwm runs monitor <runId>`              | Stream execution events/logs         | ASCII timeline, `--json` for machine output               |
| `aiwm docs edit <docId>`                 | Launch document editor in terminal   | Integration with `$EDITOR`, diff preview                  |
| `aiwm connectors credentials set <name>` | Store API keys securely              | Prompts hidden input; success confirmation                |
| `aiwm settings export/import`            | Backup or restore configuration      | Requires confirmation and audit log entry                 |

## Output Patterns

- **Cards**: Workflow list renders as box-drawn cards with status colorization (green = Published, yellow = Needs Fix).
- **Timelines**: Run monitoring shows timestamped entries with icons for actions, triggers, validators.
- **Tables**: Connector commands display capability matrices (models, rate limits).
- **JSON**: All commands support `--json` to dump machine-friendly data; includes correlation IDs.

## Interaction Narrative

- Running `aiwm workflows list` prints up to 10 workflows with pagination prompts; pressing `n` fetches next page.
- `aiwm workflows run` prompts for missing context (e.g., “Select credential (1) ChatGPT Prod, (2) Claude Sandbox”).
- Monitoring command supports inline actions: typing `action <node> <name>` injects manual action without leaving the stream.
- Errors show remediation steps (“Credential missing; run `aiwm connectors credentials set chatgpt`”).
- CLI detects if renderer is running and offers to open the corresponding screen (`--open-ui` flag copies deep link).

## Accessibility & Inclusivity

- Uses plain ASCII (no ANSI color by default); `--color` opt-in for color-capable terminals.
- Offers verbose mode with descriptive text for screen readers; logs can be routed to files.
- Command names favor readability over brevity; aliases provided for power users (e.g., `aiwm wf run`).

## Future Enhancements

- Command generator to scaffold new connectors or nodes.
- Interactive “wizard” mode for onboarding (guided prompts).
- Remote agent mode (SSH-friendly) with event subscriptions.

## References

- `docs/ux-flows.md#E.-CLI-Driven-Execution`
- `docs/user-requirements.md` — CLI objectives
