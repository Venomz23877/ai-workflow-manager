# Story: Validate JSON/YAML documents with schema

- **Epic**: EP4 — Document Management
- **Persona**: Integrator
- **Priority**: P0
- **Status**: Draft

## Context

Structured documents (JSON, YAML) define workflow data, prompts, or configuration. Editors must enforce schemas, highlight errors, and block exports until fixed.

## User Story

As an integrator, I want JSON/YAML documents validated against schemas so that workflows don’t fail at runtime due to malformed data.

## Acceptance Criteria

```
Given I open a JSON or YAML document
When the schema is available
Then the editor validates on keystroke, highlighting errors inline and listing them in a panel with line references

Given validation errors exist
When I try to save or export
Then the action is blocked (unless I override) and a confirmation modal explains the risk

Given multiple schemas apply (per environment)
When I choose one from a dropdown
Then validation reruns immediately

Given CLI usage
When I run `aiwm docs validate data.yaml --schema prompt-config`
Then the command exits non-zero on failure and prints structured error output

Given no schema is defined
When I edit
Then the editor falls back to syntax linting and shows a banner inviting me to link a schema
```

## Architecture Components

- `SchemaValidationService` (JSON Schema/YAML support)
- DocumentWorkspace structured editor (Monaco/CodeMirror)
- ConfigService (stores schema associations per document)
- CLI document commands (`validate`)
- Notification/Validation pipeline (for blocking exports)

## UX References

- `docs/ux/narratives/document-workspace.md`
- `docs/ux/wireframes/document-workspace.md`

## Technical Notes

- Support JSON Schema draft 2020-12; YAML converted to JSON for validation.
- Schemas stored locally or pulled from repo; references stored in document metadata.
- Provide option to override validation with audit log entry.
