import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService, WasteAnalysis } from './services/gemini.service';
import { GameService, ClaimType, ScanRecord } from './services/game.service';
import { CameraViewComponent } from './components/camera-view.component';
import { DashboardViewComponent } from './components/dashboard-view.component';
import { ScanResultComponent } from './components/scan-result.component';
import { TeamViewComponent } from './components/team-view.component';
import { LandingViewComponent } from './components/landing-view.component';

type ViewState = 'dashboard' | 'camera' | 'team' | 'landing';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    CameraViewComponent, 
    DashboardViewComponent, 
    ScanResultComponent, 
    TeamViewComponent,
    LandingViewComponent
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
  `]
})
export class AppComponent {
  private geminiService = inject(GeminiService);
  game = inject(GameService);

  currentView = signal<ViewState>(this.game.hasOnboarded() ? 'dashboard' : 'landing');
  isProcessing = signal(false);
  scanResult = signal<WasteAnalysis | null>(null);
  capturedImage = signal<string | null>(null);
  
  // History View State
  isHistoryView = signal(false);
  currentHistoryId = signal<string | null>(null);
  currentUpcycleClaimed = signal(false);

  private currentScanLocation: { lat: number, lng: number } | undefined;

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
    } catch (e) {
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
}