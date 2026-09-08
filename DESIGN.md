# EcoSnap — Design

## 1. Theme

Futuristic "urban ecology / cyberpunk" aesthetic. Two themes:

- **Default (emerald):** primary `#10b981`, glow `rgba(16,185,129,0.5)`, bg `#0f172a`.
- **Bioluminescent (purple):** primary `#8b5cf6`, glow `rgba(139,92,246,0.7)`, bg `#09090b`. Toggled via `isBioluminescent` signal (persisted `swh_theme_bio`).

Defined in `index.html` CSS variables and applied via `.bio-theme` class on `<body>`.

## 2. Typography

- **Inter** (Google Fonts) — weights 300/400/600/700.

## 3. Global Styles (`src/styles.css`)

- Tailwind utility-first styling plus custom component styles.
- Dark solid backgrounds, glows, glassmorphism overlays, animated particles.

## 4. Motion & Effects (`index.html` inline styles)

- **Button effects:** shockwave, particle burst, 3D press.
- **Ambient:** floating particles (`floatUp`), pulsing glows.
- **Loading:** DNA-helix spinner, skeleton loaders.
- **Alert:** glitch/scanline overlay with red flicker for critical sector decay.
- **Chat:** pop-in and slide-down animations; typewriter effect for AI responses.

## 5. Views (screen flows)

| View | Purpose |
|------|---------|
| Splash | Boot/onboarding gate → dashboard or landing |
| Landing | New-user onboarding / codename entry |
| Camera | Image capture → analysis |
| Scan result | AI analysis modal + scout/cleanup claims + upcycle |
| Dashboard | Stats, zones, badges, history, leaderboard, quick actions |
| Community (Map) | Sector map, hotspots, eco wave |
| Team | Leaderboard/rankings |
| Settings | Theme, sound, API key, data management, account |
| Eco Companion | AI chat copilot |
| Info/legal | About, FAQ, privacy, terms, contact, account deletion |

## 6. Component Conventions

- All components are **standalone Angular** components (no NgModules).
- Rendered inside `app.component.html`; view switching is driven by `currentView()` signal in `AppComponent`.
- `SkeletonLoaderComponent` provides loading placeholders (shimmer) for async data.
