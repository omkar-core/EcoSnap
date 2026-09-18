# EcoSnap — SEO

## Applicability
EcoSnap is primarily a **hybrid mobile app** (Capacitor) and an authenticated web SPA bootstrapped from a single `index.html` with client-rendered Angular. Traditional SEO applies mostly to the public web shell — there are no public, indexable content pages (dashboard/game content are behind the app shell).

## Current baseline
- Single `index.html` with:
  - `<title>EcoSnap: Smart Waste Hunt</title>`
  - `<meta name="viewport" ...>` (mobile)
  - `<html lang="en">`
  - Google Fonts preconnect/stylesheet.
  - `<meta name="description">`, `<meta name="author">`, `<meta name="theme-color">` (#0f172a).
  - Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name`).
  - Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
  - Canonical URL → `https://ecosnap.app/`.
  - JSON-LD structured data (`VideoGame` schema with offers/genre/playMode/about).
- **Remaining:** host a real `assets/og-cover.png` at the canonical origin; consider SSR/pre-render if public landing SEO becomes a goal.

## Recommended additions (web)
- Prefer render of meaningful content; if needed, add Angular Universal/SSR or pre-render the landing view for bot crawling (higher effort — only if public landing SEO is a goal).

## Guidelines
- Add `aria-hidden`, lazy-load decorative assets.
- Keep a single canonical production URL.
- Verify robots aren't blocking desired pages if a public marketing/landing page is added.
