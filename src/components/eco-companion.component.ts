import { Component, ChangeDetectionStrategy, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';
import { GeminiService } from '../services/gemini.service';

@Component({
    selector: 'app-eco-companion',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <!-- ARIA Floating Orb -->
    <div class="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 pointer-events-none px-4 max-w-[80vw]">

      <!-- Chat Bubble -->
      @if (isVisible() && ariaMessage()) {
        <div class="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl rounded-br-none p-4 shadow-2xl pointer-events-auto transform transition-all duration-300 origin-bottom-right animate-scale-in max-w-sm relative overflow-hidden group">
          <div class="absolute inset-0 opacity-20 pointer-events-none" [class]="moodColorClass()"></div>
          
          <div class="flex items-center gap-2 mb-2">
             <span class="text-xs font-mono font-bold tracking-widest text-slate-400">ARIA_LINK // {{ moodLabel() }}</span>
             <span class="flex-1"></span>
             <button (click)="hideMessage()" class="text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full p-1 leading-none">✕</button>
          </div>
          
          <p class="text-sm font-medium text-slate-200 leading-relaxed font-mono whitespace-pre-line relative z-10 w-full">
            {{ ariaMessage() }}
          </p>

          <!-- Deep Scan Button -->
          <button (click)="runDeepScan()" [disabled]="isScanning()" 
                  class="mt-3 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
             @if (isScanning()) {
               <div class="w-3 h-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></div>
               Analyzing Telemetry...
             } @else {
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
               Deep Scan Briefing
             }
          </button>
        </div>
      }

      <!-- Orb Avatar -->
      <button (click)="toggleMessage()" class="relative pointer-events-auto group outline-none">
         <!-- Aura -->
         <div class="absolute inset-0 rounded-full blur-xl opacity-50 transition-all duration-1000 animate-pulse" [class]="moodGlowClass()"></div>
         
         <!-- Core -->
         <div class="w-14 h-14 rounded-full bg-slate-900 border-2 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] relative z-10 flex items-center justify-center transition-all duration-500" [class]="moodBorderClass()">
            <!-- Synthetic Face Rings -->
            <div class="absolute inset-2 rounded-full border border-white/20 animate-[spin_10s_linear_infinite]"></div>
            <div class="absolute inset-3 rounded-full border-t flex justify-center border-white/30 animate-[spin_6s_linear_infinite_reverse]"></div>
            
            <!-- Eyes -->
            <div class="flex gap-2">
               <div class="w-1.5 h-3 rounded-full bg-white transition-all duration-500 shadow-[0_0_8px_currentColor]" [class]="moodTextClass()"></div>
               <div class="w-1.5 h-3 rounded-full bg-white transition-all duration-500 shadow-[0_0_8px_currentColor]" [class]="moodTextClass()"></div>
            </div>
         </div>
      </button>

    </div>
  `,
    styles: [`
    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.9) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  `]
})
export class EcoCompanionComponent {
    game = inject(GameService);
    gemini = inject(GeminiService);

    isVisible = signal(true);
    isScanning = signal(false);
    ariaMessage = signal('Ranger. Systems online. Waiting for your first move.');

    mood = computed<'hopeful' | 'concerned' | 'critical'>(() => {
        const health = this.game.neighborhoodHealth();
        if (health > 70) return 'hopeful';
        if (health > 30) return 'concerned';
        return 'critical';
    });

    moodColorClass = computed(() => {
        switch (this.mood()) {
            case 'hopeful': return 'bg-emerald-500';
            case 'concerned': return 'bg-amber-500';
            case 'critical': return 'bg-red-500';
        }
    });

    moodGlowClass = computed(() => {
        switch (this.mood()) {
            case 'hopeful': return 'bg-emerald-400';
            case 'concerned': return 'bg-amber-400';
            case 'critical': return 'bg-red-500 animate-[pulse_2s_infinite]';
        }
    });

    moodBorderClass = computed(() => {
        switch (this.mood()) {
            case 'hopeful': return 'border-emerald-500/50';
            case 'concerned': return 'border-amber-500/50';
            case 'critical': return 'border-red-500/80';
        }
    });

    moodTextClass = computed(() => {
        switch (this.mood()) {
            case 'hopeful': return 'text-emerald-400 h-2'; // Happy squint
            case 'concerned': return 'text-amber-400 h-3'; // Normal
            case 'critical': return 'text-red-500 h-[1px]'; // Mad narrow
        }
    });

    moodLabel = computed(() => {
        switch (this.mood()) {
            case 'hopeful': return 'STABLE / HOPEFUL 💚';
            case 'concerned': return 'WARNING / CONCERNED 🟡';
            case 'critical': return 'DANGER / CRITICAL 🔴';
        }
    });

    constructor() {
        // Generate context-aware tips based on global state changes using effect
        effect(() => {
            const mode = this.game.currentActivity();
            setTimeout(() => {
                if (!this.isScanning()) {
                    this.ariaMessage.set(`Activity shifted to ${mode}. Environmental sensors tracking your movement. Stay sharp.`);
                }
            }, 0);
        });
    }

    toggleMessage() {
        this.isVisible.update(v => !v);
    }

    hideMessage() {
        this.isVisible.set(false);
    }

    async runDeepScan() {
        if (this.isScanning()) return;
        this.isScanning.set(true);

        // Build stats for Gemini
        const stats = {
            xp: this.game.totalPoints(),
            wasteKg: this.game.totalWasteWeight() / 1000,
            streak: this.game.streakDays(),
            trees: this.game.trees().length,
            rank: this.game.userRank()
        };

        const result = await this.gemini.generateAriaReport(stats);
        this.ariaMessage.set(result);
        this.isScanning.set(false);
        this.isVisible.set(true);
    }
}
