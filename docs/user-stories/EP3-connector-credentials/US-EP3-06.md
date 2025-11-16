# Story: Set file access sandbox directories

- **Epic**: EP3 — Connector & Credential Management
- **Persona**: Administrator
- **Priority**: P0
- **Status**: Draft

## Context

File actions must be restricted to approved directories. Admins should manage an allowlist (with read/write permissions) via UI or CLI, ensuring workflows cannot access arbitrary paths.

## User Story

As an administrator, I want to set file access sandbox directories so that workflows only read and write within approved locations.

## Acceptance Criteria

```
Given I open Settings ▸ File Sandbox
When the tree view loads
Then I can add directories via picker, toggle read/write permissions per directory, and see an effective allowlist preview

Given I attempt to remove all directories
When I try to save
Then the UI blocks the change and explains that at least one directory must remain for workflow operations

Given directories require validation (existence, permissions)
When I add one
Then the system verifies it and surfaces warnings if inaccessible

Given I use CLI
When I run `aiwm filesandbox add "C:\\Projects\\Playbooks" --write`
Then the directory is added and the UI reflects the change

Given workflows reference paths outside the allowlist
When validation runs
Then those workflows receive warnings until paths are updated
```

## UX References

- `docs/ux/narratives/settings.md`
- `docs/ux/wireframes/settings.md`
- `docs/ux/narratives/document-workspace.md`

## Technical Notes

- Store allowlist entries in config DB; each entry includes path, read/write flags, last verified timestamp.
- Provide watchers to detect directory removal and notify admins.
- CLI should support `list`, `add`, `remove`, `set-permissions`.
- Open questions: Do we allow environment variables or relative paths?
