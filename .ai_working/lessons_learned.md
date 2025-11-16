# Lessons Learned — 2025-11-13

- Standardize references to the temporary workspace as `.ai_working/` across new rules; audit legacy documents for lingering `.ai-working/` mentions before next session.
- Codifying Dynamoose integration patterns early prevents table-creation regressions and should be checked whenever touching persistence layers.
- Running Prettier manually before staging avoids Husky rejections and keeps commit loops fast.

# Lessons Learned — 2025-11-15

- **Native module rebuild pattern**: `better-sqlite3` (and likely other native modules) must be rebuilt when switching between Node.js (for Vitest) and Electron runtimes due to ABI incompatibility. The Electron runtime uses NODE_MODULE_VERSION 119, while Node.js uses 127. Always rebuild before running tests or dev:
  - Tests: `npm rebuild better-sqlite3 --build-from-source`
  - Electron dev: `npm rebuild better-sqlite3 --runtime=electron --target=$(npx -q electron --version)`
- Consider adding npm scripts to automate this switching or document it prominently in README/QUICKSTART.
