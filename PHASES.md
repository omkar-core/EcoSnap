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

## Phase 6 — Auth, Privacy & Compliance ✅
- Firebase Auth (email/Google) wired via `AuthService` with reactive `user` signal + session `init()`.
- Settings view has working sign in / create account / Google / log out UI for both web and native (`@capacitor-firebase/authentication`).
- On sign-in, profile + scan history sync to Firestore (`users/{uid}`, `users/{uid}/scans/{scanId}`) and `user` id is set in analytics; profile pull restores username and points.
- Privacy policy, terms, account deletion, contact, about, FAQ views present and navigable.
- Accessibility: dialogs expose `role="dialog"`/`aria-modal`, icon-only buttons labeled, `Escape` closes scan-result / AI copilot / planting modal, `prefers-reduced-motion` support added.

## Phase 7 — Persistence & Sync 🔲 (Future)
- Game state mostly in `localStorage`; only profile/points/scans are pushed on sign-in (see Phase 6).
- Remaining: full Firestore game-state sync (trees, zones, badges), real (non-mock) leaderboards and community scans.

## Phase 8 — Deployment 🟡
- Build (`ng build`) → `dist/`; Capacitor sync for native; server hosting.
- See DEPLOYMENT.md.

## Phase 9 — Testing & Hardening 🔲
- No automated tests yet (see TESTING.md). Add unit + e2e coverage.
