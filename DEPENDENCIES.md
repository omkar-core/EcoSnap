# EcoSnap — Dependencies

## Root (`package.json`) — Angular client
Runtimes:
- `@angular/*` **^21.0.0** (core, common, compiler, platform-browser)
- `@angular/build` ^21.0.0, `@angular/cli` ^21.0.0
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios` **^8.1.0**
- `@capacitor-firebase/analytics`, `authentication`, `firestore`, `storage` **^8.1.0**
- `@google/genai` ^1.35.0 (client-side import used; heavy lifting on server)
- `firebase` ^12.10.0
- `rxjs` ^7.8.2

Dev:
- `tailwindcss` ^3.4.19, `@tailwindcss/postcss` ^4.3.0, `postcss` ^8.5.15, `autoprefixer` ^10.5.0
- `typescript` ~5.9.0, `vite` ^6.2.0, `concurrently` ^9.2.1, `@types/node` ^22.14.0

## Server (`server/package.json`) — Express backend
Runtimes:
- `express` ^5.2.1, `cors` ^2.8.6, `helmet` ^8.2.0, `morgan` ^1.10.1, `compression` ^1.8.1
- `express-rate-limit` ^8.5.2, `express-validator` ^7.3.2
- `dotenv` ^17.4.2
- `@google/genai` ^2.6.0

Dev:
- `typescript` ^6.0.3, `ts-node` ^10.9.2, `nodemon` ^3.1.14
- `@types/express`, `@types/cors`, `@types/compression`, `@types/morgan`, `@types/node` ^25.9.1

## Install notes
- `.npmrc` sets `legacy-peer-deps=true` (avoids peer-resolution failures with Angular 21 / Capacitor 8).
- Two separate installs: root (`npm install`) and `server/` (`cd server && npm install`).
- `npm run dev:full` (root) runs client + server via `concurrently`.

## Updating
- Use `npm outdated` per workspace. Major bumps (Angular/Capacitor majors) need careful migration; test web + native.
- Keep `@capacitor-firebase/*` and `@capacitor/core` versions compatible (all 8.x here).
