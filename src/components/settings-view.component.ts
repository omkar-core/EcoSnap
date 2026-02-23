import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto bg-slate-950 p-6 pb-32 font-inter">
      <div class="mb-8 pt-6">
        <h1 class="text-3xl font-black text-white mb-2">Settings</h1>
        <p class="text-slate-400 text-sm">Control your EcoSnap AI experience.</p>
      </div>

      <div class="space-y-6">
        <!-- Account Section -->
        <section>
          <h2 class="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Account & Identity</h2>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-white font-bold">Codename</div>
                <div class="text-slate-400 text-xs">{{ game.username() }}</div>
              </div>
              <button (click)="app.navTo('dashboard')" class="text-emerald-400 text-xs font-bold hover:underline">Change</button>
            </div>
            <div class="h-px bg-slate-800 w-full"></div>
            <div class="flex items-center justify-between opacity-50">
              <div>
                <div class="text-white font-bold">Cloud Sync</div>
                <div class="text-slate-400 text-xs">Sync progress across devices</div>
              </div>
              <div class="w-10 h-5 bg-slate-700 rounded-full relative">
                <div class="absolute left-1 top-1 w-3 h-3 bg-slate-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Preferences Section -->
        <section>
          <h2 class="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Preferences</h2>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
             <div class="flex items-center justify-between">
              <div>
                <div class="text-white font-bold">Push Notifications</div>
                <div class="text-slate-400 text-xs">Alerts for zone updates</div>
              </div>
              <button (click)="toggleNotifications()" class="w-12 h-6 rounded-full transition-colors relative"
                      [class.bg-emerald-600]="notifications()" [class.bg-slate-700]="!notifications()">
                <div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
                     [class.left-7]="notifications()" [class.left-1]="!notifications()"></div>
              </button>
            </div>
            <div class="h-px bg-slate-800 w-full"></div>
            <div class="flex items-center justify-between">
              <div>
                <div class="text-white font-bold">High Precision GPS</div>
                <div class="text-slate-400 text-xs">Better accuracy, more battery usage</div>
              </div>
              <button (click)="toggleGps()" class="w-12 h-6 rounded-full transition-colors relative"
                      [class.bg-emerald-600]="gps()" [class.bg-slate-700]="!gps()">
                <div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
                     [class.left-7]="gps()" [class.left-1]="!gps()"></div>
              </button>
            </div>
          </div>
        </section>

        <!-- Danger Zone -->
        <section>
          <h2 class="text-xs font-bold text-red-500 uppercase tracking-widest mb-4">Danger Zone</h2>
          <div class="bg-red-950/20 border border-red-900/30 rounded-2xl p-4">
            <h3 class="text-white font-bold mb-1">Reset All Progress</h3>
            <p class="text-red-400/80 text-xs mb-4 leading-relaxed">This action will permanently delete all your points, scan history, and planted trees. This cannot be undone.</p>
            <button (click)="confirmReset()" class="w-full py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 rounded-xl text-sm font-bold transition-all">
              {{ resetConfirm() ? 'ARE YOU ABSOLUTELY SURE?' : 'Reset All Data' }}
            </button>
          </div>
        </section>

        <!-- System Info -->
        <div class="text-center pt-4">
           <div class="text-[10px] text-slate-600 font-mono uppercase tracking-widest">EcoSnap Protocol v2.5.0</div>
           <div class="text-[10px] text-slate-600 font-mono uppercase tracking-widest mt-1">Environment: Production</div>
        </div>
      </div>
    </div>
  `
})
export class SettingsViewComponent {
  game = inject(GameService);
  app = inject(AppComponent);

  notifications = signal(true);
  gps = signal(true);
  resetConfirm = signal(false);

  toggleNotifications() { this.notifications.update(v => !v); }
  toggleGps() { this.gps.update(v => !v); }

  confirmReset() {
    if (this.resetConfirm()) {
       this.game.resetAllData();
    } else {
       this.resetConfirm.set(true);
       setTimeout(() => this.resetConfirm.set(false), 3000);
    }
  }
}
