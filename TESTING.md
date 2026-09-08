# EcoSnap — Testing

## Current Status
**No automated tests are configured.** The server `test` script is a stub (`echo "Error: no test specified" && exit 1`). The Angular `ng test` command exists as a default script but no spec files are present in the repo.

## What to Add (recommended)
Order by value vs. effort (YAGNI — add only what pays for itself):

1. **Server unit tests (highest value)** — the Gemini prompt/schema parsing and validators are pure-ish and deterministic to test.
   - Framework: `vitest` or `jest` + `supertest` (add as devDependencies in `server/`).
   - Cases: `validator` accepts/rejects each endpoint; `gemini.server` parses clean JSON and strips fences; error mapping for `API_KEY_MISSING`.
2. **Client service tests** — `game.service` scoring/rank/tree logic (pure functions around signals) with `jest` + `jasmine` as Angular defaults.
3. **E2E (optional)** — basic smoke test that the app boots (Playwright).

## Suggested Commands (once set up)
- Backend: `cd server && npm test`
- Client: `npm test` (Angular)

## Manual Test Checklist (current)
- Camera capture → analysis renders → scout & cleanup claims adjust XP/credits/history.
- Zone health decay/restore, tree lifecycle (water/fertilize cooldowns), badge unlocks.
- Rate limit returns 429; AI outage returns friendly fallback.
- Firebase rules reject unauthorized reads/writes (test with Firestore emulator).
- Web + Android + iOS builds and boots.
