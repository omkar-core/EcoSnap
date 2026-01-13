import { Component, inject, AfterViewInit, OnDestroy, effect, output, signal, ChangeDetectionStrategy, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, ScanRecord } from '../services/game.service';
import { GeminiService } from '../services/gemini.service';
import { AppComponent } from '../app.component'; 

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto pb-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 font-inter">
      
      <!-- Header -->
      <div class="px-6 pt-8 pb-6 bg-gradient-to-b from-slate-900 to-transparent">
        <div class="flex items-center justify-between mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              @if (isEditingName()) {
                 <input #nameInput type="text" [value]="game.username()" (blur)="saveName(nameInput.value)" (keyup.enter)="saveName(nameInput.value)" class="bg-slate-800 text-white text-2xl font-bold rounded px-2 py-0.5 outline-none focus:ring-2 focus:ring-emerald-500 w-48" autofocus>
              } @else {
                 <h1 (click)="startEditingName()" class="text-2xl font-bold text-white cursor-pointer hover:text-emerald-400 transition-colors">Hi, {{ game.username() }}</h1>
              }
              <button (click)="startEditingName()" class="p-1 hover:bg-slate-700/50 rounded-lg transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div class="flex items-center gap-2 text-sm text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" 
                    [class.text-emerald-400]="!game.isFallbackLocation()" 
                    [class.text-amber-500]="game.isFallbackLocation()" 
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
               </svg>
               <span>{{ game.currentAddress() }} @if(game.isFallbackLocation()){ <span class="text-amber-500 text-xs uppercase font-bold tracking-wider ml-1">(Default)</span> }</span>
            </div>
          </div>
          <button class="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors relative">
             <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
             <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        <!-- Stats Cards (Glassmorphic) -->
        <div class="grid grid-cols-3 gap-3 mb-6">
          <div class="relative group overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/10 hover:border-emerald-500/30">
             <div class="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div class="relative z-10">
                <div class="w-6 h-6 text-emerald-400 mb-2">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                </div>
                <div class="text-2xl font-bold text-white mb-1">{{ game.greenCredits() }}</div>
                <div class="text-xs text-emerald-300 uppercase tracking-wider font-bold">Credits</div>
             </div>
          </div>
          <div class="relative group overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/10 hover:border-blue-500/30">
             <div class="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div class="relative z-10">
                <div class="w-6 h-6 text-blue-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                </div>
                <div class="text-2xl font-bold text-white mb-1">{{ game.totalPoints() }}</div>
                <div class="text-xs text-blue-300 uppercase tracking-wider font-bold">XP</div>
             </div>
          </div>
          <div class="relative group overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/10 hover:border-amber-500/30">
             <div class="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div class="relative z-10">
                <div class="w-6 h-6 text-amber-400 mb-2">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                </div>
                <div class="text-2xl font-bold text-white mb-1">{{ game.streakDays() }}</div>
                <div class="text-xs text-amber-300 uppercase tracking-wider font-bold">Streak</div>
             </div>
          </div>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="px-6 space-y-6">
        
        <!-- SCENARIO 1: Location Permission Request (Progressive Disclosure) -->
        @if (game.isFallbackLocation()) {
          <div class="bg-indigo-900/40 border border-indigo-500/30 rounded-2xl p-5 flex items-start gap-4 animate-fade-in">
             <div class="text-2xl pt-1">📍</div>
             <div class="flex-1">
                <h3 class="text-white font-bold text-sm mb-1">Enable Local Intel?</h3>
                <p class="text-indigo-200 text-xs mb-4 leading-relaxed">
                  We are currently using a default sector. To analyze waste patterns in your actual neighborhood, please enable location access.
                </p>
                <div class="flex gap-3">
                   <button (click)="game.requestLocationAccess()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-900/40">
                      Enable Location
                   </button>
                </div>
             </div>
          </div>
        }

        <!-- Current Status -->
        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">Current Status</h3>
            @if (game.currentZone(); as zone) {
               <span class="px-3 py-1 text-xs font-medium rounded-full uppercase tracking-wider"
                  [class.bg-emerald-500_20]="zone.status === 'Pristine' || zone.status === 'Clean'"
                  [class.text-emerald-300]="zone.status === 'Pristine' || zone.status === 'Clean'"
                  [class.bg-amber-500_20]="zone.status === 'Moderate'"
                  [class.text-amber-300]="zone.status === 'Moderate'"
                  [class.bg-red-500_20]="zone.status === 'Dirty' || zone.status === 'Critical'"
                  [class.text-red-300]="zone.status === 'Dirty' || zone.status === 'Critical'">
                  {{ zone.status }} ({{ zone.health }}%)
               </span>
            } @else {
               <span class="px-3 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded-full uppercase tracking-wider">Unknown</span>
            }
          </div>
          <p class="text-slate-300 text-sm mb-5 leading-relaxed min-h-[3rem]">
            {{ displayedStatus() }}<span class="animate-pulse text-emerald-400">|</span>
          </p>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
              <div class="flex items-center gap-2 mb-2">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                <span class="text-xs text-slate-400 uppercase tracking-wider">Planted</span>
              </div>
              <div class="text-xl font-bold text-white">{{ game.trees().length }} Trees</div>
            </div>
            <div class="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
              <div class="flex items-center gap-2 mb-2">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                <span class="text-xs text-slate-400 uppercase tracking-wider">Offset</span>
              </div>
              <div class="text-xl font-bold text-white">{{ game.totalCo2Offset() | number:'1.1-1' }}kg CO₂</div>
            </div>
          </div>
        </div>

        <!-- Rank Progress -->
        <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 shadow-xl">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider">Current Rank</h3>
            <span class="text-emerald-400 font-medium">{{ game.nextRankProgress() | number:'1.0-0' }}%</span>
          </div>
          <div class="mb-3">
            <div class="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text mb-2">
              {{ game.userRank() }}
            </div>
            <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                [style.width.%]="game.nextRankProgress()"
              ></div>
            </div>
          </div>
          <p class="text-xs text-slate-400">Keep scanning and planting to level up.</p>
        </div>

        <!-- Quick Actions (MORPHING BUTTONS) -->
        <div>
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-3">Quick Actions</h3>
          <div class="grid grid-cols-2 gap-3">
            
            <!-- Scan Button (Morphing) -->
            <button (click)="app.navTo('camera')" class="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-95 group shadow-lg shadow-emerald-900/40 btn-particle">
              <!-- Background Pattern -->
              <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <div class="relative z-10">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white mb-3 group-hover:scale-110 transition-transform drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                 <div class="text-white font-black text-lg">New Scan</div>
                 <div class="text-emerald-100 text-xs font-medium opacity-80">Document area</div>
              </div>
            </button>
            
            <!-- Plant Button (Morphing) -->
            <button (click)="goToPlanting()" class="relative overflow-hidden bg-slate-800 border border-slate-700 rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-95 group hover:border-emerald-500/50 shadow-lg btn-particle">
              <!-- Background Pattern -->
              <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 blur-xl group-hover:bg-emerald-500/20 transition-colors duration-500"></div>

              <div class="relative z-10">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                 <div class="text-white font-black text-lg">Plant Trees</div>
                 <div class="text-slate-400 text-xs font-medium">Offset carbon</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div>
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-3">Recent Activity</h3>
          <div class="space-y-3">
             @if (game.scanHistory().length === 0) {
                <div class="text-center py-6 border border-dashed border-slate-700 rounded-xl bg-slate-900/30">
                   <p class="text-slate-500 text-xs">No activity yet. Start your journey!</p>
                </div>
             } @else {
                @for (scan of game.scanHistory().slice(0, 5); track scan.id) {
                   <div (click)="viewScan.emit(scan)" class="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors">
                      <div class="flex items-center gap-3">
                         <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br"
                              [class.from-emerald-500]="scan.claimType === 'cleanup'"
                              [class.to-teal-500]="scan.claimType === 'cleanup'"
                              [class.from-blue-500]="scan.claimType === 'scout'"
                              [class.to-cyan-500]="scan.claimType === 'scout'">
                            @if (scan.claimType === 'cleanup') {
                               <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            } @else {
                               <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            }
                         </div>
                         <div>
                            <div class="text-white font-medium text-sm">{{ scan.wasteType }}</div>
                            <div class="text-slate-400 text-xs">{{ scan.timestamp | date:'shortTime' }} • +{{ scan.points }} XP</div>
                         </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                   </div>
                }
             }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fade-in 0.3s ease-out; }
  `]
})
export class DashboardViewComponent implements AfterViewInit, OnDestroy {
  game = inject(GameService);
  gemini = inject(GeminiService);
  app = inject(AppComponent);
  viewScan = output<ScanRecord>();
  
  isEditingName = signal(false);
  displayedStatus = signal('');
  
  private timeouts: any[] = [];

  constructor() {
    effect(() => {
      const text = this.game.weeklyImpactStory();
      this.resetTypewriter();
      this.typewrite(text, this.displayedStatus, 30);
    });
  }
  
  ngAfterViewInit() {
    // Initial trigger handled by effect
  }
  
  ngOnDestroy() {
    this.timeouts.forEach(clearTimeout);
  }

  private resetTypewriter() {
    this.displayedStatus.set('');
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
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

  startEditingName() { this.isEditingName.set(true); }
  saveName(name: string) { 
     this.game.updateUsername(name);
     this.isEditingName.set(false);
  }

  goToPlanting() {
     this.app.navTo('community');
  }
}