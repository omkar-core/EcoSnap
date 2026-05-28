import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-info-view',
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
        <h1 class="text-xl font-bold text-white">App Information</h1>
      </div>

      <!-- Content -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
         <ul class="space-y-4 text-sm text-slate-300">
            <li class="flex flex-col gap-1">
               <span class="text-slate-500 font-bold uppercase tracking-wider text-[10px]">App Name</span>
               <span class="text-white font-medium">EcoSnap</span>
            </li>
            <li class="flex flex-col gap-1">
               <span class="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Developer</span>
               <span class="text-emerald-400 font-medium">Omkar Kore (Solo Developer)</span>
            </li>
            <li class="flex flex-col gap-1">
               <span class="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Development Type</span>
               <span class="text-white font-medium">Independent / Self-Developed</span>
            </li>
            <li class="flex flex-col gap-1">
               <span class="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Core Technologies</span>
               <span class="text-white font-medium">AI, Data Analysis, Smart Monitoring Systems</span>
            </li>
            <li class="flex flex-col gap-1">
               <span class="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Purpose</span>
               <span class="text-white font-medium">Environmental awareness, eco-monitoring, and intelligent insights</span>
            </li>
         </ul>
      </div>

      <div class="bg-emerald-900/20 border border-emerald-800/50 rounded-2xl p-6">
         <h3 class="text-emerald-400 font-bold mb-2">Developer Note</h3>
         <p class="text-slate-300 text-sm leading-relaxed mb-4">
            EcoSnap is a continuously updated application. All improvements, bug fixes, feature upgrades, and AI model enhancements are handled directly by the developer.
         </p>
      </div>
      
      <div class="mt-8 text-center border-t border-slate-800 pt-6">
         <p class="text-xs text-slate-500">&copy; EcoSnap | Developed & Maintained by <strong class="text-emerald-500/80">Omkar Kore</strong></p>
      </div>
    </div>
  `,
    styles: []
})
export class InfoViewComponent {
    back = output<void>();
}
