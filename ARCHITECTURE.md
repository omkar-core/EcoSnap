# EcoSnap — Architecture

## 1. System Overview

EcoSnap is a hybrid mobile + web application. A single **Angular (v21, zoneless, Signals)** codebase runs on the web and inside **Capacitor** for Android/iOS. It talks to a small **Express (Node/TypeScript)** backend that proxies AI requests to **Google Gemini**, and uses **Firebase** (Firestore, Storage, Analytics) for backend services.

```
┌──────────────────────────────┐
│  Angular SPA (Signals)       │
│  - Components / Services     │
│  - Firebase Web SDK (web)    │
│  - Capacitor plugins (native)│
└──────┬──────────────┬────────┘
       │ REST (/api)  │ Firebase SDKs
       ▼              ▼
┌──────────────┐  ┌──────────────────────┐
│ Express API  │  │ Firebase             │
│  (server/)   │  │  Firestore / Storage │
│  gemini proxy│  │  Analytics            │
└──────┬───────┘  └──────────────────────┘
       │ Google GenAI SDK
       ▼
  Gemini 2.5 Flash
```

## 2. Client (`/src`)

- **Entry:** `index.tsx` bootstraps `AppComponent` with `provideZonelessChangeDetection()`.
- **`src/app.component.ts`** — root orchestrator: view routing (signal-driven `ViewState`), scan flow, AI copilot/chat, theme toggling.
- **`src/components/`** — standalone view components:
  - `camera-view`, `scan-result`, `dashboard-view`, `map-view` (Community), `team-view`, `splash-view`, `landing-view`, `settings-view`, `eco-companion` (chat UI), plus legal/info views (`privacy-policy`, `terms-conditions`, `contact-support`, `about-us`, `faq`, `account-deletion`, `info`, `skeleton-loader`).
- **`src/services/`** — Angular services:
  - `platform.service` — native (Capacitor) vs web detection.
  - `firebase.manager` — initializes Firebase Web SDK (web only).
  - `firestore.service`, `sync.service`, `storage.service`, `analytics.service` — platform-branched data services (Firestore/Storage are unwired infrastructure for a future sync phase).
  - `gemini.service` — REST calls to the backend with timeout + personal-key fallback.
  - `game.service` — core game state (Signals), persistence (`localStorage`), zoning, trees, badges, leaderboard (mock), simulations.

## 3. Backend (`/server`)

- **`server/src/index.ts`** — Express app: helmet, CORS allowlist, compression, morgan, JSON body (10mb). Mounts `/api`, global error handler.
- **`server/src/routes/ai.routes.ts`** — `POST /analyze`, `POST /chat`, `POST /aria-report`.
- **`server/src/services/gemini.server.ts`** — Gemini 2.5 Flash calls: structured-image analysis (schema-constrained JSON), EcoScout chat, ARIA report.
- **`server/src/middleware/`** — `validator.ts` (express-validator), `rateLimiter.ts` (express-rate-limit).
- **`server/src/middleware/rateLimiter.ts`** also exports `globalLimiter`.

## 4. External Services

- **Google Gemini 2.5 Flash** — AI analysis & chat (via `@google/genai`).
- **Firebase** — Firestore, Storage, Analytics. Web uses web SDK; native uses `@capacitor-firebase/*` plugins. (Auth removed — app is anonymous/local-only.)
- **OpenStreetMap Nominatim** — reverse geocoding for addresses (client-side fetch).
- **Navigator Geolocation API / Capacitor** — GPS.

## 5. Key Design Decisions

- **Signals & zoneless** — modern Angular without zone.js for performance.
- **Dual-platform data layer** — every data service branches web vs native via `PlatformService`.
- **Client-persisted game state** — MVP keeps game progress in `localStorage`; Firebase is reserved for future sync (Auth removed).
- **Server-side AI proxy** — keeps Gemini API key off the client; supports optional per-user key fallback.
- **One `index.tsx` + importmap** — supports AI Studio-style builds.
