# EcoSnap — Testing

## Current Status
Client unit tests are configured with the Angular `@angular/build:unit-test` builder using the **Vitest** runner on **jsdom**.

- Config: `angular.json` → `test` target; `tsconfig.spec.json`.
- Specs: `src/components/skeleton-loader.component.spec.ts`, `src/services/game.service.spec.ts`.
- Command: `npm test` (add `-- --watch=false` for a single CI run).

The server `test` script is still a stub (`echo "Error: no test specified" && exit 1`) and no server specs exist yet.

## What to Add (recommended)
Order by value vs. effort (YAGNI — add only what pays for itself):

1. **Server unit tests (highest value)** — the Gemini prompt/schema parsing and validators are pure-ish and deterministic to test.
   - Framework: `vitest` or `jest` + `supertest` (add as devDependencies in `server/`).
   - Cases: `validator` accepts/rejects each endpoint; `gemini.server` parses clean JSON and strips fences; error mapping for `API_KEY_MISSING`.
2. **More client service tests** — extend `game.service` coverage (zone health, tree lifecycle, badge unlocks) and add component tests for the deferred views.
3. **E2E (optional)** — basic smoke test that the app boots (Playwright).

## Suggested Commands (once set up)
- Backend: `cd server && npm test`
- Client: `npm test -- --watch=false` (Angular + Vitest)

## Manual Test Checklist (current)
- Camera capture → analysis renders → scout & cleanup claims adjust XP/credits/history.
- Zone health decay/restore, tree lifecycle (water/fertilize cooldowns), badge unlocks.
- Rate limit returns 429; AI outage returns friendly fallback.
- Firebase rules reject unauthorized reads/writes (test with Firestore emulator).
- Web + Android + iOS builds and boots.
