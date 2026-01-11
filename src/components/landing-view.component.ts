import { Component, inject, signal, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-landing-view',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <!-- Background Gradients -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div class="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-emerald-900/20 rounded-full blur-[120px]"></div>
         <div class="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div class="relative z-10 w-full max-w-md flex flex-col gap-8 animate-fade-in">
        
        <!-- Hero -->
        <div class="text-center">
           <div class="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center justify-center transform rotate-3">
              <span class="text-5xl">♻️</span>
           </div>
           <h1 class="text-5xl font-black text-white tracking-tight mb-2">EcoSnap</h1>
           <p class="text-emerald-400 font-mono uppercase tracking-widest text-xs">Urban Ecology Protocol v1.0</p>
        </div>

        <!-- Description -->
        <div class="bg-slate-900/80 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-xl">
           <p class="text-slate-300 text-center leading-relaxed">
             Turn your fitness runs into a cleanup mission. 
             <span class="text-white font-bold">AI identifies waste</span>, you clear it, and we track the impact. 
             Heal your city's sectors one item at a time.
           </p>
        </div>

        <!-- Features -->
        <div class="grid grid-cols-3 gap-3">
           <div class="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center flex flex-col items-center">
              <div class="text-2xl mb-2">📸</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase">AI Vision</div>
           </div>
           <div class="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center flex flex-col items-center">
              <div class="text-2xl mb-2">🌍</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase">Heal Zones</div>
           </div>
           <div class="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center flex flex-col items-center">
              <div class="text-2xl mb-2">🏃</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase">Active XP</div>
           </div>
        </div>

        <!-- Identity Setup -->
        <div class="space-y-4 pt-4">
           <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-slate-500 uppercase ml-1">Establish Identity</label>
              <input 
                 #userInput
                 type="text" 
                 [value]="username()"
                 (input)="updateName(userInput.value)"
                 (keyup.enter)="onStart()"
                 placeholder="Enter Codename..."
                 class="bg-slate-900 text-white text-lg font-bold px-4 py-4 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600 text-center"
              >
           </div>

           <button (click)="onStart()" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-emerald-900/40 transition-all active:scale-95 flex items-center justify-center gap-2 group">
              Start Mission
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
           </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
  `]
})
export class LandingViewComponent {
  game = inject(GameService);
  finish = output<void>();
  
  username = signal('');

  constructor() {
    this.username.set(this.game.username());
  }

  updateName(name: string) {
    this.username.set(name);
    this.game.updateUsername(name);
  }

  onStart() {
    this.game.completeOnboarding();
    this.finish.emit();
  }
}