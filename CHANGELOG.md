# Changelog

All notable changes to EcoSnap are documented here. Changelog is new as of the documentation pass; earlier history lives in `git log`.

## [Unreleased]
### Added
- Project documentation suite (PRD, Architecture, Rules, Phases, Design, Memory, Security, API, Database, AI Rules, Error Handling, Validation, Testing, Dependencies, Deployment, Environment, Performance, Accessibility, SEO, Contributing).
- `LICENSE` (MIT), `CHANGELOG.md`.
- **Automated tests:** Angular `test` target using `@angular/build:unit-test` with the Vitest runner on jsdom (`tsconfig.spec.json`), initial specs for `GameService` and `SkeletonLoaderComponent`, and a CI "Run unit tests" step.
- **Focus trap:** `FocusTrapDirective` (`src/directives/focus-trap.directive.ts`) traps and restores focus for the AI copilot, scan-result, and reforestation modals.
- **Cookie consent:** `CookieConsentComponent` banner with accept/decline persisted to `swh_cookie_consent` and a link to the Privacy Policy.
- **Global error handling:** `GlobalErrorHandler` (registered via `provide`/`useExisting`) logs unhandled errors and surfaces them as a toast.
- **Deep links:** hash-based view routing (`/#privacy`, `/#community`, …) synced with `ViewState`, and an expanded `sitemap.xml` covering all public views.
- **Dashboard history controls:** search, claim-type filter, sort (newest/oldest/top XP), and a "Load more" paging control in Recent Activity.

### Implemented (from docs; previously missing)
- **Auth & Account (Phase 6) — subsequently reverted:** `AuthService` briefly exposed a reactive `user` signal with a session `init()` and the Settings view had Sign In / Create Account / Continue with Google / Log Out UI (see *Removed* below).
- **Cloud sync — subsequently reverted:** `SyncService` briefly pushed profile + scan history to Firestore on sign-in. The service remains as unwired infrastructure for a future sync phase.
- **SEO:** `index.html` now includes `description`, `author`, `theme-color`, Open Graph, Twitter Card, canonical, and JSON-LD (`VideoGame`) structured data; descriptive `og:image`/canonical placeholder pointing at `https://ecosnap.app/`.
- **Accessibility:** `aria-label`s on icon-only buttons across views; `role="dialog"`/`aria-modal` on AI copilot, scan-result, and reforestation modals; `Escape` dismisses scan-result/AI (app level) and planting modal (map view); scan-result image `alt` bound to detected waste; global `prefers-reduced-motion` support; viewport now allows zoom (WCAG 1.4.4).
- **Badges:** `FIRST_SCAN` now unlocks on the first scan (no longer pre-granted); `TREE_LORD` unlocks with 10 trees alive ≥7 days; team-view badge count uses live totals instead of hardcoded `/12`.
- **Storage:** `StorageService` gained `uploadUri()` (native `FirebaseStorage.uploadFile({ path, fileUri, contentType })`) and native `File` upload via fetch→base64 conversion.
- **Toggle:** Settings now includes theme + ambient-sound toggles wired to `GameService` state.

### Changed
- `angular.json` production build disables font inlining (`optimization.fonts: false`) so builds succeed without network access.
- Fixed latent type error in `analytics.service.ts` (`setUserProperty` uses `key`, not `name`).

### Removed
- **Firebase Auth & account UI** (commit `81d225f`): `auth.service` and the Settings sign in / create account / Google / log out flow were removed. The app is anonymous/local-only; `SyncService`/`firestore.service`/`storage.service` remain as unwired infrastructure for a future sync phase. Docs (`PHASES`, `ARCHITECTURE`, `MEMORY`, `DEPENDENCIES`) reconciled accordingly.

### Fixed
- **Tailwind opacity utilities:** replaced invalid underscore syntax (e.g. `bg-emerald-900_95`, `border-emerald-500_50`, `bg-emerald-500_20`, `hover:bg-white_10`) with the correct slash syntax (`bg-emerald-900/95`, `border-emerald-500/50`, `bg-emerald-500/20`, `hover:bg-white/10`) across `app.component.html`, `camera-view`, `dashboard-view`, `map-view`, and `team-view`. These classes were silently dropped by Tailwind, so toasts, zone-status chips, tree-health tiles, species selection, and the current-user leaderboard row never received their intended backgrounds/borders.
- **Skeleton loader accessibility:** `SkeletonLoaderComponent` is now `aria-hidden="true"` / `role="presentation"` so screen readers skip placeholder blocks, and uses a dedicated shimmer animation instead of `animate-pulse` for smoother, consistent perceived loading.
- **Contrast:** raised secondary body/label text from `text-slate-500`/`text-slate-600` to `text-slate-400` across views to meet WCAG AA (~7:1) on the dark theme.
- **Sitemap coverage:** `sitemap.xml` expanded from 3 to 12 URLs (dashboard, community, team, about, settings, contact, faq, info, privacy, terms, account deletion).

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
