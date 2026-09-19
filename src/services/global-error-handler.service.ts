import { ErrorHandler, Injectable, signal } from '@angular/core';

/**
 * Application-wide `ErrorHandler`. Logs unhandled exceptions and exposes the
 * latest message so the UI can surface a friendly notification instead of
 * failing silently.
 */
@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  private errorCount = 0;

  readonly lastErrorMessage = signal<string | null>(null);

  handleError(error: unknown): void {
    this.errorCount += 1;
    const normalized = error instanceof Error ? error : new Error(String(error));

    console.error(`[EcoSnap] Unhandled error #${this.errorCount}:`, normalized);

    this.lastErrorMessage.set(normalized.message || 'Unexpected error');
  }

  clear(): void {
    this.lastErrorMessage.set(null);
  }
}
