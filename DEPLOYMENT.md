# EcoSnap — Deployment

## Overview
EcoSnap = Angular SPA (web) + Capacitor native apps (Android/iOS) + Express API server. Both frontend and server must be deployed.

## 1. Environment prerequisites
- Node.js + npm.
- `server/.env` with: `GEMINI_API_KEY`, `PORT`, `ALLOWED_ORIGINS`, `NODE_ENV`.
- Firebase project with Auth, Firestore, Storage enabled; deploy `firestore.rules` and `storage.rules`.

## 2. Build the client
```bash
npm install
npm run build          # → dist/ (browser, outputHashing in production)
```
- Dev server: `npm run start` (port 3000); full stack: `npm run dev:full`.

## 3. Web deployment
Host the `dist/` folder (static). Recommended: Firebase Hosting, Netlify, Vercel, or any static host.
- Set `environment.prod.ts` → `apiBaseUrl: '/api'` and proxy `/api` to the API server, or set the production API base URL directly.

## 4. API server deployment
- `cd server && npm install`
- `npm start` (ts-node) or compile + run with a process manager (PM2) / container (Docker).
- Set `ALLOWED_ORIGINS` to the deployed web origin(s) (comma-separated).
- Expose only port `PORT` (default 3001) publicly.

## 5. Native mobile (Capacitor)
```
npm install
npm run build
npx cap sync
# then open native projects
npx cap open android   # or: ios (requires macOS/Xcode)
```
- `capacitor.config.ts`: appId `com.ecosnap.app`, appName `EcoSnap`, webDir `dist`.
- Android: `android/app/google-services.json` must match the Firebase project.
- iOS: `ios/App/App/GoogleService-Info.plist` must match the Firebase project.
- Publish via Google Play Store / Apple App Store. Handle store requirements (privacy policy, account deletion) — views already exist.

## 6. Firestore / Storage rules
Deploy before/with the app so security is enforced:
```
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## 7. Health/monitoring
- Verify `POST /api/analyze` returns a valid analysis.
- Monitor rate-limit 429s and Gemini spend.
- Ensure CORS allowlist includes all real client origins.

## 8. Rollback
- Static assets: redeploy previous `dist/`.
- API: keep previous container/tag.
- Firebase data: use Firestore backups if sensitive/large.
