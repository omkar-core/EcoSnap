import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
   selector: 'app-about-us-view',
   standalone: true,
   imports: [CommonModule],
   changeDetection: ChangeDetectionStrategy.OnPush,
   template: `
    <div class="h-full overflow-y-auto bg-slate-950 px-6 py-8 font-inter">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8 sticky top-0 bg-slate-950/90 backdrop-blur pb-4 pt-2 z-10 border-b border-slate-800">
        <button (click)="back.emit()" class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <h1 class="text-xl font-bold text-white">About Us</h1>
      </div>

      <!-- Content -->
      <div class="flex flex-col items-center mb-8">
         <div class="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-emerald-900/40 mb-4 border border-emerald-300/30">
            🌍
         </div>
         <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tight mb-1">EcoSnap</h2>
         <p class="text-emerald-500/80 font-mono text-[10px] tracking-[0.2em] uppercase">Built for the future</p>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 space-y-4">
         <p class="text-slate-300 text-sm leading-relaxed">
            EcoSnap is a smart, AI-powered application designed to promote environmental awareness and sustainable practices through technology. The app focuses on simplifying environmental monitoring, analysis, and eco-friendly decision-making using intelligent data processing and automation.
         </p>
         <p class="text-slate-300 text-sm leading-relaxed">
            EcoSnap is designed, developed, and maintained solely by <strong class="text-emerald-400">Omkar Kore</strong>, an Electronics and Telecommunication Engineering student and independent developer. The app reflects a strong blend of AI, embedded systems, and real-world problem solving, with a vision to create scalable and impactful digital solutions for environmental sustainability.
         </p>
         <p class="text-slate-300 text-sm leading-relaxed">
            As a solo developer, Omkar Kore handles everything end-to-end — system design, AI logic, frontend and backend development, testing, optimization, and future updates.
         </p>
         <p class="text-slate-300 text-sm leading-relaxed">
            EcoSnap is continuously evolving, with upcoming features and improvements driven by innovation, user feedback, and real-world applicability.
         </p>
      </div>

      <div class="mt-8 text-center border-t border-slate-800 pt-6">
         <p class="text-xs text-slate-500">&copy; EcoSnap | Developed & Maintained by <strong class="text-emerald-500/80">Omkar Kore</strong></p>
      </div>
    </div>
  `,
   styles: []
})
export class AboutUsViewComponent {
   back = output<void>();
}
