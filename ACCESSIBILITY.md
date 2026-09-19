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
- **Focus management:** `FocusTrapDirective` (`src/directives/focus-trap.directive.ts`) traps `Tab`/`Shift+Tab` within the AI copilot, scan-result, and reforestation dialogs, focuses the first control on open, and restores focus to the initiating element on close.
- **Motion:** global `@media (prefers-reduced-motion: reduce)` block zeroes animation/transition durations and disables smooth scroll.
- **Images:** scan-result photo has a descriptive `alt` bound to the detected waste type.
- **Color contrast:** secondary body/label text raised from `text-slate-500`/`text-slate-600` to `text-slate-400` (~7.8:1 on `slate-950`, ~7.0:1 on `slate-900`) to meet WCAG AA for normal text on the dark theme. Skeleton placeholders are `aria-hidden`.

## Gaps to address
- **Remaining contrast:** re-verify the bioluminescent/emerald glow accents (decorative), and confirm any future light-mode surfaces independently.
- **Touch/fine-motor:** ensure minimum target sizes for game actions.

## Checklist for release
- [x] `aria-label`s on icon-only and interactive elements.
- [x] Focus trap + escape on modals.
- [x] `prefers-reduced-motion` media query.
- [x] Contrast audit on the dark theme (secondary text raised to AA).
- [ ] Keyboard navigation across views.
