import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-privacy-policy-view',
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
        <h1 class="text-xl font-bold text-white">Privacy Policy</h1>
      </div>

      <!-- Content -->
      <div class="prose prose-invert prose-emerald max-w-none text-slate-300">
        <p class="text-sm italic mb-6">Last Updated: October 2023</p>

        <h2 class="text-white font-bold text-lg mt-6 mb-2">1. Information We Collect</h2>
        <p class="text-sm leading-relaxed mb-4">
          EcoSnap collects device identifiers, general location data (if permitted), and image data
          during scanning. Image data is processed by our AI and may be temporarily stored to 
          track ecological impact and generate your statistics. 
        </p>

        <h2 class="text-white font-bold text-lg mt-6 mb-2">2. How We Use Information</h2>
        <p class="text-sm leading-relaxed mb-4">
          Data is used strictly to provide the core functionality of EcoSnap (plant counting, 
          waste tracking, gamified progression), personalize your experience, and improve 
          our AI models over time.
        </p>

        <h2 class="text-white font-bold text-lg mt-6 mb-2">3. Data Sharing</h2>
        <p class="text-sm leading-relaxed mb-4">
          We do not sell your personal data. We share anonymized metrics internally 
          and utilize third-party APIs (like Google Gemini) purely to process the analysis tasks.
        </p>

        <h2 class="text-white font-bold text-lg mt-6 mb-2">4. Your Rights</h2>
        <p class="text-sm leading-relaxed mb-8">
           You reserve the right to request deletion of your data via the Settings menu. 
           Deleting your account removes your statistics from all leaderboards.
        </p>
      </div>
    </div>
  `,
    styles: []
})
export class PrivacyPolicyViewComponent {
    back = output<void>();
}
