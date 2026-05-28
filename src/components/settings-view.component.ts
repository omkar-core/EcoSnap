import { Component, ChangeDetectionStrategy, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto bg-gradient-to-b from-slate-950 to-slate-900 px-6 py-8 font-inter">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button (click)="back.emit()" class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-white">Settings</h1>
      </div>

      <!-- Settings List -->
      <div class="space-y-4">
        <!-- About Us -->
        <button (click)="nav.emit('about')" class="w-full flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl active:bg-slate-700/50 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">ℹ️</div>
            <span class="text-slate-200 font-medium">About Us</span>
          </div>
          <span class="text-slate-500 text-sm">›</span>
        </button>

        <!-- App Information -->
        <button (click)="nav.emit('info')" class="w-full flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl active:bg-slate-700/50 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">📱</div>
            <span class="text-slate-200 font-medium">App Information</span>
          </div>
          <span class="text-slate-500 text-sm">›</span>
        </button>

        <!-- Privacy Policy -->
        <button (click)="nav.emit('privacy')" class="w-full flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl active:bg-slate-700/50 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">🔒</div>
            <span class="text-slate-200 font-medium">Privacy Policy</span>
          </div>
          <span class="text-slate-500 text-sm">›</span>
        </button>

        <!-- Terms & Conditions -->
        <button (click)="nav.emit('terms')" class="w-full flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl active:bg-slate-700/50 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">📜</div>
            <span class="text-slate-200 font-medium">Terms & Conditions</span>
          </div>
          <span class="text-slate-500 text-sm">›</span>
        </button>

        <!-- Contact/Support -->
        <button (click)="nav.emit('contact')" class="w-full flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl active:bg-slate-700/50 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">🎧</div>
            <span class="text-slate-200 font-medium">Contact & Support</span>
          </div>
          <span class="text-slate-500 text-sm">›</span>
        </button>

        <!-- FAQ -->
        <button (click)="nav.emit('faq')" class="w-full flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl active:bg-slate-700/50 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">❓</div>
            <span class="text-slate-200 font-medium">FAQ</span>
          </div>
          <span class="text-slate-500 text-sm">›</span>
        </button>

        <!-- Notifications Toggle (Visual Only for now based on prompt) -->
        <div class="w-full flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">🔔</div>
            <span class="text-slate-200 font-medium">Push Notifications</span>
          </div>
          <div class="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
            <div class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>

        <!-- Bioluminescent Theme Toggle -->
        <div class="w-full flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl cursor-pointer" (click)="toggleTheme()">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">🦋</div>
            <div>
               <span class="text-slate-200 font-medium block">Bioluminescent Theme</span>
               <span class="text-[10px] text-slate-500 font-mono">Immersive Cyberpunk Aesthetics</span>
            </div>
          </div>
          <div class="w-10 h-6 rounded-full relative transition-colors" [class.bg-emerald-500]="game.isBioluminescent()" [class.bg-slate-700]="!game.isBioluminescent()">
            <div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all" [class.right-1]="game.isBioluminescent()" [class.left-1]="!game.isBioluminescent()"></div>
          </div>
        </div>

        <!-- Ambient Sound Control -->
        <div class="w-full flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl cursor-pointer" (click)="toggleSound()">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">🔊</div>
            <div>
               <span class="text-slate-200 font-medium block">Ambient Soundscapes</span>
               <span class="text-[10px] text-slate-500 font-mono">City Pulse & Nature</span>
            </div>
          </div>
          <div class="w-10 h-6 rounded-full relative transition-colors" [class.bg-emerald-500]="game.isAmbientSoundOn()" [class.bg-slate-700]="!game.isAmbientSoundOn()">
             <div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all" [class.right-1]="game.isAmbientSoundOn()" [class.left-1]="!game.isAmbientSoundOn()"></div>
          </div>
        </div>

        <!-- Personal API Key Settings -->
        <div class="w-full p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl mt-4">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">🔑</div>
            <span class="text-slate-200 font-medium">Personal AI API Key (Optional)</span>
          </div>
          <p class="text-xs text-slate-400 mb-3">Add your own Google Gemini API key to ensure uninterrupted AI access during high traffic or maintenance.</p>
          <div class="flex gap-2">
            <input #apiKeyInput type="password" [value]="personalKey()" (input)="personalKey.set(apiKeyInput.value)" placeholder="Enter Gemini API Key" class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors">
            <button (click)="saveApiKey()" class="bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-4 py-2 text-sm font-bold transition-colors">Save</button>
            @if (personalKey()) {
              <button (click)="clearApiKey()" class="bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-3 py-2 text-sm transition-colors">Clear</button>
            }
          </div>
        </div>

        <div class="pt-4 border-t border-slate-800 mt-6">
          <!-- Account Deletion -->
          <button (click)="nav.emit('account_deletion')" class="w-full flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl active:bg-slate-700/50 transition-colors mb-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">🗑️</div>
              <span class="text-red-400 font-medium">Delete Account</span>
            </div>
            <span class="text-slate-500 text-sm">›</span>
          </button>

          <!-- Logout -->
          <button (click)="logout()" class="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold transition-colors">
            Log Out
          </button>
        </div>
        
        <div class="mt-8 text-center pt-2">
           <p class="text-xs text-slate-500">&copy; EcoSnap | Developed & Maintained by <strong class="text-emerald-500/80">Omkar Kore</strong></p>
        </div>

      </div>
    </div>
  `,
  styles: []
})
export class SettingsViewComponent {
  back = output<void>();
  nav = output<string>();

  game = inject(GameService);
  personalKey = signal(localStorage.getItem('eco_personal_api_key') || '');

  saveApiKey() {
    const key = this.personalKey().trim();
    if (key) {
      localStorage.setItem('eco_personal_api_key', key);
      this.game.showToast('Personal API Key Saved', 'success');
    }
  }

  clearApiKey() {
    this.personalKey.set('');
    localStorage.removeItem('eco_personal_api_key');
    this.game.showToast('Personal API Key Cleared', 'info');
  }

  logout() {
    // This removes user data via an assumed clear/logout approach
    localStorage.removeItem('eco_username');
    localStorage.removeItem('eco_scans');
    window.location.reload();
  }

  toggleTheme() {
    const current = this.game.isBioluminescent();
    this.game.isBioluminescent.set(!current);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('swh_theme_bio', JSON.stringify(!current));
    }
  }

  toggleSound() {
    this.game.toggleAmbientSound();
  }
}
