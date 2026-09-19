# EcoSnap — Memory / Working Notes

This file captures the operating context for AI agents and contributors working on EcoSnap.

## Project Snapshot
- **What:** AI-powered urban ecology game (scan waste → earn XP → plant trees → heal sectors).
- **Stack:** Angular 21 (zoneless, Signals) + Tailwind + Capacitor (android/ios) + Firebase + Express/TS server + Google Gemini 2.5 Flash.
- **Repo:** https://github.com/omkar-core/EcoSnap
- **License:** MIT.

## Key Files
| Path | Purpose |
|------|---------|
| `index.tsx` | App bootstrap (zoneless) |
| `src/app.component.ts` | Root orchestrator, view routing, scan flow, chat |
| `src/services/game.service.ts` | Core game state, rules, persistence (localStorage) |
| `src/services/gemini.service.ts` | Client AI calls w/ fallback + timeouts |
| `src/services/firebase.manager.ts` | Web SDK init (web only) |
| `server/src/index.ts` | Express app (helmet, CORS, /api) |
| `server/src/services/gemini.server.ts` | Gemini schema-constrained analysis |
| `firestore.rules`, `storage.rules` | Firebase security rules |
| `src/environments/*` | Firebase config + API base URL |

## Conventions
- **Signals** used for all reactive state; **zoneless** change detection — do not introduce zone.js/`NgZone` needs.
- **Dual-platform** data services: branch on `PlatformService.isWeb()` between web SDK and `@capacitor-firebase/*`.
- **Standalone components** only.
- **No comments in code** unless necessary; mimic existing style.
- Root `package.json` = Angular client; `server/package.json` = Express backend. `npm run dev:full` runs both (`concurrently`).
- `.npmrc` sets `legacy-peer-deps=true`.

## Current Gaps / Known Notes
- Client unit tests are configured (Vitest + jsdom via `@angular/build:unit-test`; run `npm test -- --watch=false`). Server `test` script is still a stub.
- Game state is `localStorage`-first and the app is anonymous/local-only. Firebase Auth was **removed** (commit `81d225f`); `SyncService` remains as unwired infrastructure for a future sync phase. Trees/zones/badges do not sync; leaderboard is mock.
- `storage.service` supports native URI uploads via `uploadUri()` (`FirebaseStorage.uploadFile({ path, fileUri, contentType })`) and native `File` objects via fetch→base64 on `uploadFile()`. No interim temp-file write is required.
- `server/.env` is git-ignored; use `server/.env.example`.
- Firebase project config in `environment.ts`/`environment.prod.ts` references a `any2pdf-c1eb3` project (legacy config; replace for production).
- SEO meta (description, Open Graph, Twitter, theme-color, canonical, JSON-LD) added in `index.html`; `og:image`/`canonical` point at `https://ecosnap.app/` (update once the domain is finalized).

## Environment (dev machine)
- Windows, PowerShell. Working dir: `D:\Webapp\Working_webapps\Ecosnap`.
- Requires Node + npm; Android build needs JDK/Gradle; iOS needs macOS/Xcode.

## Checklist Before Committing
- [ ] No secrets in committed files (`.env`, API keys).
- [ ] `server/.env.example` kept in sync with required vars.
- [ ] `firestore.rules` / `storage.rules` maintained for any new data paths.
