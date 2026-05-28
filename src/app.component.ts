import { Component, signal, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseManagerService } from './services/firebase.manager';
import { GeminiService, WasteAnalysis } from './services/gemini.service';
import { GameService, ClaimType, ScanRecord } from './services/game.service';
import { CameraViewComponent } from './components/camera-view.component';
import { DashboardViewComponent } from './components/dashboard-view.component';
import { ScanResultComponent } from './components/scan-result.component';
import { TeamViewComponent } from './components/team-view.component';
import { LandingViewComponent } from './components/landing-view.component';
import { CommunityViewComponent } from './components/map-view.component'; // Importing from repurposed file
import { SplashViewComponent } from './components/splash-view.component';
import { SettingsViewComponent } from './components/settings-view.component';
import { PrivacyPolicyViewComponent } from './components/privacy-policy-view.component';
import { TermsConditionsViewComponent } from './components/terms-conditions-view.component';
import { ContactSupportViewComponent } from './components/contact-support-view.component';
import { AboutUsViewComponent } from './components/about-us-view.component';
import { FaqViewComponent } from './components/faq-view.component';
import { AccountDeletionViewComponent } from './components/account-deletion-view.component';
import { InfoViewComponent } from './components/info-view.component';
import { SkeletonLoaderComponent } from './components/skeleton-loader.component';
import { EcoCompanionComponent } from './components/eco-companion.component';

type ViewState = 'dashboard' | 'camera' | 'team' | 'landing' | 'community' | 'splash' | 'settings' | 'privacy' | 'terms' | 'contact' | 'about' | 'faq' | 'account_deletion' | 'info';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CameraViewComponent,
    DashboardViewComponent,
    ScanResultComponent,
    TeamViewComponent,
    LandingViewComponent,
    CommunityViewComponent,
    SplashViewComponent,
    SettingsViewComponent,
    PrivacyPolicyViewComponent,
    TermsConditionsViewComponent,
    ContactSupportViewComponent,
    AboutUsViewComponent,
    FaqViewComponent,
    AccountDeletionViewComponent,
    InfoViewComponent,
    SkeletonLoaderComponent,
    EcoCompanionComponent
  ],
  templateUrl: './app.component.html',
  styles: [`
    @keyframes slide-down {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-slide-down { animation: slide-down 0.3s ease-out forwards; }
    @keyframes fade-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    .animate-fade-out { animation: fade-out 0.5s ease-out forwards; }
    
    /* Chat Animations */
    @keyframes pop-in {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  `]
})
export class AppComponent {
  private geminiService = inject(GeminiService);
  private firebaseManager = inject(FirebaseManagerService);
  game = inject(GameService);

  currentView = signal<ViewState>('splash');
  isProcessing = signal(false);
  scanResult = signal<WasteAnalysis | null>(null);
  capturedImage = signal<string | null>(null);

  showNavBar = computed(() => {
    const hiddenViews: ViewState[] = ['camera', 'landing', 'splash', 'settings', 'privacy', 'terms', 'contact', 'about', 'faq', 'account_deletion', 'info'];
    return !this.isProcessing() && !this.scanResult() && !hiddenViews.includes(this.currentView());
  });

  // History View State
  isHistoryView = signal(false);
  currentHistoryId = signal<string | null>(null);
  currentUpcycleClaimed = signal(false);

  // AI Copilot State
  isAiOpen = signal(false);
  chatHistory = signal<ChatMessage[]>([]);
  isAiThinking = signal(false);
  currentAiTypedText = signal('');

  private currentScanLocation: { lat: number, lng: number } | undefined;
  private typeWriterTimeout: any;

  constructor() {
    // Initial Greeting from AI
    if (this.game.hasOnboarded()) {
      setTimeout(() => {
        this.addAiMessage(`Welcome back, Ranger ${this.game.username()}. Systems online. How can I assist your patrol today?`);
      }, 2000);
    }
  }

  toggleAi() {
    this.isAiOpen.update(v => !v);
    // If opening and no history, trigger greeting
    if (this.isAiOpen() && this.chatHistory().length === 0) {
      this.isAiThinking.set(true);
      setTimeout(() => {
        this.isAiThinking.set(false);
        this.addAiMessage(`EcoScout AI initialized. I can analyze waste trends, suggest patrol routes, or answer ecology questions.`);
      }, 1000);
    }
  }

  async sendToAi(message: string) {
    if (!message.trim()) return;

    // Add User Message
    this.chatHistory.update(h => [...h, { role: 'user', text: message, timestamp: new Date() }]);
    this.isAiThinking.set(true);

    try {
      // Simulate "Thinking" time for realism
      await new Promise(resolve => setTimeout(resolve, 800)); // Minimum UI delay

      const response = await this.geminiService.chat(message);
      this.isAiThinking.set(false);
      this.addAiMessage(response);
    } catch (e) {
      this.isAiThinking.set(false);
      this.addAiMessage("Connection interrupted. Please retry.");
    }
  }

  private addAiMessage(fullText: string) {
    const newMessage: ChatMessage = { role: 'ai', text: '', timestamp: new Date(), isTyping: true };
    this.chatHistory.update(h => [...h, newMessage]);

    this.typewriteResponse(fullText, this.chatHistory().length - 1);
  }

  private typewriteResponse(fullText: string, msgIndex: number) {
    const words = fullText.split(' ');
    let i = 0;
    const speed = 10; // Optimized typing speed

    const type = () => {
      if (i < words.length) {
        // Render 2-3 words at a time to reduce thread blocking
        let chunk = '';
        const limit = Math.min(i + 2, words.length);
        for (; i < limit; i++) {
          chunk += (i > 0 ? ' ' : '') + words[i];
        }

        this.chatHistory.update(history => {
          const newHistory = [...history];
          if (newHistory[msgIndex]) {
            newHistory[msgIndex] = {
              ...newHistory[msgIndex],
              text: newHistory[msgIndex].text + chunk
            };
          }
          return newHistory;
        });

        this.typeWriterTimeout = setTimeout(type, speed);
      } else {
        // Done typing
        this.chatHistory.update(history => {
          const newHistory = [...history];
          if (newHistory[msgIndex]) {
            newHistory[msgIndex].isTyping = false;
          }
          return newHistory;
        });
      }
    };
    type();
  }

  async handleImageCapture(imageBase64: string) {
    this.capturedImage.set(imageBase64);
    this.isProcessing.set(true);

    // Reset History Mode
    this.isHistoryView.set(false);
    this.currentHistoryId.set(null);

    const serviceLoc = this.game.userLocation();
    if (serviceLoc) {
      this.currentScanLocation = { lat: serviceLoc.lat, lng: serviceLoc.lng };
    } else {
      this.currentScanLocation = undefined;
    }

    try {
      const context = {
        timestamp: new Date(),
        activity: this.game.currentActivity(),
        lat: this.currentScanLocation?.lat,
        lng: this.currentScanLocation?.lng
      };

      const result = await this.geminiService.analyzeImage(imageBase64, context);
      this.scanResult.set(result);
    } catch (e: any) {
      console.error(e);
      this.game.showToast('Failed to analyze image. Please try again.', 'error');
      this.capturedImage.set(null);
    } finally {
      this.isProcessing.set(false);
    }
  }

  // Called when user clicks a history item in Dashboard
  openHistoryItem(scan: ScanRecord) {
    this.scanResult.set(scan);
    this.capturedImage.set(scan.imageThumbnail);
    this.isHistoryView.set(true);
    this.currentHistoryId.set(scan.id);
    this.currentUpcycleClaimed.set(!!scan.upcycleBonusClaimed);
  }

  claimPoints(type: ClaimType) {
    if (this.scanResult() && this.capturedImage()) {
      this.game.addScan(
        this.scanResult()!,
        this.capturedImage()!,
        type,
        this.currentScanLocation
      );
      this.closeModal();
    }
  }

  handleUpcycleClaim() {
    if (this.currentHistoryId()) {
      this.game.claimUpcycleBonus(this.currentHistoryId()!);
      this.currentUpcycleClaimed.set(true); // Update local UI immediately
    }
  }

  closeModal() {
    this.scanResult.set(null);
    this.capturedImage.set(null);
    this.isHistoryView.set(false);
    this.currentHistoryId.set(null);
  }

  navTo(view: ViewState) {
    this.currentView.set(view);
  }

  handleSplashFinish() {
    this.navTo(this.game.hasOnboarded() ? 'dashboard' : 'landing');
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