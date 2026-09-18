# Changelog

All notable changes to EcoSnap are documented here. Changelog is new as of the documentation pass; earlier history lives in `git log`.

## [Unreleased]
### Added
- Project documentation suite (PRD, Architecture, Rules, Phases, Design, Memory, Security, API, Database, AI Rules, Error Handling, Validation, Testing, Dependencies, Deployment, Environment, Performance, Accessibility, SEO, Contributing).
- `LICENSE` (MIT), `CHANGELOG.md`.

### Implemented (from docs; previously missing)
- **Auth & Account (Phase 6):** `AuthService` now exposes a reactive `user` signal with a session `init()`; Settings view gained working Sign In / Create Account / Continue with Google / Log Out UI (web + `@capacitor-firebase/authentication`).
- **Cloud sync:** new `SyncService` pushes profile + scan history to Firestore on sign-in (`users/{uid}`, `users/{uid}/scans/{scanId}`) and pulls the remote profile for cloud restore; analytics `setUserId`/`setUserProperties` wired.
- **SEO:** `index.html` now includes `description`, `author`, `theme-color`, Open Graph, Twitter Card, canonical, and JSON-LD (`VideoGame`) structured data; descriptive `og:image`/canonical placeholder pointing at `https://ecosnap.app/`.
- **Accessibility:** `aria-label`s on icon-only buttons across views; `role="dialog"`/`aria-modal` on AI copilot, scan-result, and reforestation modals; `Escape` dismisses scan-result/AI (app level) and planting modal (map view); scan-result image `alt` bound to detected waste; global `prefers-reduced-motion` support; viewport now allows zoom (WCAG 1.4.4).
- **Badges:** `FIRST_SCAN` now unlocks on the first scan (no longer pre-granted); `TREE_LORD` unlocks with 10 trees alive ≥7 days; team-view badge count uses live totals instead of hardcoded `/12`.
- **Storage:** `StorageService` gained `uploadUri()` (native `FirebaseStorage.uploadFile({ path, fileUri, contentType })`) and native `File` upload via fetch→base64 conversion.
- **Toggle:** Settings now includes theme + ambient-sound toggles wired to `GameService` state.

### Changed
- `angular.json` production build disables font inlining (`optimization.fonts: false`) so builds succeed without network access.
- Fixed latent type error in `analytics.service.ts` (`setUserProperty` uses `key`, not `name`).

## [0.0.0] — Initial import from upstream
Core application pulled from `github.com/omkar-core/EcoSnap` (branch `main`). Includes:
- Angular 21 zoneless SPA (Signals), standalone components.
- Gemini 2.5 Flash AI waste analysis via Express proxy (`/api`).
- Game loop: scans, scout/cleanup claims, XP, Green Credits, ranks, badges, zones, tree plantation & maintenance, mock leaderboard, live events/hotspots/eco-wave simulations.
- EcoScout chat + ARIA briefing endpoints.
- Firebase Auth/Firestore/Storage/Analytics (web + Capacitor native).
- Android & iOS Capacitor projects.

---

Format: files preserve style; entries follow [Keep a Changelog](https://keepachangelog.com). Versioning follows [SemVer](https://semver.org).
