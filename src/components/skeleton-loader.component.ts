import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-skeleton-loader',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="h-full w-full bg-slate-950 px-6 py-8 flex flex-col gap-6 animate-pulse">
      <!-- Header Skeleton -->
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 rounded-full bg-slate-800"></div>
        <div class="flex-1 space-y-3">
          <div class="h-5 bg-slate-800 rounded w-1/3"></div>
          <div class="h-3 bg-slate-800 rounded w-1/4"></div>
        </div>
      </div>

      <!-- Main Content Block Skeleton -->
      <div class="w-full h-48 bg-slate-800/50 rounded-2xl border border-slate-700/50"></div>

      <!-- Grid Skeleton -->
      <div class="grid grid-cols-2 gap-4">
        <div class="h-32 bg-slate-800/50 rounded-2xl border border-slate-700/50"></div>
        <div class="h-32 bg-slate-800/50 rounded-2xl border border-slate-700/50"></div>
      </div>
      
      <!-- List Items Skeleton -->
      <div class="space-y-4 mt-2">
         <div class="h-16 bg-slate-800/30 rounded-xl"></div>
         <div class="h-16 bg-slate-800/30 rounded-xl"></div>
         <div class="h-16 bg-slate-800/30 rounded-xl"></div>
      </div>
    </div>
  `
})
export class SkeletonLoaderComponent { }
