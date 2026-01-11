import { Component, inject, signal, output, ChangeDetectionStrategy, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-landing-view',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter">
      <!-- High-End Background Effects -->
      <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
         <div class="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse-slow"></div>
         <div class="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse-slow" style="animation-delay: 2s"></div>
         
         <!-- Floating Particles (CSS Only) -->
         <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full opacity-50 animate-float"></div>
         <div class="absolute top-3/4 right-1/4 w-3 h-3 bg-indigo-400 rounded-full opacity-30 animate-float" style="animation-duration: 7s; animation-delay: 1s"></div>
         <div class="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-white rounded-full opacity-40 animate-float" style="animation-duration: 5s; animation-delay: 3s"></div>
      </div>

      <div class="relative z-10 w-full max-w-md flex flex-col gap-10">
        
        <!-- Hero Section -->
        <div class="text-center space-y-4">
           <!-- Logo Container with Glow -->
           <div class="relative w-32 h-32 mx-auto mb-6 group cursor-pointer">
              <div class="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-cyan-400 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
              <div class="relative w-full h-full bg-slate-900 border border-slate-700 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden">
                 <div class="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                 <span class="text-6xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">🌿</span>
              </div>
           </div>
           
           <!-- Typewriter Title -->
           <div>
             <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-400 tracking-tight mb-2 h-14">
                {{ displayedTitle() }}<span class="text-emerald-500 animate-blink">|</span>
             </h1>
             <p class="text-indigo-300 font-mono uppercase tracking-[0.2em] text-xs h-4">
                {{ displayedSubtitle() }}
             </p>
           </div>
        </div>

        <!-- Glassmorphic Value Prop -->
        <div class="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl transform transition-all hover:scale-[1.02] hover:bg-slate-900/50 group">
           <p class="text-slate-300 text-center leading-relaxed font-light">
             Turn urban exploration into a <span class="text-emerald-400 font-bold">planetary rescue mission</span>. 
             Powered by <span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 font-bold">Gemini AI</span> to analyze, track, and heal your sector.
           </p>
        </div>

        <!-- Interactive Features Grid -->
        <div class="grid grid-cols-3 gap-4">
           <div class="bg-gradient-to-b from-slate-800/50 to-slate-900/50 p-4 rounded-2xl border border-slate-700/50 text-center hover:border-emerald-500/50 transition-colors">
              <div class="text-2xl mb-2">📸</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Vision</div>
           </div>
           <div class="bg-gradient-to-b from-slate-800/50 to-slate-900/50 p-4 rounded-2xl border border-slate-700/50 text-center hover:border-emerald-500/50 transition-colors">
              <div class="text-2xl mb-2">🗺️</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tactical Map</div>
           </div>
           <div class="bg-gradient-to-b from-slate-800/50 to-slate-900/50 p-4 rounded-2xl border border-slate-700/50 text-center hover:border-emerald-500/50 transition-colors">
              <div class="text-2xl mb-2">🏆</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rank Up</div>
           </div>
        </div>

        <!-- Identity Setup -->
        <div class="space-y-4 pt-4">
           <div class="flex flex-col gap-2">
              <label class="text-[10px] font-bold text-emerald-500/80 uppercase ml-1 tracking-widest">Establish Identity</label>
              <input 
                 #userInput
                 type="text" 
                 [value]="username()"
                 (input)="updateName(userInput.value)"
                 (keyup.enter)="onStart()"
                 placeholder="ENTER CODENAME..."
                 class="bg-black/30 text-white text-xl font-bold px-6 py-5 rounded-2xl border border-white/10 focus:border-emerald-500 focus:bg-emerald-950/10 outline-none transition-all placeholder:text-slate-700 text-center shadow-inner tracking-wide"
              >
           </div>

           <!-- HOLOGRAPHIC BUTTON DESIGN -->
           <button (click)="onStart()" class="relative w-full group overflow-hidden rounded-2xl btn-shockwave">
              <!-- Animated Background Gradient -->
              <div class="absolute inset-0 bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-emerald-600 via-teal-600 to-cyan-700 group-hover:scale-110 transition-transform duration-500"></div>
              
              <!-- Scanning Line Overlay -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-10"></div>
              
              <!-- Content -->
              <div class="relative py-5 px-6 flex items-center justify-center gap-3 z-20">
                 <span class="text-white font-black text-lg uppercase tracking-widest drop-shadow-md">Initiate Protocol</span>
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white group-hover:translate-x-2 transition-transform duration-300 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                 </svg>
              </div>
              
              <!-- Bottom Glow -->
              <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-white/50 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
           </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes pulse-slow {
      0%, 100% { opacity: 0.1; transform: scale(1); }
      50% { opacity: 0.2; transform: scale(1.1); }
    }
    .animate-pulse-slow { animation: pulse-slow 8s infinite; }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    .animate-float { animation: float 6s ease-in-out infinite; }
    
    @keyframes blink { 50% { opacity: 0; } }
    .animate-blink { animation: blink 1s step-end infinite; }
  `]
})
export class LandingViewComponent implements AfterViewInit, OnDestroy {
  game = inject(GameService);
  finish = output<void>();
  
  username = signal('');
  
  displayedTitle = signal('');
  displayedSubtitle = signal('');
  
  private timeouts: any[] = [];

  constructor() {
    this.username.set(this.game.username());
  }
  
  ngAfterViewInit() {
    this.typewrite('EcoSnap', this.displayedTitle, 150);
    setTimeout(() => {
       this.typewrite('Urban Ecology Protocol v1.0', this.displayedSubtitle, 50);
    }, 1200);
  }
  
  ngOnDestroy() {
    this.timeouts.forEach(clearTimeout);
  }

  updateName(name: string) {
    this.username.set(name);
    this.game.updateUsername(name);
  }

  onStart() {
    this.game.completeOnboarding();
    this.finish.emit();
  }
  
  private typewrite(text: string, signalSetter: any, speed: number) {
    let cursor = 0;
    const type = () => {
       if (cursor < text.length) {
          signalSetter.update((s: string) => s + text.charAt(cursor));
          cursor++;
          this.timeouts.push(setTimeout(type, speed));
       }
    };
    type();
  }
}