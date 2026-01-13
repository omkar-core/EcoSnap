import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Zone, Tree, PlantationMode, GROWTH_CONFIG } from '../services/game.service';

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
                                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group">
                                    <div class="flex items-start justify-between mb-3">
                                        <div class="flex items-center gap-3">
                                            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-colors"
                                                 [class.bg-emerald-900_30]="tree.health > 70"
                                                 [class.border-emerald-500_20]="tree.health > 70"
                                                 [class.bg-amber-900_30]="tree.health <= 70 && tree.health > 40"
                                                 [class.border-amber-500_20]="tree.health <= 70 && tree.health > 40"
                                                 [class.bg-red-900_30]="tree.health <= 40"
                                                 [class.border-red-500_20]="tree.health <= 40">
                                                {{ GROWTH_CONFIG[tree.stage].icon }}
                                            </div>
                                            <div>
                                                <div class="text-white font-bold">{{ tree.species }}</div>
                                                <div class="text-xs text-emerald-400 font-medium">{{ tree.stage }} • Age: {{ getDaysOld(tree) }}d</div>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-xs text-slate-500 uppercase font-bold mb-1">Health</div>
                                            <div class="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-auto">
                                                <div class="h-full transition-all duration-500" 
                                                     [style.width.%]="tree.health"
                                                     [class.bg-emerald-500]="tree.health > 70"
                                                     [class.bg-amber-500]="tree.health <= 70 && tree.health > 40"
                                                     [class.bg-red-500]="tree.health <= 40"></div>
                                            </div>
                                            <div class="text-[10px] mt-1 font-mono" 
                                                 [class.text-emerald-400]="tree.health > 70"
                                                 [class.text-amber-400]="tree.health <= 70">
                                                 {{ tree.health }}%
                                            </div>
                                        </div>
                                    </div>

                                    <!-- EXPANDED METRICS (Requirements Met) -->
                                    <div class="grid grid-cols-3 gap-2 text-xs text-slate-400 mb-3 bg-slate-950/30 p-2 rounded-lg text-center">
                                       <div class="flex flex-col">
                                          <span class="text-[10px] font-bold uppercase text-slate-500">Offset</span>
                                          <span class="text-white font-bold">{{ tree.co2Offset | number:'1.2-2' }}kg</span>
                                       </div>
                                       <div class="flex flex-col">
                                          <span class="text-[10px] font-bold uppercase text-slate-500">AC Hours</span>
                                          <span class="text-white font-bold">{{ tree.metrics?.acHours || 0 | number:'1.1-1' }}h</span>
                                       </div>
                                       <div class="flex flex-col">
                                          <span class="text-[10px] font-bold uppercase text-slate-500">Bottles</span>
                                          <span class="text-white font-bold">{{ tree.metrics?.plasticBottles || 0 | number:'1.0-0' }}</span>
                                       </div>
                                    </div>

                                    @if (tree.mode === 'self') {
                                        <div class="flex gap-2">
                                            <button (click)="maintain(tree.id, 'water')" 
                                                [disabled]="!canMaintain(tree, 'water')"
                                                class="flex-1 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                                💧 Water
                                            </button>
                                            <button (click)="maintain(tree.id, 'fertilize')" 
                                                [disabled]="!canMaintain(tree, 'fertilize')"
                                                class="flex-1 py-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold hover:bg-amber-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                                🧪 Feed
                                            </button>
                                        </div>
                                    } @else {
                                       <div class="text-center text-[10px] text-slate-500 bg-slate-800/50 py-1.5 rounded-lg border border-slate-700/50">
                                          Auto-Maintained by {{ tree.mode === 'community' ? 'Community Partners' : 'Sponsors' }}
                                       </div>
                                    }
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
            <div class="bg-slate-900 w-full sm:w-[450px] rounded-t-3xl sm:rounded-3xl border border-slate-700 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                
                <!-- Modal Header -->
                <div class="p-6 pb-4 bg-slate-800/50 border-b border-slate-700 shrink-0">
                    <div class="flex items-center justify-between mb-1">
                        <h2 class="text-xl font-bold text-white">Reforestation Protocol</h2>
                        <button (click)="closePlanting()" class="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <p class="text-emerald-400 text-sm font-medium">Zone: {{ targetZone()?.name }}</p>
                </div>

                <div class="p-6 space-y-6 overflow-y-auto flex-1">
                    
                    <!-- 1. MODE SELECTOR -->
                    <div>
                       <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">1. Select Mode</label>
                       <div class="flex gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700">
                          <button (click)="selectedMode.set('self')" 
                             class="flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all"
                             [class.bg-slate-700]="selectedMode() === 'self'"
                             [class.text-white]="selectedMode() === 'self'"
                             [class.text-slate-400]="selectedMode() !== 'self'">
                             Self
                          </button>
                          <button (click)="selectedMode.set('community')" 
                             class="flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all"
                             [class.bg-slate-700]="selectedMode() === 'community'"
                             [class.text-white]="selectedMode() === 'community'"
                             [class.text-slate-400]="selectedMode() !== 'community'">
                             Community
                          </button>
                          <button (click)="selectedMode.set('sponsored')" 
                             class="flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all"
                             [class.bg-slate-700]="selectedMode() === 'sponsored'"
                             [class.text-white]="selectedMode() === 'sponsored'"
                             [class.text-slate-400]="selectedMode() !== 'sponsored'">
                             Sponsored
                          </button>
                       </div>
                    </div>

                    <!-- 2. MODE SPECIFIC OPTIONS -->
                    
                    <!-- SELF MODE -->
                    @if (selectedMode() === 'self') {
                        <div class="animate-fade-in space-y-4">
                           <div class="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-xl">
                              <h3 class="text-white font-bold text-sm mb-1">Physical Planting</h3>
                              <p class="text-slate-400 text-xs">You physically plant a sapling at this location. Requires GPS verification and photo proof.</p>
                           </div>
                           
                           <div>
                              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Species</label>
                              <div class="grid grid-cols-2 gap-2">
                                  @for (species of speciesOptions; track species) {
                                      <button (click)="selectedSpecies.set(species)" 
                                              class="p-2 rounded-lg border text-left transition-all text-xs font-bold"
                                              [class.bg-emerald-600_20]="selectedSpecies() === species"
                                              [class.border-emerald-500]="selectedSpecies() === species"
                                              [class.text-white]="selectedSpecies() === species"
                                              [class.bg-slate-800]="selectedSpecies() !== species"
                                              [class.border-slate-700]="selectedSpecies() !== species"
                                              [class.text-slate-400]="selectedSpecies() !== species">
                                          {{ species }}
                                      </button>
                                  }
                              </div>
                           </div>
                           
                           <div class="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700 opacity-70">
                               <div class="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">📷</div>
                               <div class="text-xs text-slate-400">Photo upload required on site</div>
                           </div>
                        </div>
                    }

                    <!-- COMMUNITY MODE -->
                    @if (selectedMode() === 'community') {
                        <div class="animate-fade-in space-y-4">
                           <div class="p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl">
                              <h3 class="text-white font-bold text-sm mb-1">NGO Donation</h3>
                              <p class="text-slate-400 text-xs">Donate credits to partner NGOs. They plant and maintain trees on your behalf.</p>
                           </div>

                           <div>
                              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Select Pack</label>
                              <div class="space-y-2">
                                 <button (click)="quantity.set(1)" 
                                    class="w-full flex items-center justify-between p-3 rounded-xl border bg-slate-800"
                                    [class.border-blue-500]="quantity() === 1"
                                    [class.border-slate-700]="quantity() !== 1">
                                    <span class="text-white font-bold text-sm">1 Tree</span>
                                    <span class="text-blue-400 text-xs font-bold">100 Credits</span>
                                 </button>
                                 <button (click)="quantity.set(5)" 
                                    class="w-full flex items-center justify-between p-3 rounded-xl border bg-slate-800"
                                    [class.border-blue-500]="quantity() === 5"
                                    [class.border-slate-700]="quantity() !== 5">
                                    <span class="text-white font-bold text-sm">5 Trees (10% Off)</span>
                                    <span class="text-blue-400 text-xs font-bold">450 Credits</span>
                                 </button>
                                 <button (click)="quantity.set(10)" 
                                    class="w-full flex items-center justify-between p-3 rounded-xl border bg-slate-800"
                                    [class.border-blue-500]="quantity() === 10"
                                    [class.border-slate-700]="quantity() !== 10">
                                    <span class="text-white font-bold text-sm">10 Trees (15% Off)</span>
                                    <span class="text-blue-400 text-xs font-bold">850 Credits</span>
                                 </button>
                              </div>
                           </div>
                        </div>
                    }

                    <!-- SPONSORED MODE -->
                    @if (selectedMode() === 'sponsored') {
                        <div class="animate-fade-in space-y-4">
                           <div class="p-4 bg-amber-900/20 border border-amber-500/20 rounded-xl">
                              <h3 class="text-white font-bold text-sm mb-1">Corporate Sponsor</h3>
                              <p class="text-slate-400 text-xs">Unlock free trees through gameplay achievements. Sponsored by GreenCorp.</p>
                           </div>

                           <div class="space-y-2">
                              <div class="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                                 <span class="text-slate-400 text-xs">30-Day Streak</span>
                                 @if(game.streakDays() >= 30) {
                                    <span class="text-emerald-400 text-xs font-bold">UNLOCKED</span>
                                 } @else {
                                    <span class="text-slate-600 text-xs font-bold">LOCKED ({{game.streakDays()}}/30)</span>
                                 }
                              </div>
                              <div class="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                                 <span class="text-slate-400 text-xs">1000 XP Acquired</span>
                                 @if(game.totalPoints() >= 1000) {
                                    <span class="text-emerald-400 text-xs font-bold">UNLOCKED</span>
                                 } @else {
                                    <span class="text-slate-600 text-xs font-bold">LOCKED ({{game.totalPoints()}}/1000)</span>
                                 }
                              </div>
                           </div>
                        </div>
                    }
                </div>

                <!-- Footer -->
                <div class="p-6 bg-slate-800 border-t border-slate-700 safe-area-bottom shrink-0">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-slate-400 text-xs font-bold uppercase">Cost</span>
                        <span class="text-white font-bold">{{ calculateCost() }} Credits</span>
                    </div>
                    
                    <button (click)="confirmPlanting()" 
                            [disabled]="!canAfford()"
                            class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/40 transition-transform active:scale-95 btn-shockwave">
                        @if (canAfford()) {
                           Confirm Plantation
                        } @else {
                           Insufficient Resources
                        }
                    </button>
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
  GROWTH_CONFIG = GROWTH_CONFIG;

  activeTab = signal<'zones' | 'forest'>('zones');
  
  // Planting Modal State
  isPlantingOpen = signal(false);
  targetZone = signal<Zone | null>(null);
  
  // Form State
  selectedSpecies = signal<string>('Neem');
  selectedMode = signal<PlantationMode>('self');
  quantity = signal<number>(1);
  
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
    this.quantity.set(1);
    this.isPlantingOpen.set(true);
  }

  closePlanting() {
    this.isPlantingOpen.set(false);
    this.targetZone.set(null);
  }

  calculateCost(): number {
     const mode = this.selectedMode();
     const qty = mode === 'community' ? this.quantity() : 1;
     let cost = this.game.PLANTATION_COSTS[mode] * qty;
     
     if (mode === 'community') {
        if (qty >= 10) cost = Math.floor(cost * 0.85);
        else if (qty >= 5) cost = Math.floor(cost * 0.9);
     }
     return cost;
  }

  canAfford(): boolean {
     if (this.selectedMode() === 'sponsored') {
        return this.game.streakDays() >= 30 || this.game.totalPoints() >= 1000;
     }
     return this.game.greenCredits() >= this.calculateCost();
  }

  confirmPlanting() {
    const zone = this.targetZone();
    if(zone && this.canAfford()) {
       const qty = this.selectedMode() === 'community' ? this.quantity() : 1;
       const userLoc = this.game.userLocation();
       
       // Pass user location specifically for Self-mode validation
       this.game.plantTree(
          zone, 
          this.selectedSpecies(), 
          this.selectedMode(), 
          qty,
          userLoc ? { lat: userLoc.lat, lng: userLoc.lng } : undefined
       );
       this.closePlanting();
       this.activeTab.set('forest'); 
    }
  }

  maintain(treeId: string, action: 'water' | 'fertilize') {
    this.game.maintainTree(treeId, action);
  }
  
  getDaysOld(tree: Tree) {
     const diff = new Date().getTime() - new Date(tree.plantedAt).getTime();
     return Math.floor(diff / (1000 * 3600 * 24));
  }

  canMaintain(tree: Tree, action: 'water' | 'fertilize') {
     const now = new Date().getTime();
     if (action === 'water') {
        const last = new Date(tree.lastWatered).getTime();
        return (now - last) > (3600 * 1000 * 12); // 12h
     } else {
        const last = tree.lastFertilized ? new Date(tree.lastFertilized).getTime() : 0;
        return (now - last) > (3600 * 1000 * 24 * 7); // 7d
     }
  }
}