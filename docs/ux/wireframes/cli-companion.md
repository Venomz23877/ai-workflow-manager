# Wireframe — CLI Companion Output (ASCII Concept)

```
$ aiwm workflows list --status draft
┌─────────────────────────────────────────┐
│ Workflow: Policy Review v2              │
│ Status : Needs Fix                      │
│ Last Run: 3h ago                        │
│ Actions: open designer -> aiwm wf open  │
│          run workflow -> aiwm wf run id │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Workflow: Onboarding Lab                │
│ Status : Draft                          │
│ Last Run: never                         │
│ Actions: run | export | duplicate       │
└─────────────────────────────────────────┘
Tips: Use `aiwm workflows list --json` for structured output.

$ aiwm runs monitor 1827
12:00 [ENTRY] Loop: Summary Refinement
12:01 [LLM ] Draft v3 ready (tokens=1,234)
12:02 [VALIDATOR] confidence_threshold ✔
12:03 [ACTION] operator requested alternative summary
Type `action <node> <name>` to invoke manual action.
Press `q` to exit, `json` to toggle JSON output.
```

## Notes

- Default output uses box drawing; `--no-border` fallback for legacy terminals.
- Important hints appear at bottom after each command.

## References

- `docs/ux/narratives/cli-companion.md`
