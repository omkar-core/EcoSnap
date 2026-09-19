import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { ErrorHandler, provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './src/app.component';
import { GlobalErrorHandler } from './src/services/global-error-handler.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    GlobalErrorHandler,
    { provide: ErrorHandler, useExisting: GlobalErrorHandler }
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
