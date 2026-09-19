import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-skeleton-loader',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div aria-hidden="true" role="presentation" class="h-full w-full bg-slate-950 px-6 py-8 flex flex-col gap-6">
      <!-- Header Skeleton -->
      <div class="flex items-center gap-4 mb-4">
        <div class="sk w-12 h-12 rounded-full"></div>
        <div class="flex-1 space-y-3">
          <div class="sk h-5 rounded w-1/3"></div>
          <div class="sk h-3 rounded w-1/4"></div>
        </div>
      </div>

      <!-- Main Content Block Skeleton -->
      <div class="sk w-full h-48 rounded-2xl border border-slate-700/50"></div>

      <!-- Grid Skeleton -->
      <div class="grid grid-cols-2 gap-4">
        <div class="sk h-32 rounded-2xl border border-slate-700/50"></div>
        <div class="sk h-32 rounded-2xl border border-slate-700/50"></div>
      </div>

      <!-- List Items Skeleton -->
      <div class="space-y-4 mt-2">
         <div class="sk h-16 rounded-xl"></div>
         <div class="sk h-16 rounded-xl"></div>
         <div class="sk h-16 rounded-xl"></div>
      </div>
    </div>
  `,
    styles: [`
    .sk {
      position: relative;
      overflow: hidden;
      background-color: rgba(30, 41, 59, 0.5);
    }
    .sk::after {
      content: '';
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.06) 20%,
        rgba(255, 255, 255, 0.12) 60%,
        rgba(255, 255, 255, 0)
      );
      animation: sk-shimmer 1.6s infinite;
    }
    @keyframes sk-shimmer {
      100% { transform: translateX(100%); }
    }
  `]
})
export class SkeletonLoaderComponent { }
