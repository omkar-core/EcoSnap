# EcoSnap — AI Integration

## 1. Backend Model
- **Provider:** Google Gemini 2.5 Flash (via `@google/genai`).
- **Server-side proxy** (`server/src/services/gemini.server.ts`) keeps the key off the client. Key from `process.env.GEMINI_API_KEY` or an optional client-supplied `personalKey`.

## 2. Image Analysis (`/api/analyze`)
- Prompts classify waste per **Indian Municipal Solid Waste Rules 2016**.
- **Material identification** (specific): Plastics by resin code (PET 1, HDPE 2, PVC 3, LDPE 4, PP 5, PS 6, MLP), Paper types, E-Waste, Hazardous, Metals, Glass.
- **Segregation categories (enum):** Dry, Wet, Hazardous, E-Waste.
- **Upcycling engine:** only when condition `Intact` AND risk `Low` AND non-organic.
- **Scoring logic:** e-waste/hazardous 100–200; plastics/metals 20–50; paper/organic 10–20.
- **Structured output:** `responseMimeType = application/json` with a full `responseSchema` (see `gemini.server.ts`). JSON is re-parsed/cleaned server-side (strips ``` fences, extracts braces).
- **Timeout:** response raced against a 30s timeout.

### Multi-item priority
"Prioritize the most environmentally significant item" (E-waste > Plastic > Paper).

## 3. Chat (`/api/chat`) — EcoScout
- Concise, encouraging, factual, gamified-professional persona.
- Plain text `generateContent`. No schema.

## 4. ARIA Report (`/api/aria-report`)
- Cyberpunk "Deep Scan" briefing of Ranger stats: one hopeful, one critique/warning, one tactical suggestion. Sci-fi mission tone, no markdown, ≤60 words.

## 5. Client Rules (`src/services/gemini.service.ts`)
- All calls go through the backend REST API (`environment.apiBaseUrl`).
- **Fallback:** if a user set a personal API key (`localStorage.eco_personal_api_key`), on 429/quota/5xx the client retries once using it.
- **Timeouts:** analyze 35s, chat/aria 15s (AbortController).
- On chat failure, returns an offline message rather than throwing.

## 6. Prompt/Output Grade
AI `reasoning` explains visual features; `urbanArtifactStory` adds creative narrative; `funFact` is educational. These enrich the gamified UX.

## 7. Costs & Guardrails
- AI endpoints rate-limited server-side (10/min analyze & aria, 20/min chat) to cap spend.
- Image base64 stripped of data-URI prefix before sending to API.
- Do not send unrelated or personal data in prompts beyond the image + minimal scan context.
