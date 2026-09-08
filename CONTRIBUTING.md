# Contributing to EcoSnap

Thanks for helping improve EcoSnap! By contributing you agree to the project's [MIT license](./LICENSE).

## Getting Started
1. Clone the repo.
2. `npm install` (root) and `npm install` inside `server/`.
3. Copy `server/.env.example` → `server/.env` and add your `GEMINI_API_KEY`.
4. Run the full stack: `npm run dev:full` (client `:3000`, API `:3001`), or run client/server separately.

## How to Contribute
1. **Open an issue** for bugs/features first (check existing issues).
2. **Fork & branch:** use a descriptive branch (`fix/`, `feat/`, `docs/`).
3. **Make changes** following the conventions in AGENTS/RULES docs (summary below).
4. **Run checks** (lint/build) before submitting.
5. **Open a PR** describing the change and linking the issue.

## Code Guidelines
- **Signals + zoneless Angular**: use signals for reactive state; don't reintroduce zone.js needs.
- **Dual-platform services**: branch web (`firebase/*` web SDK) vs native (`@capacitor-firebase/*`) via `PlatformService.isWeb()`.
- **Standalone components only**.
- Keep code consistent with existing style; avoid unnecessary comments.
- Update `firestore.rules` / `storage.rules` when data access changes.
- Keep `server/.env.example` in sync with any new env vars.
- Reuse existing docs; update relevant sections (ARCHITECTURE, API, DATABASE, etc.) when behavior changes.

## Reporting Bugs
Include: expected vs actual behavior, steps to reproduce, environment (web/android/ios, browser), and console errors if available.

## Security
Do not open public issues for security vulnerabilities — see [SECURITY.md](./SECURITY.md) for handling. Never commit secrets/API keys.

## Code of Conduct
Be respectful and constructive. Harassment or abusive behavior is not tolerated.
