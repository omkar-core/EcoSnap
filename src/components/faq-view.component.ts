import { Component, ChangeDetectionStrategy, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-faq-view',
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
        <h1 class="text-xl font-bold text-white">FAQ</h1>
      </div>

      <!-- Content -->
      <div class="space-y-4">
        
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer" (click)="toggle(0)">
           <div class="p-4 flex items-center justify-between bg-slate-800/50">
              <span class="text-white font-medium">How are my points calculated?</span>
              <span class="text-emerald-400 text-sm">{{ isOpen(0) ? '−' : '+' }}</span>
           </div>
           @if(isOpen(0)) {
              <div class="p-4 text-slate-400 text-sm leading-relaxed border-t border-slate-800">
                 Points are awarded based on our Gemini AI analysis of your scan. Identifying rare materials 
                 or successfully upcycling items grants bonus multipliers. 
              </div>
           }
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer" (click)="toggle(1)">
           <div class="p-4 flex items-center justify-between bg-slate-800/50">
              <span class="text-white font-medium">Is the map realtime?</span>
              <span class="text-emerald-400 text-sm">{{ isOpen(1) ? '−' : '+' }}</span>
           </div>
           @if(isOpen(1)) {
              <div class="p-4 text-slate-400 text-sm leading-relaxed border-t border-slate-800">
                 Yes, community reports and cleanups appear on the Tactical Map in real-time, 
                 allowing you to coordinate efforts with other urban rangers.
              </div>
           }
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer" (click)="toggle(2)">
           <div class="p-4 flex items-center justify-between bg-slate-800/50">
              <span class="text-white font-medium">Can I change my username?</span>
              <span class="text-emerald-400 text-sm">{{ isOpen(2) ? '−' : '+' }}</span>
           </div>
           @if(isOpen(2)) {
              <div class="p-4 text-slate-400 text-sm leading-relaxed border-t border-slate-800">
                 Your Codename acts as your permanent ID across the network and leaderboards. 
                 Currently, it cannot be changed once established.
              </div>
           }
        </div>

      </div>
    </div>
  `,
    styles: []
})
export class FaqViewComponent {
    back = output<void>();

    openState = signal<Record<number, boolean>>({});

    isOpen(index: number): boolean {
        return !!this.openState()[index];
    }

    toggle(index: number) {
        this.openState.update(state => ({ ...state, [index]: !state[index] }));
    }
}
