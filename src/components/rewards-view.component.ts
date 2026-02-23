import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';
import { AppComponent } from '../app.component';

interface Achievement {
  title: string;
  description: string;
  icon: string;
  requirement: string;
  unlocked: boolean;
}

@Component({
  selector: 'app-rewards-view',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto bg-slate-950 p-6 pb-32 font-inter">
      <!-- Header -->
      <div class="mb-8 pt-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-white mb-2">Rewards</h1>
          <p class="text-slate-400 text-sm">Track your ecological milestones.</p>
        </div>
        <div class="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-2xl border border-amber-500/30">
          🏆
        </div>
      </div>

      <!-- Rank System -->
      <section class="mb-10">
        <h2 class="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Progression Ranks</h2>
        <div class="space-y-3">
          @for (rank of ranks; track rank.name) {
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4"
                 [class.border-emerald-500/50]="game.userRank() === rank.name"
                 [class.bg-emerald-900/10]="game.userRank() === rank.name">
              <div class="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner border border-slate-700">
                {{ rank.icon }}
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h3 class="text-white font-bold">{{ rank.name }}</h3>
                  @if (game.userRank() === rank.name) {
                    <span class="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded uppercase font-bold">Current</span>
                  }
                </div>
                <p class="text-slate-500 text-xs mt-1">Requires {{ rank.points }} XP</p>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Achievements -->
      <section>
        <h2 class="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Milestone Badges</h2>
        <div class="grid grid-cols-2 gap-4">
          @for (ach of achievements(); track ach.title) {
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center group transition-all"
                 [class.opacity-50]="!ach.unlocked">
              <div class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-3 shadow-lg border border-slate-700 group-hover:scale-110 transition-transform">
                {{ ach.unlocked ? ach.icon : '🔒' }}
              </div>
              <h3 class="text-white font-bold text-sm mb-1">{{ ach.title }}</h3>
              <p class="text-slate-500 text-[10px] leading-snug">{{ ach.description }}</p>
              @if (!ach.unlocked) {
                <div class="mt-2 text-[8px] text-emerald-400 font-mono uppercase">{{ ach.requirement }}</div>
              }
            </div>
          }
        </div>
      </section>
    </div>
  `
})
export class RewardsViewComponent {
  game = inject(GameService);
  app = inject(AppComponent);

  ranks = [
    { name: 'Seedling', points: 0, icon: '🌱' },
    { name: 'Sprout', points: 500, icon: '🌿' },
    { name: 'Guardian', points: 2000, icon: '🛡️' },
    { name: 'Ranger', points: 5000, icon: '👮' },
    { name: 'Zone Lord', points: 15000, icon: '👑' },
    { name: 'City Champion', points: 50000, icon: '🏙️' }
  ];

  achievements = computed<Achievement[]>(() => [
    {
      title: 'First Scan',
      description: 'Documented your first waste artifact.',
      icon: '📸',
      requirement: '1 Scan',
      unlocked: this.game.scanHistory().length >= 1
    },
    {
      title: 'Cleanup Crew',
      description: 'Logged your first cleanup operation.',
      icon: '🧤',
      requirement: '1 Cleanup',
      unlocked: this.game.scanHistory().some(s => s.claimType === 'cleanup')
    },
    {
      title: 'Tree Planter',
      description: 'Added a new life to the urban forest.',
      icon: '🌳',
      requirement: '1 Tree',
      unlocked: this.game.trees().length >= 1
    },
    {
      title: 'Eco Warrior',
      description: 'Reached a total of 1000 XP.',
      icon: '⚔️',
      requirement: '1000 XP',
      unlocked: this.game.totalPoints() >= 1000
    },
    {
      title: 'Carbon Hero',
      description: 'Offset 10kg of CO2.',
      icon: '☁️',
      requirement: '10kg CO2',
      unlocked: this.game.totalCo2Offset() >= 10
    },
    {
      title: 'Streak Master',
      description: 'Maintained activity for 7 days.',
      icon: '🔥',
      requirement: '7 Day Streak',
      unlocked: this.game.streakDays() >= 7
    }
  ]);
}
