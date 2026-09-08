# EcoSnap — Database

## Storage Backend
**Firebase Firestore** (via `@capacitor-firebase/firestore` on native, `firebase/firestore` web SDK). Rules in `firestore.rules`. Media in **Firebase Storage** (`storage.rules`).

> Note: As of this snapshot, the client game state is persisted in `localStorage` (`game.service.ts` KEYS). Firestore is wired for Auth + future sync and is enforced by the rules below. Community scans (`community_scans`) exist in the rules as the intended sync path.

## Collections / Documents

### `users/{userId}`
Owned by the authenticated user (uid match).

Fields allowed by rules: `points` (number), `displayName` (string), `role` (string).

### `users/{userId}/scans/{scanId}`
Owned by the user. On create must include `wasteType` and `points` (number). Mirrors the client `ScanRecord` model.

Sample scanned `ScanRecord` fields (from `game.service.ts`):
```
id, timestamp, imageThumbnail, upcycleBonusClaimed, activityMode,
claimType, basePoints, fitnessBonus, cleanupBonus, location {lat,lng},
wasteType, confidence, isRecyclable, materialComposition[], condition,
riskLevel, biologicalCategory, reasoning, funFact, recyclingGuidance{...},
upcyclingRecipe?, dnaFingerprint?, points, estimatedWeight, urbanArtifactStory
```

### `community_scans/{scanId}`
Authenticated read; creator (matching `userId`) can create/update/delete. Must include `wasteType` and `points` (number) on create.

## Data Models (client — `game.service.ts`)

- `Zone` — sector health: `health`, `status`, `greenLayer{treeCount, plantableSpots, co2Offset, forestCoverage}`, `wasteLayer{decayRate, lastCleaned?, lastDecay?, contributionCount, isBossActive}`, `gamification{ownerName?, teamTerritory?, zoneLevel}`.
- `Tree` — `species`, `mode`, `stage`, `health`, `lastWatered`, `lastFertilized?`, `maintenanceLog[]`, `co2Offset`, `metrics`.
- `ScanRecord`, `Badge`, `LiveEvent`, `Hotspot`, `EcoWave`, `LeaderboardEntry`.

## Firestore Rules Summary
See `firestore.rules` for the authoritative source. Key points:
- Deny-all default.
- Per-user ownership enforced on `users/*`.
- Field-level write constraints on `users` (points/displayName/role).
- `community_scans`: any authenticated user reads; only creator writes.

## Storage Rules Summary
See `storage.rules`:
- Deny-all default.
- `uploads/{userId}/**`: authenticated owner; images only; ≤ 5MB.
- `public/**`: authenticated read; writes blocked.

## Indexing
No custom composite indexes are required for current queries (MVP uses simple document reads + local computation). Add Firestore composite indexes if new `query`/`where` combos are introduced.
