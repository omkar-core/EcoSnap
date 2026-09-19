import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

const CONSENT_KEY = 'swh_cookie_consent';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isVisible()) {
    <div role="region" aria-label="Cookie consent"
      class="fixed bottom-24 left-4 right-4 z-[90] sm:left-auto sm:right-4 sm:max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-4 animate-slide-up">
      <p class="text-sm text-slate-300">
        We use local storage and anonymous analytics to keep EcoSnap running. See our
        <button type="button" (click)="viewPrivacy.emit()"
          class="text-emerald-400 underline underline-offset-2 hover:text-emerald-300">Privacy Policy</button>.
      </p>
      <div class="mt-3 flex gap-3 justify-end">
        <button type="button" (click)="decline()"
          class="px-4 py-2 text-sm rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors">Decline</button>
        <button type="button" (click)="accept()"
          class="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors">Accept</button>
      </div>
    </div>
    }
  `,
})
export class CookieConsentComponent {
  readonly viewPrivacy = output<void>();
  readonly isVisible = signal(this.shouldShow());

  accept(): void {
    this.persist('accepted');
  }

  decline(): void {
    this.persist('declined');
  }

  private shouldShow(): boolean {
    try {
      return typeof localStorage === 'undefined' || !localStorage.getItem(CONSENT_KEY);
    } catch {
      return true;
    }
  }

  private persist(value: 'accepted' | 'declined'): void {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // storage may be unavailable (private mode); ignore.
    }
    this.isVisible.set(false);
  }
}
