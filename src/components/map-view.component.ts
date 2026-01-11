import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Zone } from '../services/game.service';

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

        <div class="relative z-10 p-6 space-y-6 pt-10">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-white">Community Health</h1>
                    <p class="text-slate-400 text-sm">Sector Status & Vitality</p>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                    <span class="text-2xl">❤️</span>
                </div>
            </div>

            <!-- Overall Health Card -->
            <div class="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <div class="flex items-center justify-between mb-2">
                    <span class="text-slate-400 font-bold uppercase tracking-wider text-xs">Neighborhood Vitality</span>
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
                        <div class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-xl">⚖️</div>
                        <div>
                            <div class="text-white font-bold">{{ (game.totalWasteWeight() / 1000).toFixed(1) }}kg</div>
                            <div class="text-[10px] text-slate-500 uppercase font-bold">Removed</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Zones List -->
            <div>
                <h2 class="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    Sector Breakdown 
                    <span class="text-xs font-normal text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">{{ game.zones().length }} Zones</span>
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
                                        <span class="text-emerald-500">🌲</span> {{ zone.greenLayer.treeCount }}
                                    </span>
                                    <span class="flex items-center gap-1">
                                        <span class="text-slate-500">🗑️</span> {{ zone.wasteLayer.contributionCount }}
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
                                <button (click)="plantTree(zone)" 
                                        class="w-10 h-10 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-500 flex items-center justify-center transition-all active:scale-95 border border-slate-700 hover:border-emerald-500"
                                        [title]="'Plant tree (50 credits)'">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                                </button>
                             }
                        </div>
                    }
                    @if (game.zones().length === 0) {
                        <div class="text-center p-8 text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                            <div class="text-4xl mb-3">📡</div>
                            <p class="text-sm">Scanning sectors...</p>
                            <p class="text-xs mt-1">Explore your neighborhood to reveal data.</p>
                        </div>
                    }
                </div>
            </div>
        </div>
    </div>
  `
})
export class CommunityViewComponent {
  game = inject(GameService);

  plantTree(zone: Zone) {
      // Abstracted planting for list view (random location in zone)
      const randomOffsetLat = (Math.random() - 0.5) * 0.001;
      const randomOffsetLng = (Math.random() - 0.5) * 0.001;
      
      this.game.plantTree(
          zone, 
          'Neem', 
          'community', 
          { lat: zone.lat + randomOffsetLat, lng: zone.lng + randomOffsetLng }
      );
  }
}