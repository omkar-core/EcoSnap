# EcoSnap — SEO

## Applicability
EcoSnap is primarily a **hybrid mobile app** (Capacitor) and an authenticated web SPA bootstrapped from a single `index.html` with client-rendered Angular. Traditional SEO applies mostly to the public web shell — there are no public, indexable content pages (dashboard/game content are behind the app shell).

## Current baseline
- Single `index.html` with:
  - `<title>EcoSnap</title>`
  - `<meta name="viewport" ...>` (mobile)
  - `<html lang="en">`
  - Google Fonts preconnect/stylesheet.
- **No** `description`, `og:*`, `theme-color`, canonical, or structured-data meta tags yet.

## Recommended additions (web)
- `<meta name="description">` — e.g., "EcoSnap: Scan waste, earn XP, and plant trees to restore your neighborhood."
- Open Graph / Twitter Card tags (`og:title`, `og:description`, `og:image`, `og:type`).
- `<meta name="theme-color">` matching `--bg-base` / themed primary.
- Canonical URL for the hosted homepage.
- Prefer render of meaningful content; if needed, add Angular Universal/SSR or pre-render the landing view for bot crawling (higher effort — only if public landing SEO is a goal).

## Guidelines
- Add `aria-hidden`, lazy-load decorative assets.
- Keep a single canonical production URL.
- Verify robots aren't blocking desired pages if a public marketing/landing page is added.
