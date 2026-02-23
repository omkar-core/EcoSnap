import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { GameService } from './services/game.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any): void {
    const gameService = this.injector.get(GameService);

    // Log to console for debugging
    console.error('Global Error Handler caught:', error);

    // Provide user feedback for critical errors
    const message = error instanceof Error ? error.message : 'An unexpected system error occurred.';

    // We use a timeout to ensure the toast can be shown even if we're in the middle of a change detection cycle
    setTimeout(() => {
      gameService.showToast(`System Alert: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`, 'error');
    });

    // In a real production app, you would also send this to a service like Sentry or LogRocket
  }
}
