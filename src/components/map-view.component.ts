import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Zone, Tree, PlantationMode } from '../services/game.service';

@Component({
  selector: 'app-community-view',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full w-full bg-slate-950 overflow-y-auto pb-24 font-inter relative">
        <!-- Background -->
        <div class="absolute inset-0 pointer-events-none opacity-20"
             style="background-image: radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%);">
        </div>

        <div class="relative z-10 p-6 space-y-6 pt-10 min-h-full flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between shrink-0">
                <div>
                    <h1 class="text-2xl font-bold text-white">Eco-Sector</h1>
                    <p class="text-slate-400 text-sm">Restoration & Growth</p>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                    <span class="text-2xl">🌱</span>
                </div>
            </div>

            <!-- Tab Switcher -->
            <div class="flex p-1 bg-slate-900/80 rounded-xl border border-slate-700 shrink-0">
                <button (click)="activeTab.set('zones')" 
                   class="flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                   [class.bg-emerald-600]="activeTab() === 'zones'"
                   [class.text-white]="activeTab() === 'zones'"
                   [class.text-slate-400]="activeTab() !== 'zones'"
                   [class.hover:bg-slate-800]="activeTab() !== 'zones'">
                   Sector Map
                </button>
                <button (click)="activeTab.set('forest')" 
                   class="flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                   [class.bg-emerald-600]="activeTab() === 'forest'"
                   [class.text-white]="activeTab() === 'forest'"
                   [class.text-slate-400]="activeTab() !== 'forest'"
                   [class.hover:bg-slate-800]="activeTab() !== 'forest'">
                   My Forest
                </button>
            </div>

            <!-- ZONES TAB -->
            @if (activeTab() === 'zones') {
              <div class="space-y-6 animate-fade-in">
                  <!-- Overall Health Card -->
                  <div class="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                      <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                      
                      <div class="flex items-center justify-between mb-2">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-xs">Vitality</span>
                          <span class="text-emerald-400 font-bold">{{ game.neighborhoodHealth() }}%</span>
                      </div>
                      
                      <div class="h-4 bg-slate-800 rounded-full overflow-hidden mb-4 border border-slate-700">
                          <div class="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500 transition-all duration-1000"
                              [style.width.%]="game.neighborhoodHealth()"></div>
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4">
                          <div class="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50 flex items-center gap-3">
                              <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl">🌲</div>
                              <div>
                                  <div class="text-white font-bold">{{ game.trees().length }}</div>
                                  <div class="text-[10px] text-slate-500 uppercase font-bold">Trees</div>
                              </div>
                          </div>
                          <div class="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50 flex items-center gap-3">
                              <div class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-xl">⚡</div>
                              <div>
                                  <div class="text-white font-bold">{{ game.greenCredits() }}</div>
                                  <div class="text-[10px] text-slate-500 uppercase font-bold">Credits</div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <!-- Zones List -->
                  <div>
                      <h2 class="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          Active Zones
                          <span class="text-xs font-normal text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">{{ game.zones().length }} Detected</span>
                      </h2>
                      <div class="space-y-3">
                          @for (zone of game.zones(); track zone.id) {
                              <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:border-slate-700 transition-colors relative overflow-hidden group">
                                  
                                  <!-- Status Indicator Line -->
                                  <div class="absolute left-0 top-0 bottom-0 w-1"
                                      [class.bg-emerald-500]="zone.health >= 60"
                                      [class.bg-yellow-500]="zone.health >= 30 && zone.health < 60"
                                      [class.bg-red-500]="zone.health < 30"></div>

                                  <!-- Health Ring -->
                                  <div class="relative w-12 h-12 flex items-center justify-center shrink-0">
                                      <svg class="w-full h-full transform -rotate-90">
                                          <circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="3" fill="transparent" class="text-slate-800" />
                                          <circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="3" fill="transparent"
                                                  [attr.stroke-dasharray]="113"
                                                  [attr.stroke-dashoffset]="113 - (113 * zone.health) / 100"
                                                  [class.text-emerald-500]="zone.health >= 60"
                                                  [class.text-yellow-500]="zone.health >= 30 && zone.health < 60"
                                                  [class.text-red-500]="zone.health < 30"
                                                  class="transition-all duration-1000" />
                                      </svg>
                                      <span class="absolute text-[10px] font-bold text-white">{{ zone.health }}</span>
                                  </div>

                                  <div class="flex-1 min-w-0">
                                      <div class="flex items-center justify-between mb-1">
                                          <h3 class="text-white font-bold text-sm truncate pr-2">{{ zone.name }}</h3>
                                          <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0"
                                                [class.bg-emerald-500_20]="zone.status === 'Pristine' || zone.status === 'Clean'"
                                                [class.text-emerald-300]="zone.status === 'Pristine' || zone.status === 'Clean'"
                                                [class.bg-amber-500_20]="zone.status === 'Moderate'"
                                                [class.text-amber-300]="zone.status === 'Moderate'"
                                                [class.bg-red-500_20]="zone.status === 'Dirty' || zone.status === 'Critical'"
                                                [class.text-red-300]="zone.status === 'Dirty' || zone.status === 'Critical'">
                                              {{ zone.status }}
                                          </span>
                                      </div>
                                      <div class="flex items-center gap-3 text-xs text-slate-400">
                                          <span class="flex items-center gap-1">
                                              <span class="text-emerald-500">🌲</span> {{ zone.greenLayer.treeCount }}/5
                                          </span>
                                          @if(zone.gamification.ownerName) {
                                              <span class="flex items-center gap-1 text-indigo-400 truncate max-w-[80px]">
                                                  👑 {{ zone.gamification.ownerName }}
                                              </span>
                                          }
                                      </div>
                                  </div>

                                  <!-- Quick Plant Action -->
                                  @if (zone.status === 'Clean' || zone.status === 'Pristine') {
                                      @if (zone.greenLayer.plantableSpots > 0) {
                                        <button (click)="openPlanting(zone)" 
                                                class="w-10 h-10 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-500 flex items-center justify-center transition-all active:scale-95 border border-slate-700 hover:border-emerald-500 shadow-lg"
                                                title="Plant Tree">
                                            <span class="text-xl">🌱</span>
                                        </button>
                                      } @else {
                                        <div class="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center opacity-50 cursor-not-allowed">
                                            <span class="text-sm">🌳</span>
                                        </div>
                                      }
                                  }
                              </div>
                          }
                      </div>
                  </div>
              </div>
            }

            <!-- MY FOREST TAB -->
            @if (activeTab() === 'forest') {
                <div class="space-y-4 animate-fade-in">
                    
                    @if (myTrees().length === 0) {
                        <div class="flex flex-col items-center justify-center py-12 text-center space-y-4 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                            <div class="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-4xl shadow-inner">🍂</div>
                            <div>
                                <h3 class="text-white font-bold text-lg">No Trees Planted</h3>
                                <p class="text-slate-400 text-sm max-w-xs mx-auto mt-1">Clean up zones to unlock planting spots and start your urban forest.</p>
                            </div>
                            <button (click)="activeTab.set('zones')" class="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors">
                                Find Plantable Zones
                            </button>
                        </div>
                    } @else {
                        <div class="grid grid-cols-2 gap-3 mb-2">
                             <div class="bg-slate-800 rounded-xl p-3 border border-slate-700">
                                <div class="text-xs text-slate-400 uppercase font-bold">Total Offset</div>
                                <div class="text-lg font-bold text-white">{{ totalOffset() | number:'1.2-2' }} kg</div>
                             </div>
                             <div class="bg-slate-800 rounded-xl p-3 border border-slate-700">
                                <div class="text-xs text-slate-400 uppercase font-bold">Canopy Count</div>
                                <div class="text-lg font-bold text-white">{{ myTrees().length }}</div>
                             </div>
                        </div>

                        <div class="space-y-3">
                            @for (tree of myTrees(); track tree.id) {
                                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
                                    <div class="flex items-start justify-between mb-3">
                                        <div class="flex items-center gap-3">
                                            <div class="w-12 h-12 bg-emerald-900/30 rounded-xl flex items-center justify-center text-2xl border border-emerald-500/20">
                                                @if(tree.stage === 'Seedling') { 🌱 }
                                                @else if(tree.stage === 'Growing') { 🌿 }
                                                @else { 🌳 }
                                            </div>
                                            <div>
                                                <div class="text-white font-bold">{{ tree.species }}</div>
                                                <div class="text-xs text-emerald-400 font-medium">{{ tree.stage }} • Age: {{ getDaysOld(tree) }}d</div>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-xs text-slate-500 uppercase font-bold mb-1">Health</div>
                                            <div class="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-auto">
                                                <div class="h-full bg-emerald-500" [style.width.%]="tree.health"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex items-center justify-between pt-3 border-t border-slate-800">
                                        <div class="text-xs text-slate-400">
                                            Offset: <span class="text-white font-bold">{{ tree.co2Offset | number:'1.3-3' }}kg</span>
                                        </div>
                                        
                                        @if (canWater(tree)) {
                                            <button (click)="water(tree.id)" class="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/20">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                                                Water
                                            </button>
                                        } @else {
                                            <span class="flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-800 px-2 py-1 rounded-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                                                Watered
                                            </span>
                                        }
                                    </div>
                                </div>
                            }
                        </div>
                    }
                </div>
            }
        </div>
    </div>

    <!-- PLANTING MODAL -->
    @if (isPlantingOpen() && targetZone()) {
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div class="bg-slate-900 w-full sm:w-[450px] rounded-t-3xl sm:rounded-3xl border border-slate-700 shadow-2xl overflow-hidden animate-slide-up">
                
                <!-- Modal Header -->
                <div class="p-6 pb-4 bg-slate-800/50 border-b border-slate-700">
                    <div class="flex items-center justify-between mb-1">
                        <h2 class="text-xl font-bold text-white">Reforestation Protocol</h2>
                        <button (click)="closePlanting()" class="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <p class="text-emerald-400 text-sm font-medium">Zone: {{ targetZone()?.name }}</p>
                </div>

                <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    
                    <!-- Step 1: Species -->
                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">1. Select Species</label>
                        <div class="grid grid-cols-2 gap-3">
                            @for (species of speciesOptions; track species) {
                                <button (click)="selectedSpecies.set(species)" 
                                        class="p-3 rounded-xl border text-left transition-all relative overflow-hidden group"
                                        [class.bg-emerald-600_20]="selectedSpecies() === species"
                                        [class.border-emerald-500]="selectedSpecies() === species"
                                        [class.bg-slate-800]="selectedSpecies() !== species"
                                        [class.border-slate-700]="selectedSpecies() !== species">
                                    <div class="text-2xl mb-1">🌳</div>
                                    <div class="font-bold text-sm text-white">{{ species }}</div>
                                    <div class="text-[10px] text-slate-400">Rate: {{ game.SPECIES_RATES[species] }}kg/yr</div>
                                    
                                    @if(selectedSpecies() === species) {
                                        <div class="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-black font-bold">✓</div>
                                    }
                                </button>
                            }
                        </div>
                    </div>

                    <!-- Step 2: Mode -->
                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">2. Plantation Mode</label>
                        <div class="space-y-3">
                            <!-- Solo -->
                            <button (click)="selectedMode.set('self')" 
                                    class="w-full flex items-center justify-between p-4 rounded-xl border transition-all"
                                    [class.bg-emerald-600_20]="selectedMode() === 'self'"
                                    [class.border-emerald-500]="selectedMode() === 'self'"
                                    [class.bg-slate-800]="selectedMode() !== 'self'"
                                    [class.border-slate-700]="selectedMode() !== 'self'">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl">👤</div>
                                    <div class="text-left">
                                        <div class="font-bold text-white text-sm">Solo Mission</div>
                                        <div class="text-[10px] text-slate-400">You own it. Max Reward.</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-emerald-400 font-bold text-sm">50 Credits</div>
                                    <div class="text-[10px] text-slate-400">+500 XP</div>
                                </div>
                            </button>

                            <!-- Community -->
                            <button (click)="selectedMode.set('community')" 
                                    class="w-full flex items-center justify-between p-4 rounded-xl border transition-all"
                                    [class.bg-emerald-600_20]="selectedMode() === 'community'"
                                    [class.border-emerald-500]="selectedMode() === 'community'"
                                    [class.bg-slate-800]="selectedMode() !== 'community'"
                                    [class.border-slate-700]="selectedMode() !== 'community'">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">🤝</div>
                                    <div class="text-left">
                                        <div class="font-bold text-white text-sm">Community Drive</div>
                                        <div class="text-[10px] text-slate-400">Shared ownership.</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-emerald-400 font-bold text-sm">30 Credits</div>
                                    <div class="text-[10px] text-slate-400">+200 XP</div>
                                </div>
                            </button>
                            
                            <!-- Sponsored -->
                             <button (click)="selectedMode.set('sponsored')" 
                                    class="w-full flex items-center justify-between p-4 rounded-xl border transition-all"
                                    [class.bg-emerald-600_20]="selectedMode() === 'sponsored'"
                                    [class.border-emerald-500]="selectedMode() === 'sponsored'"
                                    [class.bg-slate-800]="selectedMode() !== 'sponsored'"
                                    [class.border-slate-700]="selectedMode() !== 'sponsored'">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-xl">🏢</div>
                                    <div class="text-left">
                                        <div class="font-bold text-white text-sm">Corporate Sponsor</div>
                                        <div class="text-[10px] text-slate-400">Free planting.</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-emerald-400 font-bold text-sm">0 Credits</div>
                                    <div class="text-[10px] text-slate-400">+300 XP</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="p-6 bg-slate-800 border-t border-slate-700 safe-area-bottom">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-slate-400 text-xs font-bold uppercase">Available Credits</span>
                        <span class="text-white font-bold">{{ game.greenCredits() }} Cr</span>
                    </div>
                    
                    @if (game.greenCredits() < getCost(selectedMode())) {
                        <button disabled class="w-full py-4 bg-slate-700 text-slate-400 rounded-xl font-bold opacity-50 cursor-not-allowed">
                            Insufficient Credits (Need {{ getCost(selectedMode()) }})
                        </button>
                    } @else {
                        <button (click)="confirmPlanting()" class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/40 transition-transform active:scale-95 btn-shockwave">
                            Confirm Plantation (-{{ getCost(selectedMode()) }} Cr)
                        </button>
                    }
                </div>
            </div>
        </div>
    }
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fade-in 0.2s ease-out; }
    
    @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }

    .safe-area-bottom { padding-bottom: max(1.5rem, env(safe-area-inset-bottom)); }
  `]
})
export class CommunityViewComponent {
  game = inject(GameService);

  activeTab = signal<'zones' | 'forest'>('zones');
  
  // Planting Modal State
  isPlantingOpen = signal(false);
  targetZone = signal<Zone | null>(null);
  selectedSpecies = signal<string>('Neem');
  selectedMode = signal<PlantationMode>('self');
  
  speciesOptions = Object.keys(this.game.SPECIES_RATES);
  
  // Computed Trees
  myTrees = computed(() => {
     return this.game.trees()
        .filter(t => t.ownerName === this.game.username())
        .sort((a,b) => b.plantedAt.getTime() - a.plantedAt.getTime());
  });

  totalOffset = computed(() => {
    return this.myTrees().reduce((acc, t) => acc + t.co2Offset, 0);
  });

  openPlanting(zone: Zone) {
    this.targetZone.set(zone);
    this.selectedSpecies.set('Neem');
    this.selectedMode.set('self');
    this.isPlantingOpen.set(true);
  }

  closePlanting() {
    this.isPlantingOpen.set(false);
    this.targetZone.set(null);
  }

  confirmPlanting() {
    const zone = this.targetZone();
    if(zone) {
       this.game.plantTree(zone, this.selectedSpecies(), this.selectedMode());
       this.closePlanting();
       this.activeTab.set('forest'); 
    }
  }

  water(treeId: string) {
    this.game.waterTree(treeId);
  }
  
  getCost(mode: PlantationMode) { return this.game.PLANTATION_COSTS[mode]; }

  getDaysOld(tree: Tree) {
     const diff = new Date().getTime() - new Date(tree.plantedAt).getTime();
     return Math.floor(diff / (1000 * 3600 * 24));
  }

  canWater(tree: Tree) {
     const hoursSince = (new Date().getTime() - new Date(tree.lastWatered).getTime()) / (3600 * 1000);
     return hoursSince > 24;
  }
}