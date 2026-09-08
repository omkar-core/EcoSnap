# EcoSnap — Accessibility

## Current State
Accessibility is **not yet a dedicated focus** — no explicit ARIA/label enhancements beyond semantic HTML defaults. Known gaps should be addressed before a public release.

## Already present (baseline)
- Semantic HTML in views (`app-root` host, standard elements, buttons with text).
- `<meta viewport>` with `user-scalable=no` (mobile app — note: restricts zoom).
- High-contrast dark themes with readable color pairings.
- Toasts for feedback are surfaced to all users (not color-only).
- `lang="en"` declared on `<html>`.

## Gaps to address
- **Screen-reader labels:** ensure camera view, icon-only buttons, and scan results expose accessible names (`aria-label`).
- **Focus management:** modal/scan-result needs focus trapping + return-focus; keyboard dismissal.
- **Color contrast:** verify on glow/emerald & bioluminescent themes against WCAG AA (esp. primary text on `--bg-base`).
- **Motion:** provide `prefers-reduced-motion` support to disable particles/typewriter/flashing glitch overlay.
- **Viewport zoom:** reconsider `user-scalable=no` (WCAG 1.4.4).
- **Touch/fine-motor:** ensure minimum target sizes for game actions.

## Checklist for release
- [ ] `aria-label`s on icon-only and interactive elements.
- [ ] Focus trap + escape on modals.
- [ ] `prefers-reduced-motion` media query.
- [ ] Contrast audit on both themes.
- [ ] Keyboard navigation across views.
