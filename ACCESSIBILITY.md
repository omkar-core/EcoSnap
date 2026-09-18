# EcoSnap — Accessibility

## Current State
Accessibility is now a **work-in-progress with core fixes landed**. Remaining items are listed under "Gaps to address".

## Already present (baseline)
- Semantic HTML in views (`app-root` host, standard elements, buttons with text).
- `<meta viewport>` allows zoom (`maximum-scale=5`, `user-scalable` removed) — satisfies WCAG 1.4.4.
- High-contrast dark themes with readable color pairings.
- Toasts for feedback are surfaced to all users (not color-only).
- `lang="en"` declared on `<html>`.

## Landed (2026-09)
- **Screen-reader labels:** `aria-label` added to icon-only buttons across the app (navbar toggles, AI copilot FAB/close/send, settings/back/API-key/theme/sound controls, camera close/back/switch, team settings gear, dashboard edit-name & notifications, eco-companion orb/hide, scan-result close/share, planting close).
- **Modal semantics:** AI copilot, scan-result, and reforestation dialogs expose `role="dialog"` + `aria-modal`, and `Escape` dismisses them (scan-result + AI at app level, planting within map view).
- **Motion:** global `@media (prefers-reduced-motion: reduce)` block zeroes animation/transition durations and disables smooth scroll.
- **Images:** scan-result photo has a descriptive `alt` bound to the detected waste type.

## Gaps to address
- **Focus management:** add an explicit focus trap (and focus restoration to the initiating element) inside modals — currently only Escape dismissal is wired.
- **Color contrast:** verify on glow/emerald & bioluminescent themes against WCAG AA (esp. primary text on `--bg-base`).
- **Touch/fine-motor:** ensure minimum target sizes for game actions.

## Checklist for release
- [x] `aria-label`s on icon-only and interactive elements.
- [ ] Focus trap + escape on modals (escape done; focus trap pending).
- [x] `prefers-reduced-motion` media query.
- [ ] Contrast audit on both themes.
- [ ] Keyboard navigation across views.
