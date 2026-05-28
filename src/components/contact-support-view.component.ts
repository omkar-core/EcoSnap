import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-support-view',
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
        <h1 class="text-xl font-bold text-white">Contact Support</h1>
      </div>

      <!-- Content -->
      <div class="space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
          <div class="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-4">
             ✉️
          </div>
          <h2 class="text-white font-bold text-lg mb-2">Get in Touch</h2>
          <p class="text-slate-400 text-sm mb-6 leading-relaxed">
             If you have any questions, feedback, collaboration ideas, or technical queries related to EcoSnap, feel free to reach out directly.
          </p>

          <a href="mailto:omkarkorephotos1@gmail.com" class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-colors mb-4 break-all">
             omkarkorephotos1&#64;gmail.com
          </a>
          
          <p class="text-slate-400 text-xs leading-relaxed border-t border-slate-800 pt-4 mt-2">
             The developer personally reviews all messages. Replies may take some time, but every genuine query is acknowledged.
          </p>
        </div>
      </div>
      
      <div class="mt-8 text-center pt-6">
         <p class="text-xs text-slate-500">&copy; EcoSnap | Developed & Maintained by <strong class="text-emerald-500/80">Omkar Kore</strong></p>
      </div>
    </div>
  `,
  styles: []
})
export class ContactSupportViewComponent {
  back = output<void>();
}
