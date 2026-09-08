# Changelog

All notable changes to EcoSnap are documented here. Changelog is new as of the documentation pass; earlier history lives in `git log`.

## [Unreleased]
### Added
- Project documentation suite (PRD, Architecture, Rules, Phases, Design, Memory, Security, API, Database, AI Rules, Error Handling, Validation, Testing, Dependencies, Deployment, Environment, Performance, Accessibility, SEO, Contributing).
- `LICENSE` (MIT), `CHANGELOG.md`.

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
