import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-terms-conditions-view',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="h-full overflow-y-auto bg-slate-950 px-6 py-8 font-inter">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6 sticky top-0 bg-slate-950/90 backdrop-blur pb-4 pt-2 z-10 border-b border-slate-800">
        <button (click)="back.emit()" class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <h1 class="text-xl font-bold text-white">Terms & Conditions</h1>
      </div>

      <!-- Content -->
      <div class="prose prose-invert prose-emerald max-w-none text-slate-300">
        <p class="text-sm italic mb-6">Effective Date: October 2023</p>

        <h2 class="text-white font-bold text-lg mt-6 mb-2">1. Use of Service</h2>
        <p class="text-sm leading-relaxed mb-4">
          By accessing EcoSnap, you agree to these Terms and Conditions. The App is provided "as is"
          and is intended for educational, ecological awareness, and entertainment purposes.
        </p>

        <h2 class="text-white font-bold text-lg mt-6 mb-2">2. User Conduct</h2>
        <p class="text-sm leading-relaxed mb-4">
          You agree not to misuse the platform. Creating offensive content, attempting to exploit
          the scanning mechanics, or using bots to artificially raise your leaderboard score 
          are strictly prohibited.
        </p>

        <h2 class="text-white font-bold text-lg mt-6 mb-2">3. Intellectual Property</h2>
        <p class="text-sm leading-relaxed mb-4">
           All rights to the app design, content, branding, and algorithms remain with EcoSnap. 
           Images captured via your device remain yours, but you grant us a license to process 
           them according to the Privacy Policy.
        </p>

        <h2 class="text-white font-bold text-lg mt-6 mb-2">4. Disclaimers</h2>
        <p class="text-sm leading-relaxed mb-8">
           We are not responsible for injuries or property damage incurred from interacting with 
           the physical environment. Always prioritize your safety while using EcoSnap in urban settings.
        </p>
      </div>
    </div>
  `,
    styles: []
})
export class TermsConditionsViewComponent {
    back = output<void>();
}
