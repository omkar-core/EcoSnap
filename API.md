# EcoSnap — API

Base path: `/api`. Server: Express (TypeScript). JSON in/out. Content-Type: `application/json`. Body limit `10mb`.

## Endpoints

### POST `/api/analyze`
AI waste analysis of an image.

**Request body:**
```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "context": {
    "timestamp": "2026-01-01T00:00:00Z",
    "activity": "Walking|Running|Cycling",
    "lat": 19.076,
    "lng": 72.8777
  },
  "personalKey": "optional-user-gemini-key"
}
```

**Response `200 OK`** — a `WasteAnalysis` object (see `src/services/gemini.service.ts` for full shape):
```json
{
  "wasteType": "Crushed PET Bottle",
  "confidence": 95,
  "isRecyclable": true,
  "materialComposition": ["PET"],
  "condition": "Intact",
  "riskLevel": "Low",
  "biologicalCategory": "Non-Organic",
  "reasoning": "...",
  "funFact": "...",
  "recyclingGuidance": {
    "category": "Dry",
    "preparationSteps": ["..."],
    "environmentalImpact": "...",
    "handlingRisk": "Safe"
  },
  "upcyclingRecipe": { "idea": "...", "difficulty": "Easy", "materialsNeeded": [], "instructions": [], "estimatedCarbonSaved": 0 },
  "dnaFingerprint": { "decompositionTimeline": "...", "toxicityLevel": 10, "microplasticRisk": 20, "hauntingSentence": "..." },
  "points": 30,
  "estimatedWeight": 25,
  "urbanArtifactStory": "..."
}
```

**Errors:**
- `400` validation errors → `{ "errors": [...] }`
- `429` rate limit → `{ "error": "Rate limit exceeded for AI analysis. ..." }`
- `503` key missing → `{ "error": "AI service unavailable" }`
- `500` parse/server → `{ "error": "..." }`

### POST `/api/chat`
EcoScout AI chat for ecology questions.

**Request body:**
```json
{ "message": "How do I recycle e-waste?", "personalKey": "optional" }
```

**Response `200 OK`:** `{ "text": "..." }`
- `message` required, string, max 2000 chars.
- Rate limited to 20/min.

### POST `/api/aria-report`
Generates an ARIA (reforestation companion) briefing from stats.

**Request body:**
```json
{ "stats": { "points": 1200, "trees": 3, "weightKg": 5.2 }, "personalKey": "optional" }
```

**Response `200 OK`:** `{ "text": "..." }`
- `stats` required object. Rate limited to 10/min.

## Common Error Codes
| Code | Meaning |
|------|---------|
| 400 | Validation failed |
| 429 | Rate limited (retry later) |
| 503 | AI service unavailable (no API key) |
| 500 | Internal/server error |

## Client integration notes
- Client sets 35s timeout on `/analyze`, 15s on `/chat` and `/aria-report`.
- Client retries once with a personal key fallback on rate-limit/5xx if one is configured.
