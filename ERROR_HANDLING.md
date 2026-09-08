# EcoSnap — Error Handling

## Backend (`server/`)
- **Global error handler** in `server/src/index.ts`: logs stack, responds with `err.status || 500`. In production hides internal message (`{ error: "Internal Server Error" }`).
- **AI-specific:** routes catch `API_KEY_MISSING` → `503 { error: "AI service unavailable" }`; otherwise delegate to global handler.
- **Gemini service (`gemini.server.ts`):**
  - `Request Timeout` → rejects after 30s for analysis.
  - Non-JSON / malformed AI output → `"Failed to parse AI response"` / `"No response text from Gemini"`.
- **Rate limiting:** `429` responses with human-readable messages.
- **Validation:** `400` with `express-validator` error array.

## Client (`src/`)
- **`GeminiService` (`gemini.service.ts`):**
  - Wraps `/analyze` and `/chat` in try/catch with timeout (AbortController).
  - Classifies errors (`429`/quota/exhausted, `500`/`503`/timeout) via `handleApiError`; retries once with a personal key fallback.
  - `analyzeImage` rethrows on failure; `chat` and `generateAriaReport` return friendly offline fallback strings.
- **`AppComponent` (`app.component.ts`):**
  - `handleImageCapture` catches analysis errors → `showToast('Failed to analyze image. Please try again.', 'error')` and clears captured image.
  - `sendToAi` catch → `addAiMessage("Connection interrupted. Please retry.")`.
- **`GameService` (`game.service.ts`):**
  - `showToast(text, type)` surfaces success/error/info to the user (auto-dismiss 4s).
  - `safeSave` / `load` swallow storage exceptions (localStorage may be unavailable/blocked).
  - Geolocation errors handled per code (denied → fallback, unavailable/timeout → message + fallback sector).
  - Blocker validation failures produce error toasts (e.g., insufficient credits, GPS required, cooldown, density limit, sponsor locked).

## Conventions
- User-facing errors should be concise and match the game's tone.
- Always `finally` reset processing flags / loading states.
- Never leak stack traces or internal messages to clients in production.
