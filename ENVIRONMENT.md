# EcoSnap — Environment / Configuration

## Server (`server/`)
Lives in `server/.env` (git-ignored). Template: `server/.env.example`.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | yes* | — | Google Gemini API key. *Required unless every client always sends a personal key. |
| `PORT` | no | `3001` | API server port. |
| `ALLOWED_ORIGINS` | no | `http://localhost:3000` | Comma-separated CORS allowlist. |
| `NODE_ENV` | no | `development` | `production` hides internal error messages. |

## Client (`src/environments/`)
- `environment.ts` (development): `apiBaseUrl: 'http://localhost:3001/api'`.
- `environment.prod.ts` (production): `apiBaseUrl: '/api'`.
- Both contain the **Firebase web config** (public by design — not a secret):
  - `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId`.
  - ⚠️ Currently points at a `any2pdf-c1eb3` Firebase project (appears to be a legacy/placeholder config). **Replace with the real EcoSnap Firebase project config before production.**

## Client runtime settings (localStorage)
- `eco_personal_api_key` — optional user-supplied Gemini key used as a fallback on rate-limit/outage (set in Settings UI).
- `swh_theme_bio` — bioluminescent theme flag.
- Game persistence keys (`swh_*`, see `game.service.ts`) — local-only progress.

## Capacitor
- `capacitor.config.ts`: `appId: com.ecosnap.app`, `appName: EcoSnap`, `webDir: dist`.

## Angular CLI
- `angular.json`: dev server port `3000`; production uses output hashing; build via `@angular/build` (vite).
- `tsconfig.json`: ESNext, bundler resolution, zoneless setup.

## Bootstrapping a fresh dev environment
1. `npm install` (root).
2. `cd server && npm install`.
3. `cp server/.env.example server/.env` and fill `GEMINI_API_KEY`.
4. Set correct Firebase config in `src/environments/*`.
5. `npm run dev:full` → client `:3000` + API `:3001`.
