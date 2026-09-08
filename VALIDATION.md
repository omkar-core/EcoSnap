# EcoSnap — Validation

## Backend (Express + express-validator)
All AI endpoints validate before hitting Gemini. Invalid input → `400 { errors: [...] }` and no AI call.

### `/api/analyze` (validateAnalyzeRequest)
- `imageBase64`: **required**, string, non-empty.
- `context`: optional object; `activity` string; `lat`/`lng` numeric; `timestamp` string.
- `personalKey`: optional string.

### `/api/chat` (validateChatRequest)
- `message`: **required**, string, non-empty, **max 2000 chars**.
- `personalKey`: optional string.

### `/api/aria-report` (validateAriaRequest)
- `stats`: **required**, object.
- `personalKey`: optional string.

## Firebase Rules (server-side, non-bypassable)
- `firestore.rules`: field checks on write:
  - `users` writes limited to `points` (number), `displayName`, `role`.
  - `users/{uid}/scans` create must include `wasteType` AND `points` (number).
  - `community_scans` create must include `wasteType`, `points`, and `userId == auth.uid`.
- `storage.rules`: uploads must be images (`contentType matches image/.*`) and `<= 5MB`, owner-only path.

## Client (`game.service.ts`)
- Username sanitized: trimmed, truncated to 15 chars, default "Operator".
- Scan anti-spam: min 2s between scans.
- Tree planting guards: credits, mode eligibility (self needs GPS, sponsored needs streak/XP), planting density.

## Rules of Thumb
- Always validate server-side; client checks are UX-only (easily bypassed).
- Keep `firestore.rules`/`storage.rules` in sync whenever schemas change.
- Reject early (validator) before expensive AI calls.
