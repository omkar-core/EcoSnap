import { Injectable, signal, computed, effect } from '@angular/core';
import { WasteAnalysis, ActivityType } from './gemini.service';

export type ClaimType = 'scout' | 'cleanup';
export type MessageType = 'error' | 'success' | 'info';

export interface SystemMessage {
  type: MessageType;
  text: string;
}

export interface ScanRecord extends WasteAnalysis {
  id: string;
  timestamp: Date;
  imageThumbnail: string;
  upcycleBonusClaimed?: boolean;
  activityMode: ActivityType;
  claimType: ClaimType;
  basePoints: number;
  fitnessBonus: number;
  cleanupBonus: number;
  location?: { lat: number; lng: number };
}

export interface Zone {
  id: string; // Changed to string for Geohash-like ID
  name: string;
  health: number; // 0-100
  isBossActive: boolean; 
  contributionCount: number;
  lat: number;
  lng: number;
}

export interface LeaderboardEntry {
  name: string;
  points: number;
  rank: number;
  ward: string;
  isUser: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // Persistence Keys
  private readonly KEYS = {
    POINTS: 'swh_points',
    WEIGHT: 'swh_weight',
    STREAK: 'swh_streak',
    HISTORY: 'swh_history',
    ZONES: 'swh_real_zones', 
    USERNAME: 'swh_username',
    DEVICE_ID: 'swh_device_id',
    ONBOARDED: 'swh_onboarded'
  };

  private readonly FALLBACK_LOCATION = { lat: 19.0760, lng: 72.8777 }; // Mumbai, India (Fallback)

  // Activity State
  readonly currentActivity = signal<ActivityType>('Walking');
  readonly userLocation = signal<{ lat: number, lng: number } | null>(null);
  readonly currentAddress = signal<string>('Waiting for GPS...'); 
  readonly isFallbackLocation = signal<boolean>(false);
  
  // User Profile
  readonly username = signal<string>(this.load(this.KEYS.USERNAME, 'Scout'));
  readonly deviceId = signal<string>(this.load(this.KEYS.DEVICE_ID, this.generateUUID()));
  readonly hasOnboarded = signal<boolean>(this.load(this.KEYS.ONBOARDED, false));

  // Global Notification States
  readonly locationError = signal<string | null>(null);
  readonly systemMessage = signal<SystemMessage | null>(null);
  
  readonly activityMultiplier = computed(() => {
    switch (this.currentActivity()) {
      case 'Running': return 1.5;
      case 'Cycling': return 1.2;
      case 'Walking': default: return 1.0;
    }
  });

  // Core State
  readonly totalPoints = signal<number>(this.load(this.KEYS.POINTS, 0));
  readonly totalWasteWeight = signal<number>(this.load(this.KEYS.WEIGHT, 0)); // grams
  readonly streakDays = signal<number>(this.load(this.KEYS.STREAK, 0));
  
  readonly scanHistory = signal<ScanRecord[]>(this.loadHistory());
  
  readonly level = computed(() => Math.floor(this.totalPoints() / 500) + 1);
  readonly nextLevelProgress = computed(() => {
    const currentLevelBase = (this.level() - 1) * 500;
    const pointsInLevel = this.totalPoints() - currentLevelBase;
    return (pointsInLevel / 500) * 100;
  });

  // Zone Data: NOW STRICTLY REAL (with fallback support)
  readonly zones = signal<Zone[]>(this.loadZones());

  readonly neighborhoodHealth = computed(() => {
    if (this.zones().length === 0) return 100; // Default until pollution found
    const total = this.zones().reduce((acc, z) => acc + z.health, 0);
    return Math.round(total / this.zones().length);
  });

  readonly currentZone = computed(() => {
    const loc = this.userLocation();
    if (!loc) return null;
    
    // Find zone matching current grid
    const zoneId = this.generateZoneId(loc.lat, loc.lng);
    return this.zones().find(z => z.id === zoneId) || null;
  });

  readonly weeklyImpactStory = computed(() => {
    const weightKg = (this.totalWasteWeight() / 1000).toFixed(1);
    const scans = this.scanHistory().length;
    if (scans === 0) return "Start your hunt to generate your urban impact story.";
    return `You've documented ${weightKg}kg of artifacts. By verifying cleanup for ${scans} items, you are actively healing your environment.`;
  });

  private watchId: number | null = null;

  constructor() {
    this.setupPersistence();
    this.initLocation();

    // Address Resolution Effect
    effect(() => {
      const loc = this.userLocation();
      if (loc) {
        if (!this.isFallbackLocation()) {
           this.resolveAddress(loc.lat, loc.lng);
        } else {
           this.currentAddress.set('Mumbai, India (Estimated)');
        }
        this.ensureCurrentZone(loc.lat, loc.lng);
      }
    });
  }

  updateUsername(newName: string) {
    const cleaned = newName.trim().substring(0, 15) || 'Scout';
    this.username.set(cleaned);
    this.safeSave(this.KEYS.USERNAME, cleaned);
  }

  completeOnboarding() {
    this.hasOnboarded.set(true);
    this.safeSave(this.KEYS.ONBOARDED, true);
  }

  private setupPersistence() {
    effect(() => this.safeSave(this.KEYS.POINTS, this.totalPoints()));
    effect(() => this.safeSave(this.KEYS.WEIGHT, this.totalWasteWeight()));
    effect(() => this.safeSave(this.KEYS.STREAK, this.streakDays()));
    effect(() => this.safeSave(this.KEYS.HISTORY, this.scanHistory()));
    effect(() => this.safeSave(this.KEYS.ZONES, this.zones()));
  }

  // --- DYNAMIC ZONE DISCOVERY (REAL DATA) ---
  private generateZoneId(lat: number, lng: number): string {
    // Grid Precision: ~1.1km
    return `${lat.toFixed(2)}_${lng.toFixed(2)}`;
  }

  private ensureCurrentZone(lat: number, lng: number) {
    const zoneId = this.generateZoneId(lat, lng);
    const exists = this.zones().some(z => z.id === zoneId);

    if (!exists) {
      // Create new zone for this real location
      const newZone: Zone = {
        id: zoneId,
        name: `Sector ${zoneId.replace('_', ':')}`, // Temporary name until address resolves
        health: 50, // Start neutral
        isBossActive: false, // No fake bosses
        contributionCount: 0,
        lat: lat,
        lng: lng
      };
      this.zones.update(prev => [...prev, newZone]);
    }
  }

  // --- ADDRESS LOGIC ---
  private async resolveAddress(lat: number, lng: number) {
    this.currentAddress.set('Locating precise address...');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        signal: AbortSignal.timeout(15000) // 15s timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        const addr = data.address;
        if (addr) {
           const parts = [
              addr.road || addr.pedestrian || addr.park || addr.building,
              addr.suburb || addr.neighbourhood || addr.residential,
              addr.city || addr.town || addr.village
           ].filter(Boolean);
           
           const addressStr = parts.slice(0, 2).join(', ');
           if (addressStr) {
              this.currentAddress.set(addressStr);
              // Update Zone Name with Real Data
              const zoneId = this.generateZoneId(lat, lng);
              this.zones.update(zones => zones.map(z => {
                if (z.id === zoneId) {
                  return { ...z, name: parts[1] || parts[0] || z.name };
                }
                return z;
              }));
              return;
           }
        }
      }
      this.currentAddress.set(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } catch (e) {
      // Graceful fallback without noisy errors
      this.currentAddress.set(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  }

  // --- NOTIFICATION SYSTEM ---
  showToast(text: string, type: MessageType = 'info') {
    this.systemMessage.set({ text, type });
    setTimeout(() => {
      const current = this.systemMessage();
      if (current && current.text === text) {
        this.systemMessage.set(null);
      }
    }, 4000);
  }

  dismissToast() {
    this.systemMessage.set(null);
  }

  // --- LOCATION LOGIC (STRICT WITH FALLBACK) ---
  private initLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
       this.handleGeoError(2);
       return;
    }
    this.startWatchingPosition();
  }

  retryLocation() {
    this.locationError.set(null);
    this.currentAddress.set('Retrying GPS...');
    this.isFallbackLocation.set(false);
    this.startWatchingPosition();
  }

  private startWatchingPosition() {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.updateUserLocation(pos.coords.latitude, pos.coords.longitude);
        this.locationError.set(null);
        this.isFallbackLocation.set(false);
      },
      (err) => this.handleGeoError(err.code),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 } // 30s timeout
    );
  }

  private handleGeoError(code: number) {
     let msg = 'GPS signal lost.';
     let isWarning = false;

     if (code === 1) { 
       msg = 'Location permission denied.'; 
       isWarning = true;
     }
     else if (code === 2) msg = 'GPS signal unavailable.';
     else if (code === 3) msg = 'Location request timed out.';

     // Only log warnings for permission issues, info for timeouts to keep console clean
     if (isWarning) {
       console.warn(`${msg} Switching to Fallback Location.`);
     } else {
       console.info(`${msg} Switching to Fallback Location.`);
     }
     
     // Set Error but ALLOW usage via fallback
     this.locationError.set(`${msg} Using estimated location.`);
     
     // Fallback to Mumbai to allow app analysis to function
     this.isFallbackLocation.set(true);
     this.updateUserLocation(this.FALLBACK_LOCATION.lat, this.FALLBACK_LOCATION.lng);
  }

  dismissLocationError() {
    this.locationError.set(null);
  }

  setActivity(mode: ActivityType) {
    this.currentActivity.set(mode);
  }

  updateUserLocation(lat: number, lng: number) {
    this.userLocation.set({ lat, lng });
  }

  addScan(analysis: WasteAnalysis, imageBase64: string, claimType: ClaimType, location?: { lat: number, lng: number }) {
    const actMultiplier = this.activityMultiplier();
    const baseValue = analysis.points;
    const cleanupBonusPoints = claimType === 'cleanup' ? baseValue : 0; 
    const combinedBase = baseValue + cleanupBonusPoints;
    const fitnessBonus = Math.round(combinedBase * (actMultiplier - 1));
    const totalScanPoints = combinedBase + fitnessBonus;

    const record: ScanRecord = {
      ...analysis,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      imageThumbnail: imageBase64,
      upcycleBonusClaimed: false,
      activityMode: this.currentActivity(),
      claimType: claimType,
      basePoints: baseValue,
      cleanupBonus: cleanupBonusPoints,
      fitnessBonus: fitnessBonus,
      points: totalScanPoints,
      location: location
    };

    this.scanHistory.update(history => [record, ...history]);
    this.totalPoints.update(p => p + totalScanPoints);
    
    if (claimType === 'cleanup') {
      this.totalWasteWeight.update(w => w + (analysis.estimatedWeight || 0));
    }
    
    // Only heal if we have a valid location to map to a zone
    if (location || this.userLocation()) {
      this.healZone(claimType, analysis, location);
    }
    
    this.showToast(`+${totalScanPoints} Points!`, 'success');
  }

  addPassiveBatch(items: { analysis: WasteAnalysis, image: string, location?: {lat: number, lng: number} }[]) {
    let totalBatchPoints = 0;
    items.forEach(item => {
      this.addScan(item.analysis, item.image, 'scout', item.location);
      totalBatchPoints += item.analysis.points;
    });
    
    if (items.length > 0) {
      this.showToast(`Batch Complete: +${totalBatchPoints} Points`, 'success');
    }
  }

  // --- ZONE HEALING LOGIC (REAL) ---
  private healZone(claimType: ClaimType, analysis: WasteAnalysis, location?: { lat: number, lng: number }) {
    const loc = location || this.userLocation();
    if (!loc) return;

    const zoneId = this.generateZoneId(loc.lat, loc.lng);

    // Calculate Impact based on REAL item properties
    let impact = claimType === 'cleanup' ? 10 : 2; 

    if (claimType === 'cleanup') {
      if (analysis.riskLevel === 'High') impact += 20; 
      else if (analysis.riskLevel === 'Medium') impact += 10;
      
      if (analysis.condition === 'Degraded/Weathered') impact += 15;
      
      if (analysis.estimatedWeight && analysis.estimatedWeight > 500) {
        impact += 5;
      }
    }

    this.zones.update(zones => {
      return zones.map(z => {
        if (z.id === zoneId) {
          const newHealth = Math.min(100, z.health + impact);
          return {
            ...z,
            health: newHealth,
            contributionCount: z.contributionCount + 1
          };
        }
        return z;
      });
    });
  }

  claimUpcycleBonus(scanId: string) {
    const bonusPoints = 50;
    this.scanHistory.update(history => 
      history.map(scan => {
        if (scan.id === scanId && !scan.upcycleBonusClaimed) {
          return { ...scan, upcycleBonusClaimed: true };
        }
        return scan;
      })
    );
    this.totalPoints.update(p => p + bonusPoints);
    this.showToast(`Upcycling Idea Claimed: +${bonusPoints} Points`, 'success');
  }

  getLeaderboard(): LeaderboardEntry[] {
    // STRICT REAL DATA: Only show users stored in the system.
    const entries: LeaderboardEntry[] = [{
      name: this.username(),
      points: this.totalPoints(),
      ward: this.currentZone()?.name || 'Unknown Sector',
      isUser: true,
      rank: 1
    }];

    return entries;
  }

  private load<T>(key: string, defaultVal: T): T {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultVal;
      }
      return defaultVal;
    } catch (e) {
      console.warn(`Failed to load ${key}`, e);
      return defaultVal;
    }
  }

  private loadZones(): Zone[] {
     // No mock data generation. Start empty.
     return this.load<Zone[]>(this.KEYS.ZONES, []);
  }

  private safeSave(key: string, value: any) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn(`Failed to save ${key}`, e);
    }
  }

  private loadHistory(): ScanRecord[] {
    const data = this.load<ScanRecord[]>(this.KEYS.HISTORY, []);
    return data.map(d => ({ ...d, timestamp: new Date(d.timestamp) }));
  }

  private generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'user-' + Math.random().toString(36).substring(2, 9);
  }
}