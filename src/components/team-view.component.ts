import { Component, ChangeDetectionStrategy, inject, computed, signal, AfterViewInit, OnDestroy, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-team-view',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pb-24 p-6 font-inter">
      
      <!-- Header -->
      <div class="mb-6 pt-6 flex items-center justify-between">
        <div>
           <h1 class="text-2xl font-bold text-white mb-1">My Profile</h1>
           <p class="text-slate-400 text-sm">Track your ecological footprint.</p>
        </div>
        <div class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
           <span class="text-xl">👤</span>
        </div>
      </div>

      <!-- Rank Progression Card -->
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 mb-6 relative overflow-hidden shadow-lg">
         <!-- Background Glow -->
         <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

         <div class="flex items-center gap-4 mb-4">
             <div class="relative">
                <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-emerald-900/40">
                   {{ game.username().charAt(0) }}
                </div>
                <div class="absolute -bottom-2 -right-2 bg-slate-900 rounded-lg px-2 py-1 border border-slate-700 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                   Lvl {{ game.userRank() === 'Seedling' ? 1 : (game.userRank() === 'Sprout' ? 2 : (game.userRank() === 'Guardian' ? 3 : (game.userRank() === 'Ranger' ? 4 : 5))) }}
                </div>
             </div>
             <div class="flex-1 min-w-0">
                <div class="text-white font-bold text-xl truncate">{{ game.username() }}</div>
                <div class="text-emerald-400 text-sm font-medium mb-1">{{ game.userRank() }}</div>
                <div class="text-slate-500 text-xs">Device ID: {{ game.deviceId().substring(0, 8) }}...</div>
             </div>
         </div>

         <!-- Progress Bar -->
         <div class="mt-2">
            <div class="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
               <span class="text-slate-400">Progress to Next Rank</span>
               <span class="text-white">{{ game.nextRankProgress() | number:'1.0-0' }}%</span>
            </div>
            <div class="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
               <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out"
                    [style.width.%]="game.nextRankProgress()"></div>
            </div>
            <div class="flex justify-between mt-2 text-xs">
               <span class="text-slate-500">{{ game.totalPoints() | number }} XP</span>
               <span class="text-slate-500">Next Level</span>
            </div>
         </div>
      </div>

      <!-- Lifetime Stats Grid -->
      <div class="grid grid-cols-3 gap-3 mb-8">
         <!-- Scans -->
         <div class="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-3 text-center">
            <div class="text-2xl mb-1">📸</div>
            <div class="text-white font-bold text-lg">{{ game.scanHistory().length }}</div>
            <div class="text-[10px] text-slate-500 uppercase font-bold">Scans</div>
         </div>
         <!-- Impact -->
         <div class="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-3 text-center">
            <div class="text-2xl mb-1">⚖️</div>
            <div class="text-white font-bold text-lg">{{ (game.totalWasteWeight() / 1000) | number:'1.1-1' }}</div>
            <div class="text-[10px] text-slate-500 uppercase font-bold">Kg Waste</div>
         </div>
         <!-- Trees -->
         <div class="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-3 text-center">
            <div class="text-2xl mb-1">🌳</div>
            <div class="text-white font-bold text-lg">{{ game.trees().length }}</div>
            <div class="text-[10px] text-slate-500 uppercase font-bold">Planted</div>
         </div>
      </div>

      <!-- Leaderboard List -->
      <div class="mb-8">
         <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🏆</span> Sector Rankings
         </h2>
         <div class="space-y-3">
            @for (member of leaderboard(); track member.name; let idx = $index) {
               <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
                    [class.border-emerald-500/50]="member.isUser"
                    [class.bg-emerald-900/10]="member.isUser">
                  
                  @if(member.isUser) {
                     <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                  }

                  <div class="relative">
                     <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm"
                          [class.from-amber-500]="idx === 0" [class.to-orange-500]="idx === 0"
                          [class.from-slate-400]="idx === 1" [class.to-slate-500]="idx === 1"
                          [class.from-emerald-500]="idx > 1" [class.to-teal-500]="idx > 1"
                          [class.bg-gradient-to-br]="true">
                        {{ member.name.charAt(0) }}
                     </div>
                     <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-slate-700">
                        {{ idx + 1 }}
                     </div>
                  </div>
                  <div class="flex-1">
                     <div class="text-white font-semibold text-sm flex items-center gap-2">
                        {{ member.name }}
                        @if(member.isUser) { <span class="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded uppercase">You</span> }
                     </div>
                     <div class="text-xs text-slate-400">{{ member.title }}</div>
                  </div>
                  <div class="text-right">
                     <div class="text-sm font-bold text-white">{{ member.points | number }}</div>
                     <div class="text-[9px] text-slate-500 uppercase">XP</div>
                  </div>
               </div>
            }
         </div>
      </div>

      <!-- About Section -->
      <div class="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-3xl p-6 relative overflow-hidden group mb-6">
         <!-- Background Glow -->
         <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
         
         <div class="relative z-10">
            <div class="flex items-center gap-3 mb-4">
               <div class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl shadow-inner border border-slate-700">
                  🌿
               </div>
               <div>
                  <h2 class="text-lg font-bold text-white">About EcoSnap</h2>
                  <p class="text-[10px] text-slate-400 font-mono uppercase tracking-widest">System Info</p>
               </div>
            </div>
            
            <p class="text-slate-300 text-sm leading-relaxed mb-6 font-light min-h-[4rem]">
               {{ displayedAbout() }}<span class="animate-pulse text-emerald-400">|</span>
            </p>

            <div class="grid grid-cols-2 gap-3 mb-4">
               <div class="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
                  <div class="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Version</div>
                  <div class="text-white font-mono text-sm">2.5.0 (Alpha)</div>
               </div>
               <div class="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
                  <div class="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">AI Model</div>
                  <div class="text-indigo-400 font-mono text-sm font-bold">Gemini 2.5</div>
               </div>
            </div>
         </div>
      </div>

      <!-- Developer Section -->
      <div class="bg-slate-800/30 border border-slate-700/30 rounded-3xl p-6 relative overflow-hidden">
         <div class="flex items-start justify-between mb-4">
            <div>
               <h2 class="text-lg font-bold text-white">About the Developer</h2>
               <p class="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">Solo Project</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-xl overflow-hidden border border-slate-600">
               👨‍💻
            </div>
         </div>
         
         <p class="text-slate-300 text-sm leading-relaxed mb-4 font-light">
            Passionate about technology and innovation, I am <strong class="text-white">Omkar Kore</strong>—a B.Tech student specializing in Electronics and Communication Engineering at DKTE’s Textile and Engineering Institute in Ichalkaranji, Maharashtra.
         </p>
         
         <a href="https://www.linkedin.com/in/omkar-kore-313a0229a/" target="_blank" class="flex items-center justify-center gap-2 w-full py-3 bg-[#0077b5] hover:bg-[#006396] text-white rounded-xl font-bold text-sm transition-colors shadow-lg active:scale-95 group">
            <svg class="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            Connect on LinkedIn
         </a>
      </div>

    </div>
  `,
  styles: []
})
export class TeamViewComponent implements AfterViewInit, OnDestroy {
  game = inject(GameService);
  displayedAbout = signal('');
  
  private timeouts: any[] = [];
  private readonly aboutText = "EcoSnap turns urban exploration into a planetary rescue mission. Powered by Google Gemini AI to analyze, track, and heal your sector.";

  // Only real data from game service
  leaderboard = computed(() => {
    return this.game.getLeaderboard().sort((a, b) => b.points - a.points);
  });
  
  ngAfterViewInit() {
    this.typewrite(this.aboutText, this.displayedAbout, 20);
  }
  
  ngOnDestroy() {
    this.timeouts.forEach(clearTimeout);
  }

  private typewrite(text: string, signalSetter: WritableSignal<string>, delay: number) {
     if (!text) return;
     const words = text.split(' ');
     let i = 0;
     const animate = () => {
        if (i < words.length) {
           const chunk = (i > 0 ? ' ' : '') + words[i];
           signalSetter.update(s => s + chunk);
           i++;
           this.timeouts.push(setTimeout(animate, delay));
        }
     };
     animate();
  }
}