import { Component, inject, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { GameService, ScanRecord, Zone, LeaderboardEntry } from '../services/game.service';
import { ActivityType } from '../services/gemini.service';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto pb-24 bg-slate-950">
      <!-- Header Stats -->
      <div class="p-6 bg-gradient-to-b from-emerald-900/40 to-slate-950 border-b border-emerald-900/30">
        <div class="flex justify-between items-start mb-6">
          <div>
            <!-- Editable Username -->
            @if (isEditingName()) {
               <div class="flex items-center gap-2 mb-1">
                 <input #nameInput 
                        type="text" 
                        [value]="game.username()" 
                        (keyup.enter)="saveName(nameInput.value)" 
                        (blur)="saveName(nameInput.value)"
                        class="bg-slate-800 text-white text-xl font-bold rounded px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-700"
                        autofocus>
                 <button (click)="saveName(nameInput.value)" class="text-emerald-400 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                 </button>
               </div>
            } @else {
               <h1 (click)="startEditingName()" class="text-2xl font-bold text-white flex items-center gap-2 cursor-pointer group hover:text-emerald-300 transition-colors">
                  Hello, {{ game.username() }}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
               </h1>
            }

            <!-- Accurate Location Display -->
            <div class="mt-2">
              <p class="text-emerald-400 text-xs flex items-center gap-1 font-bold mb-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ game.currentAddress() }}
              </p>
              
              <!-- Location Fallback Warning -->
              @if (game.isFallbackLocation()) {
                 <p class="text-[10px] text-amber-500 font-mono mt-1 border border-amber-500/30 bg-amber-900/20 px-2 py-0.5 rounded w-fit flex items-center gap-1">
                    ⚠️ Using Estimated Location
                 </p>
              }

              @if(game.currentZone(); as zone) {
                <p class="text-slate-400 text-[10px] pl-4 mt-0.5">
                  {{ zone.name }} • Health: 
                  <span [class.text-red-400]="zone.health < 30" 
                        [class.text-yellow-400]="zone.health >= 30 && zone.health < 70"
                        [class.text-emerald-400]="zone.health >= 70">
                    {{ zone.health }}%
                  </span>
                </p>
              } @else {
                 <p class="text-slate-500 text-[10px] pl-4 italic">No zone data at current location.</p>
              }
            </div>
          </div>
          <div class="text-right">
             <div class="text-3xl font-black text-white">{{ game.totalPoints() }}</div>
             <div class="text-xs text-slate-400 uppercase tracking-wider">Impact Points</div>
          </div>
        </div>

        <!-- Narrative Impact Card (AI Generated Summary) -->
        <div class="mb-6 bg-gradient-to-r from-slate-900 to-indigo-950/50 p-4 rounded-xl border border-indigo-500/30 shadow-lg relative overflow-hidden group">
           <div class="absolute -right-4 -top-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">📝</div>
           <h3 class="text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2">My Impact Story</h3>
           <p class="text-slate-200 text-sm leading-relaxed italic">
             "{{ game.weeklyImpactStory() }}"
           </p>
           <div class="mt-3 flex gap-4 text-xs font-mono text-slate-400">
              <span class="flex items-center gap-1"><span class="text-emerald-400">🔥</span> {{ game.streakDays() }} Day Streak</span>
              <span class="flex items-center gap-1"><span class="text-blue-400">⚖️</span> {{ (game.totalWasteWeight() / 1000) | number:'1.1-1' }}kg Saved</span>
           </div>
        </div>

        <!-- Activity Mode Selector -->
        <div class="mb-6 bg-slate-900/80 p-1 rounded-xl flex border border-slate-800 relative overflow-hidden">
          <div class="absolute inset-y-1 bg-emerald-600 rounded-lg transition-all duration-300 ease-out shadow-lg"
               [style.left.%]="getActivityOffset()"
               style="width: 33.33%"></div>
          
          <button (click)="setActivity('Walking')" class="flex-1 relative z-10 py-2 text-center text-xs font-bold tracking-wider transition-colors"
                  [class.text-white]="game.currentActivity() === 'Walking'"
                  [class.text-slate-500]="game.currentActivity() !== 'Walking'">
            Walking
          </button>
          <button (click)="setActivity('Running')" class="flex-1 relative z-10 py-2 text-center text-xs font-bold tracking-wider transition-colors"
                  [class.text-white]="game.currentActivity() === 'Running'"
                  [class.text-slate-500]="game.currentActivity() !== 'Running'">
            Running
          </button>
          <button (click)="setActivity('Cycling')" class="flex-1 relative z-10 py-2 text-center text-xs font-bold tracking-wider transition-colors"
                  [class.text-white]="game.currentActivity() === 'Cycling'"
                  [class.text-slate-500]="game.currentActivity() !== 'Cycling'">
            Cycling
          </button>
        </div>

        <!-- Level Progress -->
        <div class="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm border border-slate-700">
           <div class="flex justify-between text-sm mb-2">
             <span class="text-white font-medium">Level {{ game.level() }}</span>
             <span class="text-emerald-300">{{ game.nextLevelProgress() | number:'1.0-0' }}%</span>
           </div>
           <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
             <div class="h-full bg-emerald-500 transition-all duration-500" [style.width.%]="game.nextLevelProgress()"></div>
           </div>
        </div>
      </div>

      <!-- Zone Health Viz -->
      <div class="p-6">
        <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Community Health Map
        </h2>
        
        @if (game.zones().length === 0) {
           <div class="bg-slate-900 rounded-xl p-8 border border-slate-800 border-dashed text-center">
              <p class="text-slate-400 text-sm">No zones discovered yet.</p>
              <p class="text-slate-500 text-xs mt-1">Start scanning with GPS enabled to map your neighborhood.</p>
           </div>
        } @else {
           <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-xl overflow-hidden relative h-56">
             <div #chartContainer class="w-full h-full"></div>
             <div class="absolute bottom-4 right-4 text-xs text-slate-500 bg-black/50 px-2 py-1 rounded">
                Real-time Data
             </div>
           </div>
        }
      </div>

      <!-- Recent Activity -->
      <div class="px-6">
        <h2 class="text-lg font-bold text-white mb-4">Recent Contributions</h2>
        @if (game.scanHistory().length === 0) {
          <div class="text-center py-8 text-slate-500 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
            <p>No scans yet. Select your activity and go hunt!</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (scan of game.scanHistory(); track scan.id) {
              <!-- Clickable History Item -->
              <div (click)="viewScan.emit(scan)" class="bg-slate-900 rounded-lg p-3 flex items-center gap-4 border border-slate-800 cursor-pointer hover:bg-slate-800 hover:border-slate-700 transition-all active:scale-[0.98]">
                <img [src]="scan.imageThumbnail" class="w-12 h-12 rounded bg-slate-800 object-cover" alt="Waste">
                <div class="flex-1">
                  <div class="text-white font-medium">{{ scan.wasteType }}</div>
                  <div class="flex items-center gap-2 text-xs">
                    <span class="text-slate-400">{{ scan.timestamp | date:'shortTime' }}</span>
                    <!-- Mode Badge -->
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                          [class.bg-emerald-900_30]="scan.claimType === 'cleanup'"
                          [class.text-emerald-400]="scan.claimType === 'cleanup'"
                          [class.border-emerald-500_30]="scan.claimType === 'cleanup'"
                          [class.bg-slate-800]="scan.claimType === 'scout'"
                          [class.text-slate-400]="scan.claimType === 'scout'"
                          [class.border-slate-700]="scan.claimType === 'scout'">
                      {{ scan.claimType }}
                    </span>
                    @if(scan.upcyclingRecipe && !scan.upcycleBonusClaimed) {
                       <span class="text-indigo-400 font-bold animate-pulse">● DIY</span>
                    }
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-emerald-400 font-bold">+{{ scan.points }}</div>
                  @if(scan.upcycleBonusClaimed) {
                     <div class="text-[10px] text-indigo-400">DIY Done</div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
      
      <!-- Leaderboard (Local only) -->
      <div class="p-6">
         <h2 class="text-lg font-bold text-white mb-4">Your Rank</h2>
         <div class="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            @for (user of game.getLeaderboard(); track user.name) {
               <div class="flex items-center justify-between p-4 border-b border-slate-800 last:border-0" 
                    [class.bg-emerald-900_10]="user.isUser">
                 <div class="flex items-center gap-3">
                   <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-yellow-500 text-black">
                     {{ user.rank }}
                   </div>
                   <div>
                     <span class="text-white block leading-none font-bold">
                       {{ user.name }}
                       @if(user.isUser) { <span class="text-emerald-400 text-[10px] ml-1">(You)</span> }
                     </span>
                     <span class="text-[10px] text-slate-500">{{ user.ward }}</span>
                   </div>
                 </div>
                 <span class="text-slate-400 font-mono text-sm">{{ user.points }}</span>
               </div>
            }
         </div>
      </div>
    </div>
  `
})
export class DashboardViewComponent implements AfterViewInit, OnDestroy {
  game = inject(GameService);
  viewScan = output<ScanRecord>();
  
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;
  
  isEditingName = signal(false);

  private resizeListener: any;

  constructor() {
    effect(() => {
      const zones = this.game.zones();
      // Ensure element is ready
      setTimeout(() => {
         this.renderChart(zones);
      }, 0);
    });
  }

  ngAfterViewInit() {
    this.renderChart(this.game.zones());
    this.resizeListener = () => this.renderChart(this.game.zones());
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  startEditingName() {
    this.isEditingName.set(true);
  }

  saveName(newName: string) {
    this.game.updateUsername(newName);
    this.isEditingName.set(false);
  }

  setActivity(type: ActivityType) {
    this.game.setActivity(type);
  }

  getActivityOffset(): number {
    switch (this.game.currentActivity()) {
      case 'Running': return 33.33;
      case 'Cycling': return 66.66;
      default: return 0;
    }
  }

  private renderChart(zones: Zone[]) {
    if (!this.chartContainer?.nativeElement) return;
    const el = this.chartContainer.nativeElement;
    
    // Clear
    d3.select(el).selectAll('*').remove();
    
    const width = el.clientWidth;
    const height = el.clientHeight;
    
    if (width === 0 || height === 0 || zones.length === 0) return;

    const svg = d3.select(el)
       .append('svg')
       .attr('width', width)
       .attr('height', height);

    // Dynamic Chart Logic: Render as a list of bars since the count is variable
    const x = d3.scaleBand()
       .range([0, width])
       .padding(0.2)
       .domain(zones.map(z => z.id)); // Use ID for uniqueness

    const y = d3.scaleLinear()
       .range([height, 0])
       .domain([0, 100]);

    svg.selectAll('.bar')
       .data(zones)
       .enter()
       .append('rect')
       .attr('x', d => x(d.id)!)
       .attr('y', d => y(d.health))
       .attr('width', x.bandwidth())
       .attr('height', d => height - y(d.health))
       .attr('rx', 2)
       .attr('fill', d => {
          if (d.health < 30) return '#f87171'; // Red-400
          if (d.health < 70) return '#facc15'; // Yellow-400
          return '#10b981'; // Emerald-500
       });
       
    // Labels if there are few bars
    if (zones.length < 10) {
      svg.selectAll('.label')
        .data(zones)
        .enter()
        .append('text')
        .attr('x', d => x(d.id)! + x.bandwidth() / 2)
        .attr('y', d => y(d.health) - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px')
        .text(d => d.name.substring(0, 8));
    }
  }
}