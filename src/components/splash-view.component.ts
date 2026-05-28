import { Component, ChangeDetectionStrategy, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-splash-view',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="h-full w-full flex flex-col items-center justify-center bg-slate-950 font-inter relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
         <div class="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]"></div>
         <div class="absolute bottom-1/4 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div class="relative z-10 flex flex-col items-center animate-fade-in-up">
        <div class="w-32 h-32 mb-6 relative">
           <div class="absolute inset-0 bg-emerald-500 rounded-3xl rotate-6 opacity-20 animate-pulse"></div>
           <div class="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <span class="text-6xl filter drop-shadow">🌍</span>
           </div>
        </div>
        <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tight mb-2">
           EcoSnap
        </h1>
        <p class="text-slate-400 font-mono text-sm tracking-widest uppercase">Initializing</p>
      </div>

      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0s;"></div>
        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0.1s;"></div>
        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0.2s;"></div>
      </div>
    </div>
  `,
    styles: [`
    @keyframes fade-in-up {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.8s ease-out forwards;
    }
   `]
})
export class SplashViewComponent implements OnInit {
    finish = output<void>();

    ngOnInit() {
        // Show splash for 2.5 seconds
        setTimeout(() => {
            this.finish.emit();
        }, 2500);
    }
}
