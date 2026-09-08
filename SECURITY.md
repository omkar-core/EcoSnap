# EcoSnap — Security

## 1. Principles
- **API keys never ship to the browser** where avoidable. The Gemini key lives on the server (`server/.env`). An optional per-user key may be provided by the client as a fallback.
- **Firebase access is locked by default**; explicit rules grant the minimum.
- **SMTP/network hardening** via helmet, CORS allowlist, rate limiting.
- `.gitignore` excludes `.env` and `server/.env`.

## 2. Backend (`server/`)
- **helmet()** — sets secure HTTP headers.
- **`app.disable('x-powered-by')`** — hides framework.
- **CORS allowlist** — only origins in `ALLOWED_ORIGINS` (comma-separated), methods `GET`/`POST`.
- **Rate limiting** (`express-rate-limit`, in `middleware/rateLimiter.ts`):
  - `globalLimiter`: 100 req / 15 min per IP.
  - `aiEndpointLimiter` (/analyze, /aria-report): 10 req / min.
  - `chatEndpointLimiter` (/chat): 20 req / min.
- **Body size limit:** `10mb` JSON & urlencoded (image scans).
- **Input validation:** `express-validator` on all AI endpoints (see VALIDATION.md).
- **Error handling:** production responses hide internal messages (`NODE_ENV=production` → generic "Internal Server Error").

## 3. Firebase Security Rules
### `firestore.rules`
- Default: deny all reads/writes.
- `/users/{userId}` and `/users/{userId}/scans/{scanId}` — owner only (uid match); writes restricted to allowed fields.
- `/community_scans/{scanId}` — authenticated read; creator-only write; field checks.

### `storage.rules`
- Default: deny all.
- `/uploads/{userId}/**` — authenticated owner only; images only; `<= 5MB`.
- `/public/**` — authenticated read; write blocked (SDK/admin only).

## 4. Client
- Firebase config is public (expected for Firebase) — keys here are not secrets; real auth/security enforced by rules.
- API key fallback stored in `localStorage` (`eco_personal_api_key`) — user-owned, sent only to your own server.
- Biometric/other secrets never stored.

## 5. Threats & Mitigations
| Threat | Mitigation |
|--------|-----------|
| Key exfiltration | Server proxy; key not in git; allowlist CORS |
| Rate abuse / cost spike | AI + global rate limiters |
| Unauthorized data access | Firestore/Storage deny-by-default rules |
| Malformed input | express-validator on all endpoints |
| DoS via large body | 10mb body limit |
| Info leakage in prod | Generic prod error messages |

## 6. Secrets Handling
- Never commit `.env`. Provide `server/.env.example`.
- Rotate any committed keys found in history.
- The Firebase web config is public by design; do not assume it is a secret.
