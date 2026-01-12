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
          <div class="relative h-64 bg-slate-800 group">
             <img [src]="imageSrc()" class="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100">
             <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
             
             <!-- Confidence Tag -->
             <div class="absolute top-4 right-14 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-600/50 shadow-lg">
               <div class="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]" 
                    [class.bg-emerald-400]="result().confidence > 80"
                    [class.text-emerald-400]="result().confidence > 80"
                    [class.bg-yellow-400]="result().confidence > 50 && result().confidence <= 80"
                    [class.text-yellow-400]="result().confidence > 50 && result().confidence <= 80"
                    [class.bg-red-400]="result().confidence <= 50"
                    [class.text-red-400]="result().confidence <= 50"></div>
               <span class="text-xs font-mono text-white font-bold">{{ result().confidence }}% Match</span>
             </div>

             <!-- Risk / Condition Badges -->
             <div class="absolute top-4 left-4 flex flex-col gap-2">
                @if (result().riskLevel !== 'Low') {
                   <div class="bg-red-900/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-red-500/50 w-fit shadow-lg shadow-red-900/20">
                     <span class="text-xs font-bold text-red-100 uppercase">⚠️ {{ result().riskLevel }} Risk</span>
                   </div>
                }
                @if (result().condition === 'Degraded/Weathered') {
                   <div class="bg-amber-900/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-amber-500/50 w-fit shadow-lg shadow-amber-900/20">
                     <span class="text-xs font-bold text-amber-100 uppercase">🌧️ Weathered</span>
                   </div>
                }
             </div>

             <!-- Title Block -->
             <div class="absolute bottom-6 left-6 right-6">
               <div class="flex flex-wrap items-center gap-2 mb-2">
                 <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                   Detected
                 </span>
                 @for (material of result().materialComposition; track material) {
                   <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-700/50 text-slate-300 border border-slate-600/30 backdrop-blur-sm">
                     {{ material }}
                   </span>
                 }
               </div>
               <h2 class="text-4xl font-black text-white leading-tight drop-shadow-lg tracking-tight">{{ result().wasteType }}</h2>
               <p class="text-slate-300 text-sm mt-2 line-clamp-2 leading-relaxed opacity-90 h-10 font-medium">
                 "{{ displayedStory() }}<span class="animate-pulse text-emerald-400">|</span>"
               </p>
             </div>
          </div>

          <div class="p-6 space-y-6">
            
            <!-- Fun Fact / Did You Know -->
            @if (result().funFact) {
              <div class="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-2xl p-4 flex gap-4 items-start shadow-sm relative overflow-hidden">
                <div class="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 blur-xl rounded-full pointer-events-none"></div>
                <div class="text-2xl pt-1">💡</div>
                <div class="relative z-10">
                  <h4 class="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">Did You Know?</h4>
                  <p class="text-indigo-100 text-sm leading-relaxed italic">
                    "{{ displayedFunFact() }}"
                  </p>
                </div>
              </div>
            }

            <!-- Ultimate Recycling Guide -->
            <div class="bg-slate-800/80 backdrop-blur rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
               <div class="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
                  <h3 class="text-white font-bold flex items-center gap-2">
                    <span class="text-xl">♻️</span> Recycling Guide
                  </h3>
                  <div class="flex flex-col items-end">
                    <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 shadow-sm border border-white/10"
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
               <div class="p-5 space-y-5">
                  <!-- Prep Steps -->
                  <div>
                    <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Preparation Steps</h4>
                    <ul class="space-y-3">
                      @for (step of result().recyclingGuidance.preparationSteps; track step) {
                        <li class="flex items-start gap-3 text-sm text-slate-200">
                          <div class="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 text-emerald-400 border border-emerald-500/30">✓</div>
                          {{ step }}
                        </li>
                      }
                    </ul>
                  </div>
                  
                  <!-- Environmental Impact -->
                  <div class="pt-4 border-t border-slate-700/50">
                     <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Estimated Impact</h4>
                     <p class="text-emerald-400 text-sm font-medium italic">{{ displayedImpact() }}</p>
                  </div>
               </div>
            </div>

            <!-- AI Reasoning (Deep Analysis) -->
             <div class="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50">
              <h4 class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                🤖 Vision Analysis & Condition
              </h4>
              <p class="text-slate-300 text-sm leading-relaxed min-h-[3rem]">
                {{ displayedReasoning() }}
              </p>
              <div class="mt-4 flex gap-2 flex-wrap">
                 <span class="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 border border-slate-600/50 shadow-sm">Condition: <strong class="text-white">{{ result().condition }}</strong></span>
                 <span class="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 border border-slate-600/50 shadow-sm">Weight: <strong class="text-white">{{ result().estimatedWeight }}g</strong></span>
                 @if(result().isRecyclable) {
                    <span class="text-xs bg-emerald-900/30 px-3 py-1.5 rounded-lg text-emerald-400 border border-emerald-500/30 font-bold shadow-sm">Recyclable</span>
                 } @else {
                    <span class="text-xs bg-red-900/30 px-3 py-1.5 rounded-lg text-red-400 border border-red-500/30 font-bold shadow-sm">Non-Recyclable</span>
                 }
              </div>
            </div>

            <!-- Upcycling Suggestion (Enhanced) -->
            @if (result().upcyclingRecipe; as recipe) {
              <div class="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/60 to-purple-900/60 shadow-2xl transition-all group">
                
                <!-- Decorative Background -->
                <div class="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl"></div>
                <div class="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl"></div>

                <!-- Header Section -->
                <div class="relative border-b border-indigo-500/20 bg-black/20 p-6 backdrop-blur-sm">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <div class="mb-2 flex items-center gap-2">
                        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-lg shadow-inner shadow-indigo-500/10">✨</span>
                        <h3 class="text-xs font-bold uppercase tracking-widest text-indigo-300">Upcycling Recipe</h3>
                      </div>
                      <h2 class="text-xl font-bold leading-tight text-white">{{ displayedIdea() || recipe.idea }}</h2>
                    </div>
                    
                    <!-- Share Button -->
                    <button (click)="shareRecipe(recipe)" class="group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-indigo-200 transition-all hover:bg-indigo-500 hover:text-white active:scale-95" title="Share Recipe">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    </button>
                  </div>

                  <!-- Meta Badges -->
                  <div class="mt-4 flex flex-wrap gap-3">
                    @if (recipe.difficulty) {
                      <div class="flex items-center gap-2 rounded-full border border-white/5 bg-black/30 px-3 py-1.5 shadow-sm">
                        <span class="text-xs font-bold uppercase text-slate-400">Difficulty</span>
                        <span class="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                              [class]="getDifficultyColor(recipe.difficulty)">
                          {{ recipe.difficulty }}
                        </span>
                      </div>
                    }
                    @if (recipe.estimatedTime) {
                      <div class="flex items-center gap-2 rounded-full border border-white/5 bg-black/30 px-3 py-1.5 shadow-sm">
                        <span class="text-xs font-bold uppercase text-slate-400">Time</span>
                        <span class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {{ recipe.estimatedTime }}
                        </span>
                      </div>
                    }
                  </div>
                </div>

                <div class="p-6">
                  <!-- Materials Section -->
                  @if (recipe.materialsNeeded && recipe.materialsNeeded.length > 0) {
                    <div class="mb-8">
                      <h4 class="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-200">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.4a2 2 0 0 0-2.83 0L2 19V2h10l8.38-8.6a2 2 0 0 0 0-2.83Z"/><path d="M2 2h20v20H2Z"/></svg>
                        Materials Needed
                      </h4>
                      <div class="grid gap-2 sm:grid-cols-2">
                        @for (item of recipe.materialsNeeded; track item) {
                          <label class="group flex cursor-pointer items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-indigo-500/30 hover:bg-white/10">
                            <div class="relative flex items-center pt-0.5">
                              <input type="checkbox" class="peer h-4 w-4 cursor-pointer appearance-none rounded border border-indigo-400/50 bg-black/40 checked:bg-indigo-500 checked:border-indigo-500 transition-all">
                              <svg class="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <span class="text-sm font-medium text-slate-300 group-hover:text-white transition-colors peer-checked:line-through peer-checked:opacity-50">{{ item }}</span>
                          </label>
                        }
                      </div>
                    </div>
                  }

                  <!-- Instructions Section -->
                  @if (recipe.instructions && recipe.instructions.length > 0) {
                    <div>
                      <h4 class="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-200">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        Instructions
                      </h4>
                      <div class="relative space-y-6 pl-4 before:absolute before:bottom-0 before:left-[19px] before:top-2 before:w-px before:bg-indigo-500/20">
                        @for (step of recipe.instructions; track step; let i = $index) {
                          <div class="relative flex gap-4 group/step">
                            <div class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-950 text-sm font-bold text-indigo-300 shadow-lg ring-4 ring-indigo-900/20 group-hover/step:bg-indigo-600 group-hover/step:text-white transition-colors">
                              {{ i + 1 }}
                            </div>
                            <div class="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm leading-relaxed text-slate-300 shadow-sm transition-all hover:bg-white/10 hover:text-white w-full group-hover/step:border-indigo-500/30">
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
        <div class="p-6 bg-slate-900 border-t border-slate-800 safe-area-bottom">
          
          @if (!isHistory()) {
            <!-- NEW SCAN ACTIONS -->
            <div class="grid grid-cols-2 gap-4">
              <!-- Scout Button -->
              <button (click)="handleClaim('scout')" class="relative overflow-hidden flex flex-col items-center justify-center py-4 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-2xl transition-all group active:scale-95 shadow-lg active:border-emerald-500/50">
                 <div class="relative z-10 flex flex-col items-center">
                    <span class="text-2xl mb-1 group-hover:scale-110 transition-transform duration-300">👀</span>
                    <span class="text-slate-300 font-bold text-xs uppercase tracking-wider">Just Scouted</span>
                    <span class="text-emerald-400 font-black text-sm mt-1 bg-slate-900/50 px-2 py-0.5 rounded">+{{ pointsScout() }} XP</span>
                 </div>
              </button>

              <!-- Cleanup Button (PARTICLE EFFECT) -->
              <button (click)="handleClaim('cleanup')" class="relative overflow-hidden flex flex-col items-center justify-center py-4 px-4 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 border border-emerald-400 rounded-2xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] group active:scale-95 btn-particle btn-shockwave">
                 
                 <!-- Shimmer Effect -->
                 <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
                 
                 <div class="relative z-10 flex flex-col items-center">
                    <span class="text-2xl mb-1 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-md">🧤</span>
                    <span class="text-white font-black text-xs uppercase tracking-wider">I Cleaned It</span>
                    <span class="text-emerald-900 font-black text-sm mt-1 bg-white/90 px-2 py-0.5 rounded shadow-sm">+{{ pointsCleanup() }} XP</span>
                 </div>
              </button>
            </div>
          } @else {
             <!-- HISTORY VIEW ACTIONS -->
             @if (result().upcyclingRecipe) {
               @if (!upcycleClaimed()) {
                  <button (click)="claimUpcycle.emit()" class="w-full flex flex-col items-center justify-center py-5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border border-indigo-400 rounded-2xl transition-all shadow-[0_4px_25px_rgba(99,102,241,0.4)] group relative overflow-hidden active:scale-95 btn-shockwave">
                    <span class="text-white font-black text-base uppercase flex items-center gap-2 tracking-wide">
                       🚀 I Completed This Project
                    </span>
                    <span class="text-indigo-100 text-xs mt-1 font-medium bg-white/10 px-2 py-0.5 rounded">Claim +50 Upcycling Bonus XP</span>
                  </button>
               } @else {
                  <div class="w-full py-5 text-center bg-slate-800/80 border border-slate-700 rounded-2xl text-indigo-400 font-bold text-sm uppercase flex items-center justify-center gap-2 shadow-inner">
                     <span class="bg-indigo-500/20 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg></span>
                     Upcycling Project Completed
                  </div>
               }
             } @else {
                <button (click)="close.emit()" class="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-2xl text-slate-300 font-bold text-sm uppercase transition-colors tracking-wide active:scale-95">
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
    .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.19, 1, 0.22, 1); }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fade-in 0.3s ease-out; }
    .safe-area-bottom { padding-bottom: max(1.5rem, env(safe-area-inset-bottom)); }
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

  shareRecipe(recipe: any) {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `Upcycle Idea: ${recipe.idea}`,
        text: `Check out this upcycling project for ${this.result().wasteType}!\n\n${recipe.instructions.join('\n')}`,
        url: window.location.href
      }).catch(err => console.log('Share failed', err));
    } else {
      // Fallback
      navigator.clipboard.writeText(`Upcycle Idea: ${recipe.idea}\n\n${recipe.instructions.join('\n')}`);
      this.game.showToast('Recipe copied to clipboard!', 'success');
    }
  }
}