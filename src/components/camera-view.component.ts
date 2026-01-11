import { Component, ElementRef, ViewChild, output, signal, OnDestroy, AfterViewInit, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';
import { GeminiService, WasteAnalysis } from '../services/gemini.service';

type ScanMode = 'active' | 'passive';

interface PassiveItem {
  analysis: WasteAnalysis;
  image: string;
  timestamp: Date;
  location?: { lat: number; lng: number };
}

@Component({
  selector: 'app-camera-view',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative h-full w-full bg-black overflow-hidden flex flex-col items-center justify-center">
      <!-- Camera Feed -->
      <video #videoElement autoplay playsinline muted class="absolute inset-0 w-full h-full object-cover opacity-80"></video>
      
      <!-- Fallback / Error UI (Upload Mode) -->
      @if (cameraError()) {
        <div class="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 animate-fade-in">
           <!-- Close Button -->
           <button (click)="close.emit()" class="absolute top-4 right-4 text-slate-400 hover:text-white p-2 transition-colors rounded-full hover:bg-slate-800">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>

           <div class="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(239,68,68,0.2)] border border-slate-800 relative">
             <span class="text-5xl opacity-50">📷</span>
             <div class="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-1.5 border-4 border-slate-950">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </div>
           </div>
           
           <h3 class="text-white font-bold text-2xl mb-3 tracking-tight">Camera Unavailable</h3>
           <p class="text-slate-400 text-center max-w-xs mb-8 leading-relaxed text-sm">
             @if (permissionDenied()) {
                Access was denied. Please check your browser settings or try uploading a photo instead.
             } @else {
                We couldn't access the camera stream. You can still analyze waste by uploading a photo.
             }
           </p>

           <div class="w-full max-w-xs space-y-3">
             <label class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/40 group">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 Select Photo to Scan
                 <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
             </label>

             <button (click)="startCamera()" class="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-xl transition-colors border border-slate-700">
               Retry Camera
             </button>
           </div>
        </div>
      }

      <!-- UI Overlays (Only visible when no error) -->
      @if (!cameraError()) {
        
        <!-- Mode Switcher (Top Left) -->
        @if (!passiveSessionActive() && !showPassiveSummary()) {
          <div class="absolute top-6 left-6 z-40 bg-slate-900/80 backdrop-blur rounded-full p-1 border border-slate-700 flex">
             <button (click)="setMode('active')" 
                     class="px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-all"
                     [class.bg-emerald-500]="mode() === 'active'"
                     [class.text-white]="mode() === 'active'"
                     [class.text-slate-400]="mode() === 'active'">
                Active
             </button>
             <button (click)="setMode('passive')" 
                     class="px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-all"
                     [class.bg-indigo-500]="mode() === 'passive'"
                     [class.text-white]="mode() === 'passive'"
                     [class.text-slate-400]="mode() === 'active'">
                Auto Scan
             </button>
          </div>
        }

        <!-- Fitness Mode Badge -->
        <div class="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur rounded-full border border-slate-700">
          <span class="text-xl">
            @if (game.currentActivity() === 'Running') { 🏃 }
            @else if (game.currentActivity() === 'Cycling') { 🚴 }
            @else { 🚶 }
          </span>
          <div class="flex flex-col">
            <span class="text-white text-xs font-bold uppercase tracking-wider">{{ game.currentActivity() }} Mode</span>
            <span class="text-emerald-400 text-[10px] font-mono">{{ game.activityMultiplier() }}x Point Multiplier Active</span>
          </div>
        </div>

        <!-- ACTIVE MODE UI -->
        @if (mode() === 'active') {
          <!-- Scanner Reticle -->
          <div class="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div class="w-64 h-64 border-2 border-emerald-400/50 rounded-lg relative bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
              <div class="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1"></div>
              <div class="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1"></div>
              <div class="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1"></div>
              <div class="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1"></div>
              
              <!-- Scanning Line Animation -->
              <div class="absolute top-0 left-0 w-full h-1 bg-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-scan"></div>
              
              <!-- Guide Text -->
              <div class="absolute -bottom-8 w-full text-center text-white/80 text-xs font-mono uppercase tracking-widest text-shadow">
                Place waste in center
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="absolute bottom-24 w-full flex justify-center items-center z-20 gap-8">
            <button (click)="switchCamera()" class="p-3 bg-slate-800/60 backdrop-blur rounded-full text-white hover:bg-slate-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button (click)="capture()" class="relative group">
              <div class="absolute inset-0 bg-emerald-500 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
              <div class="w-20 h-20 bg-white rounded-full border-4 border-slate-900 flex items-center justify-center relative z-10 active:scale-95 transition transform">
                <div class="w-16 h-16 bg-emerald-500 rounded-full"></div>
              </div>
            </button>

            <label class="p-3 bg-slate-800/60 backdrop-blur rounded-full text-white hover:bg-slate-700 transition cursor-pointer">
               <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </label>
          </div>
        }

        <!-- PASSIVE MODE UI -->
        @if (mode() === 'passive') {
          
          @if (!passiveSessionActive() && !showPassiveSummary()) {
             <!-- Passive Start Screen -->
             <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 backdrop-blur-[2px]">
                <div class="text-center max-w-xs space-y-4">
                  <div class="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                     <span class="text-4xl">🤖</span>
                  </div>
                  <h2 class="text-2xl font-bold text-white">Scout Auto-Mode</h2>
                  <p class="text-indigo-200 text-sm">
                    AI will automatically detect waste while you move. 
                    <br><span class="text-xs opacity-70">GPS Movement required to trigger scan.</span>
                  </p>
                  @if (game.locationError()) {
                     <p class="text-red-400 text-xs bg-red-900/20 p-2 rounded border border-red-500/20">
                       GPS Signal Lost. Passive mode will not trigger.
                     </p>
                  }
                  <button (click)="startPassiveSession()" 
                          class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl w-full shadow-lg transition-transform active:scale-95"
                          [disabled]="!!game.locationError()"
                          [class.opacity-50]="!!game.locationError()">
                    START RUN
                  </button>
                </div>
             </div>
          }

          @if (passiveSessionActive()) {
            <!-- Passive Running Overlay -->
            <div class="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6">
               <!-- Top Status -->
               <div class="mt-20 self-center bg-black/60 backdrop-blur rounded-lg px-6 py-3 border border-indigo-500/30 flex items-center gap-4">
                  <div class="flex flex-col items-center">
                     <span class="text-xs text-indigo-300 font-bold uppercase">Items Found</span>
                     <span class="text-2xl text-white font-black">{{ passiveItems().length }}</span>
                  </div>
                  <div class="h-8 w-px bg-slate-600"></div>
                  <div class="flex flex-col items-center">
                     <span class="text-xs text-indigo-300 font-bold uppercase">Status</span>
                     <span class="text-white font-mono text-sm animate-pulse">
                        {{ isScanningBackground() ? 'ANALYZING...' : (hasMovedEnough() ? 'READY' : 'WAITING FOR MOVEMENT') }}
                     </span>
                  </div>
               </div>

               <!-- Bottom Stop Button -->
               <div class="pointer-events-auto self-center mb-8">
                  <button (click)="stopPassiveSession()" class="group relative flex items-center justify-center">
                     <div class="absolute inset-0 bg-red-500 rounded-full blur opacity-40 group-hover:opacity-60 transition"></div>
                     <div class="w-20 h-20 bg-white rounded-full border-4 border-slate-900 flex items-center justify-center relative z-10">
                        <div class="w-8 h-8 bg-red-500 rounded shadow-sm"></div>
                     </div>
                  </button>
                  <div class="text-center text-red-400 text-xs font-bold mt-2 uppercase tracking-widest">Stop Run</div>
               </div>
            </div>
          }

          @if (showPassiveSummary()) {
             <!-- Passive Summary Modal -->
             <div class="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-6 animate-fade-in">
                <h2 class="text-2xl font-bold text-white mb-2">Session Complete</h2>
                <p class="text-slate-400 text-sm mb-6">Here is what the Scout AI found during your run.</p>

                <div class="flex-1 overflow-y-auto space-y-3 mb-6">
                   @if (passiveItems().length === 0) {
                      <div class="text-center text-slate-500 mt-10 p-6 border border-slate-800 border-dashed rounded-xl">
                         No waste detected this time.
                      </div>
                   } @else {
                      @for (item of passiveItems(); track item.timestamp) {
                         <div class="bg-slate-900 border border-slate-800 rounded-lg p-3 flex gap-3 items-center">
                            <img [src]="item.image" class="w-16 h-16 object-cover rounded bg-slate-800">
                            <div class="flex-1">
                               <div class="text-white font-bold text-sm">{{ item.analysis.wasteType }}</div>
                               <div class="text-xs text-slate-400">{{ item.analysis.recyclingGuidance.category }}</div>
                               <div class="flex gap-2 mt-1">
                                  @for (mat of item.analysis.materialComposition; track mat) {
                                     <span class="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">{{ mat }}</span>
                                  }
                               </div>
                            </div>
                            <div class="text-emerald-400 font-bold">+{{ item.analysis.points }}</div>
                         </div>
                      }
                   }
                </div>

                <div class="grid grid-cols-2 gap-4">
                   <button (click)="discardSession()" class="py-3 rounded-xl border border-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-900">
                      Discard
                   </button>
                   <button (click)="claimSession()" class="py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 shadow-lg shadow-emerald-900/50">
                      Claim {{ sessionTotalPoints() }} XP
                   </button>
                </div>
             </div>
          }
        }
      }
    </div>
  `,
  styles: [`
    @keyframes scan {
      0% { top: 0%; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    .animate-scan {
      animation: scan 2s linear infinite;
    }
    .text-shadow {
      text-shadow: 0 2px 4px rgba(0,0,0,0.8);
    }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fade-in 0.3s ease-out; }
  `]
})
export class CameraViewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  imageCaptured = output<string>();
  close = output<void>(); 
  
  game = inject(GameService);
  private gemini = inject(GeminiService);

  // States
  mode = signal<ScanMode>('active');
  cameraError = signal(false);
  permissionDenied = signal(false);
  
  // Passive Mode States
  passiveSessionActive = signal(false);
  showPassiveSummary = signal(false);
  isScanningBackground = signal(false); // Gemini is thinking
  passiveItems = signal<PassiveItem[]>([]);
  
  // Computed
  sessionTotalPoints = computed(() => this.passiveItems().reduce((acc, i) => acc + i.analysis.points, 0));
  
  // Movement Logic
  private lastScanLocation: { lat: number, lng: number } | null = null;
  hasMovedEnough = signal(false); 
  
  private stream: MediaStream | null = null;
  private facingMode: 'user' | 'environment' = 'environment';
  private passiveIntervalId: any;

  ngAfterViewInit() {
    this.startCamera();
  }

  ngOnDestroy() {
    this.stopCamera();
    this.stopPassiveSession();
  }

  setMode(m: ScanMode) {
    this.mode.set(m);
    if (m === 'active') {
      this.stopPassiveSession();
      this.showPassiveSummary.set(false);
    }
  }

  startPassiveSession() {
    this.passiveSessionActive.set(true);
    this.passiveItems.set([]);
    this.lastScanLocation = null;
    this.hasMovedEnough.set(false);
    
    // Check loop every 2 seconds
    this.passiveIntervalId = setInterval(() => {
       this.checkPassiveTrigger();
    }, 2000);
  }

  stopPassiveSession() {
    if (this.passiveIntervalId) {
      clearInterval(this.passiveIntervalId);
    }
    if (this.passiveSessionActive()) {
       this.passiveSessionActive.set(false);
       this.showPassiveSummary.set(true);
    }
  }

  discardSession() {
    this.showPassiveSummary.set(false);
    this.passiveItems.set([]);
  }

  claimSession() {
    this.game.addPassiveBatch(this.passiveItems());
    this.showPassiveSummary.set(false);
    this.passiveItems.set([]);
    this.setMode('active'); // Return to active mode
  }

  private checkPassiveTrigger() {
    if (this.isScanningBackground()) return;

    // STRICT: Check Movement
    const currentLoc = this.game.userLocation();
    
    // If no GPS, we cannot determine movement in production grade. 
    // We do NOT fallback to time. We simply wait.
    if (!currentLoc) {
       this.hasMovedEnough.set(false);
       return;
    }
    
    if (!this.lastScanLocation) {
       // First scan of the session is allowed immediately if we have GPS
       this.hasMovedEnough.set(true);
    } else {
       const dist = this.getDistanceFromLatLonInMeters(
          this.lastScanLocation.lat, this.lastScanLocation.lng,
          currentLoc.lat, currentLoc.lng
       );
       // Threshold: 10 meters
       this.hasMovedEnough.set(dist > 10);
    }

    if (this.hasMovedEnough()) {
       this.triggerBackgroundScan(currentLoc);
    }
  }

  private async triggerBackgroundScan(location: {lat: number, lng: number} | null) {
     this.isScanningBackground.set(true);
     
     const imageBase64 = this.captureFrameSilent();
     if (!imageBase64) {
        this.isScanningBackground.set(false);
        return;
     }

     try {
       const analysis = await this.gemini.analyzeImage(imageBase64, {
         activity: this.game.currentActivity(),
         lat: location?.lat,
         lng: location?.lng
       });

       if (analysis.confidence > 55 && analysis.wasteType !== 'Unidentified') {
          const newItem: PassiveItem = {
             analysis,
             image: imageBase64,
             timestamp: new Date(),
             location: location || undefined
          };
          this.passiveItems.update(items => [...items, newItem]);
          
          if (location) {
             this.lastScanLocation = location;
             this.hasMovedEnough.set(false); 
          }
       }
     } catch (err) {
       console.warn('Passive scan failed', err);
     } finally {
       this.isScanningBackground.set(false);
     }
  }

  async startCamera() {
    this.stopCamera(); 
    this.cameraError.set(false);
    this.permissionDenied.set(false);
    
    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraError.set(true);
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: this.facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.permissionDenied.set(true);
        this.cameraError.set(true);
        return;
      }
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (finalErr: any) {
        this.cameraError.set(true);
        return;
      }
    }

    if (this.videoElement && this.stream) {
      this.videoElement.nativeElement.srcObject = this.stream;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement?.nativeElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
  }

  switchCamera() {
    this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    this.startCamera();
  }

  capture() {
    const dataUrl = this.captureFrameSilent();
    if (dataUrl) {
       this.imageCaptured.emit(dataUrl);
    }
  }

  private captureFrameSilent(): string | null {
    if (!this.videoElement) return null;
    const video = this.videoElement.nativeElement;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    const minDim = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - minDim) / 2;
    const sy = (video.videoHeight - minDim) / 2;
    const targetDim = 512; 

    const canvas = document.createElement('canvas');
    canvas.width = targetDim;
    canvas.height = targetDim;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, targetDim, targetDim);

    return canvas.toDataURL('image/jpeg', 0.92);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.imageCaptured.emit(e.target.result as string);
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  private getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; 
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI/180);
  }
}