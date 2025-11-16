# Epic EP3 — Connector & Credential Management

## Epic Statement

Allow administrators and integrators to configure storage, LLM, and file connectors while managing credentials securely across UI and CLI surfaces.

## Goals

- Provide guided setup for default SQLite storage and optional remote connectors.
- Capture, validate, and rotate API keys using the credential vault.
- Expose connector capabilities (models, rate limits, status) to inform workflow design.
- Maintain audit trails for credential changes and connector selection.

## User Stories (Draft)

| ID        | Title                                              | Persona            | Priority | Status | Architecture Components                                                                    |
| --------- | -------------------------------------------------- | ------------------ | -------- | ------ | ------------------------------------------------------------------------------------------ |
| US-EP3-01 | View available connectors and current selections   | Administrator      | P0       | Draft  | Settings UI (connectors matrix), ConnectorRegistry, ConfigService                          |
| US-EP3-02 | Add ChatGPT API key via settings UI                | Administrator      | P0       | Draft  | Settings UI credential form, CredentialVault adapters, ConnectorRegistry health check      |
| US-EP3-03 | Add Claude API key via settings UI                 | Administrator      | P0       | Draft  | Settings UI credential form, CredentialVault, ConnectorRegistry                            |
| US-EP3-04 | Test connector credentials and view status badge   | Administrator      | P0       | Draft  | ConnectorRegistry health-check endpoints, Settings UI status badges, CLI test commands     |
| US-EP3-05 | Configure storage connector (local SQLite default) | Administrator      | P0       | Draft  | ConnectorRegistry (storage adapters), MigrationService, ConfigService, Settings UI         |
| US-EP3-06 | Set file access sandbox directories                | Administrator      | P0       | Draft  | Settings UI file sandbox view, FileSandboxGuard, FileConnector, ConfigService              |
| US-EP3-07 | Manage credentials via CLI commands                | Integrator         | P0       | Draft  | CLI credential commands, CredentialVault, ConnectorRegistry, AuditLogService               |
| US-EP3-08 | View connector capabilities (models, limits)       | Workflow Architect | P1       | Draft  | ConnectorRegistry capability metadata, Settings UI, Designer inspector hints               |
| US-EP3-09 | Rotate API key with audit log                      | Administrator      | P1       | Draft  | CredentialVault rotation API, AuditLogService, Settings UI, CLI rotation commands          |
| US-EP3-10 | Export/import connector configuration bundle       | Administrator      | P2       | Draft  | ConfigService (export/import), ConnectorRegistry, Credential metadata, CLI config commands |

## Dependencies

- Architecture: Credential vault implementation, connector registry, logging.
- UX: Settings wizard wireframes, credential input patterns, CLI stories.
- Security: Policies for storage, encryption, and audit logging.

## Notes & Open Questions

- Confirm fallback strategy when OS keychain unavailable.
- Determine minimum required metadata for connector export packages.
- Decide on notification mechanism for upcoming credential expirations.
