import { Component, input, output, signal, computed, inject, ChangeDetectionStrategy, effect, OnDestroy, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WasteAnalysis } from '../services/gemini.service';
import { GameService, ClaimType } from '../services/game.service';

@Component({
  selector: 'app-scan-result',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center animate-fade-in p-0 sm:p-4">
      <div class="bg-slate-900 w-full sm:w-[500px] max-h-[95vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-slate-700 shadow-2xl animate-slide-up overflow-hidden relative">
        
        <!-- Close Button (Always visible) -->
        <button (click)="close.emit()" class="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Scrollable Content -->
        <div class="overflow-y-auto flex-1">
          <!-- Header Image & Badge -->
          <div class="relative h-64 bg-slate-800">
             <img [src]="imageSrc()" class="w-full h-full object-cover opacity-80">
             <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
             
             <!-- Confidence Tag -->
             <div class="absolute top-4 right-14 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-600/50">
               <div class="w-2 h-2 rounded-full" 
                    [class.bg-emerald-400]="result().confidence > 80"
                    [class.bg-yellow-400]="result().confidence > 50 && result().confidence <= 80"
                    [class.bg-red-400]="result().confidence <= 50"></div>
               <span class="text-xs font-mono text-white">{{ result().confidence }}% Match</span>
             </div>

             <!-- Risk / Condition Badges -->
             <div class="absolute top-4 left-4 flex flex-col gap-2">
                @if (result().riskLevel !== 'Low') {
                   <div class="bg-red-900/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-red-500/50 w-fit">
                     <span class="text-xs font-bold text-red-100 uppercase">⚠️ {{ result().riskLevel }} Risk</span>
                   </div>
                }
                @if (result().condition === 'Degraded/Weathered') {
                   <div class="bg-amber-900/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-amber-500/50 w-fit">
                     <span class="text-xs font-bold text-amber-100 uppercase">🌧️ Weathered</span>
                   </div>
                }
             </div>

             <!-- Title Block -->
             <div class="absolute bottom-6 left-6 right-6">
               <div class="flex flex-wrap items-center gap-2 mb-2">
                 <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                   Detected
                 </span>
                 @for (material of result().materialComposition; track material) {
                   <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-700/50 text-slate-300 border border-slate-600/30">
                     {{ material }}
                   </span>
                 }
               </div>
               <h2 class="text-3xl font-black text-white leading-tight drop-shadow-lg">{{ result().wasteType }}</h2>
               <p class="text-slate-300 text-sm mt-2 line-clamp-2 leading-relaxed opacity-90 h-10">
                 "{{ displayedStory() }}<span class="animate-pulse">|</span>"
               </p>
             </div>
          </div>

          <div class="p-6 space-y-6">
            
            <!-- Fun Fact / Did You Know -->
            @if (result().funFact) {
              <div class="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-4 flex gap-4 items-start shadow-sm">
                <div class="text-2xl pt-1">💡</div>
                <div>
                  <h4 class="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">Did You Know?</h4>
                  <p class="text-indigo-100 text-sm leading-relaxed italic">
                    "{{ displayedFunFact() }}"
                  </p>
                </div>
              </div>
            }

            <!-- Ultimate Recycling Guide -->
            <div class="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-md">
               <div class="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                  <h3 class="text-white font-bold flex items-center gap-2">
                    <span class="text-xl">♻️</span> Recycling Guide
                  </h3>
                  <div class="flex flex-col items-end">
                    <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 shadow-sm"
                          [class.bg-blue-600]="result().recyclingGuidance.category.includes('Dry')"
                          [class.bg-green-600]="result().recyclingGuidance.category.includes('Wet')"
                          [class.bg-red-600]="result().recyclingGuidance.category.includes('Hazardous') || result().recyclingGuidance.category.includes('Red')"
                          [class.bg-slate-600]="result().recyclingGuidance.category.includes('E-Waste')"
                          [class.text-white]="true">
                       {{ result().recyclingGuidance.category }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-mono">{{ result().biologicalCategory }}</span>
                  </div>
               </div>
               <div class="p-4 space-y-4">
                  <!-- Prep Steps -->
                  <div>
                    <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Preparation Steps</h4>
                    <ul class="space-y-2">
                      @for (step of result().recyclingGuidance.preparationSteps; track step) {
                        <li class="flex items-start gap-3 text-sm text-slate-200">
                          <span class="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 text-emerald-400">✓</span>
                          {{ step }}
                        </li>
                      }
                    </ul>
                  </div>
                  
                  <!-- Environmental Impact -->
                  <div class="pt-3 border-t border-slate-700">
                     <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Impact</h4>
                     <p class="text-emerald-400 text-sm italic">{{ displayedImpact() }}</p>
                  </div>
               </div>
            </div>

            <!-- AI Reasoning (Deep Analysis) -->
             <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                🤖 Vision Analysis & Condition
              </h4>
              <p class="text-slate-300 text-sm leading-relaxed min-h-[3rem]">
                {{ displayedReasoning() }}
              </p>
              <div class="mt-3 flex gap-2 flex-wrap">
                 <span class="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">Condition: <strong class="text-white">{{ result().condition }}</strong></span>
                 <span class="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">Weight: <strong class="text-white">{{ result().estimatedWeight }}g</strong></span>
                 @if(result().isRecyclable) {
                    <span class="text-xs bg-emerald-900/30 px-2 py-1 rounded text-emerald-400 border border-emerald-500/30 font-bold">Recyclable</span>
                 } @else {
                    <span class="text-xs bg-red-900/30 px-2 py-1 rounded text-red-400 border border-red-500/30 font-bold">Non-Recyclable</span>
                 }
              </div>
            </div>

            <!-- Upcycling Suggestion -->
            @if (result().upcyclingRecipe; as recipe) {
            <div class="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 p-5 rounded-xl border border-indigo-500/30 relative overflow-hidden group shadow-lg">
               <div class="absolute -right-6 -top-6 text-indigo-500/10 text-8xl transition-transform group-hover:rotate-12 select-none">💡</div>
               
               <!-- Header -->
               <div class="flex justify-between items-start mb-5 relative z-10">
                 <div class="flex-1 mr-4">
                   <h4 class="text-indigo-400 font-bold text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                      Gemini Upcycling Engine
                   </h4>
                   <h3 class="text-white font-bold text-xl leading-tight">{{ displayedIdea() }}</h3>
                 </div>
                 
                 <div class="flex flex-col items-end gap-2 shrink-0 text-right">
                   @if (recipe.difficulty) {
                     <div class="flex flex-col items-end">
                       <span class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-0.5">Difficulty</span>
                       <span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm"
                             [class]="getDifficultyColor(recipe.difficulty)">
                         {{ recipe.difficulty }}
                       </span>
                     </div>
                   }
                   @if (recipe.estimatedTime) {
                     <div class="flex flex-col items-end mt-1">
                        <span class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-0.5">Est. Time</span>
                        <span class="text-xs text-slate-200 font-mono flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded border border-white/5">
                          ⏱️ {{ recipe.estimatedTime }}
                        </span>
                     </div>
                   }
                 </div>
               </div>

               <div class="relative z-10 space-y-6">
                 
                 <!-- Materials Grid -->
                 @if (recipe.materialsNeeded && recipe.materialsNeeded.length > 0) {
                   <div class="bg-indigo-950/50 rounded-lg p-3 border border-indigo-500/20">
                     <h5 class="text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                       🛠️ Materials Needed
                     </h5>
                     <div class="flex flex-wrap gap-2">
                       @for (item of recipe.materialsNeeded; track item) {
                         <span class="text-xs text-slate-200 bg-slate-900/80 px-2.5 py-1.5 rounded-md border border-indigo-500/20 flex items-center gap-2 shadow-sm">
                           <span class="w-1 h-1 rounded-full bg-indigo-400"></span> {{ item }}
                         </span>
                       }
                     </div>
                   </div>
                 }

                 <!-- Instructions Stepper -->
                 @if (recipe.instructions && recipe.instructions.length > 0) {
                   <div>
                      <h5 class="text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1">
                        📝 Step-by-Step Instructions
                      </h5>
                      <div class="space-y-0 relative pl-2">
                        <!-- Connecting Line -->
                        <div class="absolute left-[19px] top-2 bottom-4 w-px bg-indigo-500/20"></div>
                        
                        @for (step of recipe.instructions; track step; let i = $index) {
                          <div class="flex gap-4 relative pb-6 last:pb-0 group/step">
                            <span class="relative z-10 w-8 h-8 rounded-full bg-indigo-900/80 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0 border border-indigo-500/30 group-hover/step:bg-indigo-500 group-hover/step:text-white group-hover/step:border-indigo-400 transition-all shadow-[0_0_0_4px_rgba(15,23,42,1)]">
                              {{ i + 1 }}
                            </span>
                            <div class="text-sm text-slate-300 leading-relaxed pt-1 group-hover/step:text-slate-100 transition-colors bg-slate-800/50 p-3 rounded-lg border border-white/5 w-full">
                              {{ step }}
                            </div>
                          </div>
                        }
                      </div>
                   </div>
                 }
               </div>
            </div>
            }

          </div>
        </div>

        <!-- FOOTER ACTIONS -->
        <div class="p-4 bg-slate-900 border-t border-slate-800 safe-area-bottom">
          
          @if (!isHistory()) {
            <!-- NEW SCAN ACTIONS -->
            <div class="grid grid-cols-2 gap-3">
              <!-- Scout Button -->
              <button (click)="handleClaim('scout')" class="flex flex-col items-center justify-center py-3 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all group active:scale-95">
                 <span class="text-2xl mb-1 group-hover:scale-110 transition-transform">👀</span>
                 <span class="text-slate-300 font-bold text-xs uppercase">Just Scouted</span>
                 <span class="text-emerald-400 font-black text-sm mt-1">+{{ pointsScout() }} XP</span>
              </button>

              <!-- Cleanup Button (Primary) -->
              <button (click)="handleClaim('cleanup')" class="flex flex-col items-center justify-center py-3 px-2 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] group relative overflow-hidden active:scale-95">
                 <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                 
                 <span class="text-2xl mb-1 group-hover:scale-110 transition-transform">🧤</span>
                 <span class="text-white font-bold text-xs uppercase">I Cleaned It</span>
                 <span class="text-white font-black text-sm mt-1">+{{ pointsCleanup() }} XP</span>
              </button>
            </div>
          } @else {
             <!-- HISTORY VIEW ACTIONS -->
             @if (result().upcyclingRecipe) {
               @if (!upcycleClaimed()) {
                  <button (click)="claimUpcycle.emit()" class="w-full flex flex-col items-center justify-center py-4 px-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] group relative overflow-hidden active:scale-95">
                    <span class="text-white font-bold text-sm uppercase flex items-center gap-2">
                       🚀 I Completed This Project
                    </span>
                    <span class="text-indigo-200 text-xs mt-1">Claim +50 Upcycling Bonus XP</span>
                  </button>
               } @else {
                  <div class="w-full py-4 text-center bg-slate-800 border border-slate-700 rounded-xl text-indigo-400 font-bold text-sm uppercase flex items-center justify-center gap-2">
                     ✅ Upcycling Project Completed
                  </div>
               }
             } @else {
                <button (click)="close.emit()" class="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 font-bold text-sm uppercase transition-colors">
                  Close Detail View
                </button>
             }
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fade-in 0.3s ease-out; }
    @keyframes shimmer { 100% { transform: translateX(100%); } }
    .group-hover\\:animate-shimmer { animation: shimmer 1s infinite; }
    .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 1rem); }
  `]
})
export class ScanResultComponent implements OnDestroy {
  result = input.required<WasteAnalysis>();
  imageSrc = input.required<string>();
  
  // Modes
  isHistory = input<boolean>(false);
  upcycleClaimed = input<boolean>(false);

  // Outputs
  onClaim = output<ClaimType>();
  close = output<void>();
  claimUpcycle = output<void>();
  
  game = inject(GameService);

  // Text Animation States
  displayedStory = signal('');
  displayedReasoning = signal('');
  displayedFunFact = signal('');
  displayedImpact = signal('');
  displayedIdea = signal('');
  
  private timeouts: any[] = [];

  constructor() {
    effect(() => {
       const r = this.result();
       this.resetTypewriter();
       
       // Start Animations (Word by Word)
       this.typewrite(r.urbanArtifactStory, this.displayedStory, 30);
       this.typewrite(r.reasoning, this.displayedReasoning, 20);
       
       if (r.funFact) this.typewrite(r.funFact, this.displayedFunFact, 30);
       
       this.typewrite(r.recyclingGuidance.environmentalImpact, this.displayedImpact, 30);
       
       if (r.upcyclingRecipe?.idea) {
         this.typewrite(r.upcyclingRecipe.idea, this.displayedIdea, 40);
       }
    });
  }

  ngOnDestroy() {
    this.timeouts.forEach(clearTimeout);
  }

  private resetTypewriter() {
    this.displayedStory.set('');
    this.displayedReasoning.set('');
    this.displayedFunFact.set('');
    this.displayedImpact.set('');
    this.displayedIdea.set('');
    
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }

  private typewrite(text: string, signalSetter: WritableSignal<string>, delay: number) {
     if (!text) return;
     
     // Split by space to get words, preserving spaces
     const words = text.split(' ');
     let i = 0;
     
     const animate = () => {
        if (i < words.length) {
           // Add space before word if it's not the first word
           const chunk = (i > 0 ? ' ' : '') + words[i];
           signalSetter.update(s => s + chunk);
           i++;
           this.timeouts.push(setTimeout(animate, delay));
        }
     };
     animate();
  }

  // Computed Points for UI
  pointsScout = computed(() => {
    const base = this.result().points;
    const bonus = Math.round(base * (this.game.activityMultiplier() - 1));
    return base + bonus;
  });

  pointsCleanup = computed(() => {
    const base = this.result().points * 2; // Double points for cleaning
    const bonus = Math.round(base * (this.game.activityMultiplier() - 1));
    return base + bonus;
  });

  handleClaim(type: ClaimType) {
    this.onClaim.emit(type);
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  }
}