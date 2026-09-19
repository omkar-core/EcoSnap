# EcoSnap — Phases

Current status reflects the codebase as pulled from `main` (2026).

## Phase 0 — Foundation & Scaffold ✅
- Angular 21 zoneless + Signals app, Tailwind, Capacitor (android/ios), Firebase web + native plugins.
- `index.tsx` entry + importmap; `angular.json` (vite builder).

## Phase 1 — AI Waste Analysis ✅
- Gemini 2.5 Flash image analysis with schema-constrained JSON.
- Express proxy server (`/api/analyze`) with validator, rate limiting, CORS, helmet.
- Client fallback to personal API key on rate-limit/outage.

## Phase 2 — Core Game Loop ✅
- Camera capture → analysis → scout/cleanup claims → XP, credits, scan history.
- Activity multiplier, cleanup bonus, upcycle bonus, anti-spam throttle.
- Dashboard, scan-result modal, history view.

## Phase 3 — Zoning & Sector Health ✅
- Lat/lng zone bucketing; health decay/restore; statuses; ownership; trend prediction.
- Community/map view with Nominatim reverse geocoding.

## Phase 4 — Reforestation ✅
- Self / community / sponsored planting; species rates; lifecycle stages; CO2 offsets; water/fertilize maintenance.

## Phase 5 — Gamification & Polish ✅
- Ranks, badges, mock leaderboard, live events, hotspots, eco wave, bioluminescent theme, ambient sound, EcoScout chat + ARIA briefings.

## Phase 6 — Privacy, Legal & Compliance ✅
- Privacy policy, terms, account deletion, contact, about, FAQ, and info views present and navigable.
- Accessibility: dialogs expose `role="dialog"`/`aria-modal`, icon-only buttons labeled, `Escape` closes scan-result / AI copilot / planting modal, `prefers-reduced-motion` support added, focus trap added for modals.
- Note: the earlier `AuthService` / Firebase Auth sign-in flow was **removed** (commit `81d225f`); the app is anonymous/local-only. Reintroduce accounts under a future phase if required.

## Phase 7 — Persistence & Sync 🔲 (Future)
- Game state is `localStorage`-first and the app is anonymous/local-only (Auth removed, see Phase 6).
- `SyncService` remains as unwired infrastructure (push/pull profile + scans, community scans) for a future sync phase.
- Remaining: full Firestore game-state sync (trees, zones, badges), real (non-mock) leaderboards and community scans.

## Phase 8 — Deployment 🟡
- Build (`ng build`) → `dist/`; Capacitor sync for native; server hosting.
- See DEPLOYMENT.md.

## Phase 9 — Testing & Hardening 🟡
- Unit tests configured via the Angular `@angular/build:unit-test` builder (Vitest + jsdom) — see TESTING.md.
- Remaining: e2e smoke coverage and Firebase rules emulator tests.
