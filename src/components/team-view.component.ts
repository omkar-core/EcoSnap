import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-team-view',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto bg-slate-950 pb-24 p-6 animate-fade-in">
      
      <!-- Header -->
      <div class="mb-8 flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-black text-white mb-2 tracking-tight">Mission Control</h1>
          <p class="text-slate-400 leading-relaxed text-sm">
            Powered by advanced multimodal AI.
          </p>
        </div>
      </div>

      <!-- Unique Device ID Section -->
      <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6 shadow-lg">
         <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Your Unique Device ID</h3>
         <div class="flex items-center justify-between bg-black/30 p-2 rounded border border-slate-800">
           <code class="text-emerald-400 font-mono text-xs break-all">{{ game.deviceId() }}</code>
           <span class="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded">No Login Required</span>
         </div>
         <p class="text-[10px] text-slate-500 mt-2">
           This ID uniquely identifies your contribution history on this device.
         </p>
      </div>

      <!-- Tech Stack / Team Cards -->
      <div class="space-y-4">
        
        <!-- About Developer Card -->
        <div class="bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden group">
          <div class="flex items-start justify-between mb-4">
             <div class="flex items-center gap-3">
               <div class="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-3xl shadow-lg shadow-emerald-600/20 border-2 border-slate-900">👨‍💻</div>
               <div>
                 <h3 class="text-white font-bold text-lg leading-tight">Omkar Kore</h3>
                 <p class="text-emerald-400 text-[10px] font-mono uppercase tracking-wider font-bold">Solo Developer • EcoSnap</p>
               </div>
             </div>
          </div>
          
          <div class="mb-4">
            <p class="text-emerald-200/80 text-xs font-medium mb-2 border-b border-emerald-500/20 pb-2 inline-block">
              Student | ECE B.Tech | Code | Connect | Create
            </p>
            <p class="text-slate-300 text-sm leading-relaxed">
              Passionate about technology and innovation, I am Omkar Kore—a B.Tech student specializing in Electronics and Communication Engineering at DKTE’s Textile and Engineering Institute, Sangli, Maharashtra. Solo developer of this app named "EcoSnap".
            </p>
          </div>

          <a href="https://www.linkedin.com/in/omkar-kore-313a0229a/" target="_blank" rel="noopener noreferrer" 
             class="inline-flex items-center gap-2 bg-[#0077b5] hover:bg-[#006396] text-white px-4 py-3 rounded-xl text-sm font-bold transition-all w-full justify-center shadow-lg active:scale-95 group/btn">
             <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
             Connect on LinkedIn
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-50 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
             </svg>
          </a>
        </div>
        
        <!-- Gemini 3 Card -->
        <div class="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 p-5 rounded-2xl relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-indigo-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          </div>
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-3">
               <div class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">✨</div>
               <div>
                 <h3 class="text-white font-bold text-lg">Google Gemini</h3>
                 <p class="text-indigo-300 text-xs font-mono uppercase">Intelligence Engine</p>
               </div>
            </div>
            <p class="text-slate-300 text-sm mb-3">
              Providing real-time polymer analysis, recycling logic, and creative upcycling recipes using the <code>gemini-2.5-flash</code> model.
            </p>
            <div class="flex gap-2">
              <span class="px-2 py-1 rounded bg-indigo-950 border border-indigo-800 text-[10px] text-indigo-300 font-mono">Multimodal Vision</span>
              <span class="px-2 py-1 rounded bg-indigo-950 border border-indigo-800 text-[10px] text-indigo-300 font-mono">JSON Mode</span>
            </div>
          </div>
        </div>

        <!-- Project Vision -->
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative">
          <div class="flex items-center gap-3 mb-3">
             <div class="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-xl shadow-lg shadow-orange-600/20">🌍</div>
             <div>
               <h3 class="text-white font-bold text-lg">Swachh Bharat</h3>
               <p class="text-orange-400 text-xs font-mono uppercase">The Goal</p>
             </div>
          </div>
          <p class="text-slate-300 text-sm">
            Turning every fitness run into a cleanup mission. Tracking hyper-local waste data to empower communities.
          </p>
        </div>

      </div>

      <div class="mt-12 text-center pb-8">
        <p class="text-slate-600 text-xs">Version 1.0.1 • Production Build</p>
        <p class="text-slate-700 text-[10px] font-mono mt-1 mb-4">
           Lat: {{ game.userLocation()?.lat | number:'1.2-2' }} • Lng: {{ game.userLocation()?.lng | number:'1.2-2' }}
        </p>
      </div>

    </div>
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
  `]
})
export class TeamViewComponent {
  game = inject(GameService);
}