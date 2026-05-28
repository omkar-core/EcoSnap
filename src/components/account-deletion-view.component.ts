import { Component, ChangeDetectionStrategy, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { GameService } from '../services/game.service';

@Component({
    selector: 'app-account-deletion-view',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="h-full overflow-y-auto bg-slate-950 px-6 py-8 font-inter">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8 sticky top-0 bg-slate-950/90 backdrop-blur pb-4 pt-2 z-10 border-b border-slate-800">
        <button (click)="back.emit()" class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <h1 class="text-xl font-bold text-red-500">Delete Account</h1>
      </div>

      <!-- Content -->
      <div class="space-y-6">
         <!-- Warning Card -->
         <div class="bg-red-950/20 border border-red-900/50 rounded-2xl p-6">
            <div class="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-2xl mb-4">
               ⚠️
            </div>
            <h2 class="text-white font-bold text-lg mb-2">Warning: Permanent Action</h2>
            <p class="text-red-200/70 text-sm leading-relaxed mb-4">
               Deleting your account will permanently erase all your scan history, points, and leaderboard standings. 
               This action <strong class="text-red-400">cannot be undone</strong>.
            </p>
         </div>

         <!-- Checkbox Confirmation -->
         <label class="flex items-start gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer">
            <input 
               type="checkbox" 
               [checked]="confirmed()" 
               (change)="toggleConfirm()"
               class="mt-1 w-5 h-5 rounded bg-slate-800 border-slate-700 text-red-500 focus:ring-red-500 focus:ring-offset-slate-900"
            >
            <span class="text-sm text-slate-300 leading-relaxed select-none">
               I understand that deleting my account is irreversible and all my data will be permanently wiped.
            </span>
         </label>

         <!-- Delete Action -->
         <button 
            [disabled]="!confirmed() || isDeleting()"
            (click)="deleteAccount()"
            class="w-full py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            [class.bg-red-600]="confirmed() && !isDeleting()"
            [class.hover.bg-red-500]="confirmed() && !isDeleting()"
            [class.text-white]="confirmed() && !isDeleting()"
            [class.bg-slate-800]="!confirmed() || isDeleting()"
            [class.text-slate-500]="!confirmed() || isDeleting()"
         >
            <span *ngIf="isDeleting()" class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            {{ isDeleting() ? 'Deleting...' : 'Permanently Delete Account' }}
         </button>
      </div>
    </div>
  `,
    styles: []
})
export class AccountDeletionViewComponent {
    back = output<void>();

    confirmed = signal(false);
    isDeleting = signal(false);

    private authService = inject(AuthService);
    private gameService = inject(GameService);

    toggleConfirm() {
        this.confirmed.update(v => !v);
    }

    async deleteAccount() {
        if (this.confirmed() && !this.isDeleting()) {
            this.isDeleting.set(true);
            try {
                try {
                    await this.authService.deleteAccount();
                } catch(e) {
                    console.warn("Auth deletion failed or user not signed in", e);
                }
                
                this.gameService.clearAllData();
                window.location.reload();
            } catch (error) {
                console.error("Account deletion failed", error);
                this.isDeleting.set(false);
            }
        }
    }
}
