# EcoSnap — Product Requirements Document

## 1. Overview

**EcoSnap** is an AI-powered urban ecology game that gamifies waste management and neighborhood restoration. Players ("Rangers") photograph waste with their phone camera, receive an AI-driven waste analysis, earn XP and Green Credits, and plant trees to restore their local geographic sectors.

- **Tagline:** Smart Waste Hunt
- **Platforms:** Web (Angular SPA), Android & iOS (via Capacitor)

## 2. Problem

Urban waste is mismanaged; residents lack an engaging, educational, and rewarding way to participate in local cleanup and reforestation.

## 3. Goals / Non-Goals

**Goals**
- Make waste recognition instant and educational via AI (Gemini 2.5 Flash).
- Gamify cleanup with XP, ranks, leaderboards, badges, and Green Credits.
- Drive real reforestation through self-planting, NGO donations, and corporate sponsorship.
- Track neighborhood sector health over time (decay/restore mechanic).

**Non-Goals (MVP)**
- Real cross-user multiplayer/AI-driven leaderboards (mock competitors currently).
- Live server-persisted game state (progress is stored in `localStorage`).
- In-app payments or real financial transactions.

## 4. Target Users / Personas

- **Ranger** — casual citizen doing cleanup on a walk, run, or cycle.
- **Eco-enthusiast** — wants educational recycling/upcycling knowledge.
- **Community organizer** — interested in sector health and reforestation impact.

## 5. Core User Stories

| ID | Story |
|----|-------|
| US-1 | As a Ranger, I can photograph waste and get a full AI analysis (type, material, recyclability, risk, points). |
| US-2 | As a Ranger, I can claim points by reporting ("scout") or physically cleaning up ("cleanup"). |
| US-3 | As a Ranger, I can view my XP, Green Credits, rank, badges, and scan history on a dashboard. |
| US-4 | As a Ranger, I can see my local sector's health and how my actions restore it. |
| US-5 | As a Ranger, I can plant trees (self / community / sponsored) using Green Credits. |
| US-6 | As a Ranger, I can chat with the in-app AI companion (EcoScout / ARIA) for ecology questions. |
| US-7 | As a Ranger, I can enable a bioluminescent theme and ambient sound. |

## 6. Functional Requirements

### 6.1 AI Waste Analysis (FR-AI)
- Capture image → POST `/api/analyze` → returns `WasteAnalysis` JSON.
- Output includes: `wasteType`, `confidence`, `isRecyclable`, `materialComposition`, `condition`, `riskLevel`, `biologicalCategory`, `recyclingGuidance`, optional `upcyclingRecipe`, optional `dnaFingerprint`, `points`, `estimatedWeight`, `urbanArtifactStory`.

### 6.2 Scoring (FR-SCORE)
- Base points assigned by AI on **Indian MSW Rules 2016** logic:
  - E-Waste / Hazardous: 100–200
  - Plastics / Metals: 20–50
  - Paper / Organic: 10–20
- Activity multiplier: Walking `1.0`, Running `1.5`, Cycling `1.2`.
- Cleanup claim adds a cleanup bonus equal to base points, plus `+15 Cr` and waste-weight tracking.
- Upcycle bonus: `+50 XP` once per scan.

### 6.3 Zone / Sector Health (FR-ZONE)
- Wastes are zoned by `lat.toFixed(3)_lng.toFixed(3)`.
- Health `0–100`, mapped to status: Critical, Dirty, Moderate, Clean, Pristine.
- Decays over time; cleanup boosts (+15), reporting reduces (−2); trees provide buffs and decay protection.

### 6.4 Tree Plantation (FR-TREE)
- Modes: `self` (50 Cr, GPS-verified), `community` (100 Cr, bulk discounts), `sponsored` (0 Cr, unlocks at 30-day streak or 1000 XP).
- Lifecycle: Sapling → Young → Growing → Mature, with CO2 offset and health decay when neglected (self trees; −2/day neglected, 0 at 30 days).
- Maintenance: water (12h cooldown, +10 health, +50 XP), fertilize (7d cooldown, +15 health, +100 XP).

### 6.5 Companion AI (FR-AI-CHAT)
- `POST /api/chat` for EcoScout Q&A; `POST /api/aria-report` for ARIA briefing.

## 7. Metrics / Success

- DAU adoption of scanning feature.
- Scans-to-tree conversion rate.
- Sector health improvement where users are active.

## 8. Non-Functional Requirements

- **Offline resilience:** AI service failure falls back to user-provided personal key or graceful degradation.
- **Performance:** client image compression to ≤400px width before storage; 30s analysis timeout; 15s chat timeout.
- **Security:** Firebase security rules, helmet, rate limiting, CORS allowlist (see SECURITY.md).

## 9. Out of Scope (Future)

- Real multiplayer sync / live backend game state.
- Payments for trees, real NGO integrations.
- PWA install prompts, offline full-feature mode.
