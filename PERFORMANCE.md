# EcoSnap — Performance

## Client
- **Zoneless Angular** with **Signals** — minimal change-detection overhead vs Zone.js.
- **Image compression** before persistence: thumbnails resized to ≤400px width, JPEG @ 0.6 quality (`game.service.compressImage`). Prevents localStorage / memory bloat and speeds rendering.
- **Typewriter chat rendering** optimized to append 2–3 words per tick to reduce main-thread blocking.
- **Analytics init safety** — wrapped so ad-blockers can't break startup.
- **View switching** is signal-driven; hidden views excluded from navbar computation (cheap derived signals).

## Network
- **REST timeouts** to avoid hanging UI: `/analyze` 35s, `/chat` & `/aria-report` 15s (AbortController).
- **Nominatim reverse geocoding** guarded with 5s abort; results cached to avoid repeated lookups.
- **Server compression()** (gzip) enabled on API responses.
- Retroactive zones/trees updates batched per recompute rather than on every scan.

## Backend
- AI analysis raced against a 30s timeout to cap worst-case latency.
- Rate limiting protects against runaway cost/load.
- `JSON body limit: 10mb` — images are base64; keep scan payloads reasonable.

## Observability / budget
- Current measured concern: Gemini inference latency/cost is the dominant factor; keep model calls scoped (single item analysis, constrained schema).
- Images are not uploaded to Storage for every scan in this MVP (thumbnails kept locally). Revisit when adding server sync.

## Suggested improvements (future)
- Add PWA caching / service worker for offline shell.
- Debounce expensive recomputes (`recalculateAllZones`) if zone lists grow.
- Compress images on a web-worker for large devices.
