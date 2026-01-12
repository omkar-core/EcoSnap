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

// 5-Tier System
export type ZoneStatus = 'Critical' | 'Dirty' | 'Moderate' | 'Clean' | 'Pristine';

// Extended Tree Model
export type TreeStage = 'Seedling' | 'Growing' | 'Mature' | 'Forest';
export type PlantationMode = 'self' | 'community' | 'sponsored';

export interface Tree {
  id: string;
  species: string; // 'Neem', 'Banyan', etc.
  plantedAt: Date;
  location: { lat: number; lng: number };
  ownerName: string;
  zoneId: string;
  mode: PlantationMode;
  
  // Lifecycle
  stage: TreeStage;
  health: number; // 0-100
  lastWatered: Date;
  
  // Impact
  co2Offset: number; // kg (calculated dynamically)
}

// REDESIGNED DATA MODEL
export interface Zone {
  id: string; // Lat_Lng identifier
  name: string;
  health: number; // 0-100 (Combined Metric)
  status: ZoneStatus;
  lat: number;
  lng: number;
  predictionTrend: 'improving' | 'decaying' | 'stable';
  
  // Ecology Data (The Green Layer)
  greenLayer: {
    treeCount: number;
    plantableSpots: number;
    co2Offset: number;
    forestCoverage: number; // 0-100
  };

  // Waste & Maintenance Data (The Waste Layer)
  wasteLayer: {
    decayRate: number;
    lastCleaned?: Date;
    lastDecay?: Date;
    contributionCount: number;
    isBossActive: boolean; 
  };

  // RPG & Social Data (Gamification)
  gamification: {
    ownerName?: string; 
    teamTerritory?: string;
    zoneLevel: number; // Zone Rank 1-5
  };
}

export interface LeaderboardEntry {
  name: string;
  points: number;
  rank: number;
  ward: string;
  isUser: boolean;
  title: string; 
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
    ZONES: 'swh_real_zones_v8', // Bumped version for new nested structure
    TREES: 'swh_trees_v2',     
    GREEN_CREDITS: 'swh_credits',
    USERNAME: 'swh_username',
    DEVICE_ID: 'swh_device_id',
    ONBOARDED: 'swh_onboarded',
    LOCATION: 'swh_last_location' // Added for location caching
  };

  // Fallback Location (Mumbai) for when GPS fails/denied
  private readonly FALLBACK_LOCATION = { lat: 19.0760, lng: 72.8777 };

  // Plantation Config
  readonly SPECIES_RATES: Record<string, number> = {
    "Neem": 20, "Banyan": 35, "Peepal": 30, "Mango": 25, "Eucalyptus": 22
  };
  
  readonly PLANTATION_COSTS: Record<PlantationMode, number> = {
    'self': 50,
    'community': 30,
    'sponsored': 0
  };

  // Activity State
  readonly currentActivity = signal<ActivityType>('Walking');
  
  // Initialize location from cache if available
  readonly userLocation = signal<{ lat: number, lng: number } | null>(this.load(this.KEYS.LOCATION, null));
  readonly currentAddress = signal<string>('Waiting for GPS...'); 
  
  // Navigation State
  readonly navigationTarget = signal<Zone | null>(null);

  // User Profile
  readonly username = signal<string>(this.load(this.KEYS.USERNAME, 'Operator'));
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
  
  readonly greenCredits = signal<number>(this.load(this.KEYS.GREEN_CREDITS, 20)); 
  readonly trees = signal<Tree[]>(this.loadTrees());
  readonly scanHistory = signal<ScanRecord[]>(this.loadHistory());
  
  // RPG Rank System
  readonly userRank = computed(() => {
    const pts = this.totalPoints();
    if (pts > 50000) return 'City Champion';
    if (pts > 15000) return 'Zone Lord';
    if (pts > 5000) return 'Ranger';
    if (pts > 2000) return 'Guardian';
    if (pts > 500) return 'Sprout';
    return 'Seedling';
  });

  readonly nextRankProgress = computed(() => {
    const pts = this.totalPoints();
    let min = 0, max = 500;
    
    if (pts > 50000) return 100; 
    else if (pts > 15000) { min = 15000; max = 50000; }
    else if (pts > 5000) { min = 5000; max = 15000; }
    else if (pts > 2000) { min = 2000; max = 5000; }
    else if (pts > 500) { min = 500; max = 2000; }
    
    return Math.min(100, Math.max(0, ((pts - min) / (max - min)) * 100));
  });

  // Zone Data
  readonly zones = signal<Zone[]>(this.loadZones());

  readonly neighborhoodHealth = computed(() => {
    if (this.zones().length === 0) return 100;
    const total = this.zones().reduce((acc, z) => acc + z.health, 0);
    return Math.round(total / this.zones().length);
  });

  readonly currentZone = computed(() => {
    const loc = this.userLocation();
    if (!loc) return null;
    const zoneId = this.generateZoneId(loc.lat, loc.lng);
    return this.zones().find(z => z.id === zoneId) || null;
  });

  readonly totalCo2Offset = computed(() => {
    return this.trees().reduce((acc, t) => acc + t.co2Offset, 0);
  });

  readonly weeklyImpactStory = computed(() => {
    const weightKg = (this.totalWasteWeight() / 1000).toFixed(1);
    const treeCount = this.trees().length;
    const co2 = this.totalCo2Offset().toFixed(1);
    
    if (treeCount > 0) {
       return `Sector Status: RESTORATION ACTIVE. ${treeCount} trees planted. ${co2}kg CO₂ offset. Rank: ${this.userRank()}.`;
    }
    return `Sector Status: MONITORING. ${weightKg}kg debris logged. Initiate plantation protocols to offset carbon.`;
  });

  private watchId: number | null = null;
  private lastScanTime = 0;

  constructor() {
    this.setupPersistence();
    this.initLocation();
    
    this.recalculateAllZones();
    this.updateTreeLifecycle(); // Run once on load

    effect(() => {
      const loc = this.userLocation();
      if (loc) {
        this.resolveAddress(loc.lat, loc.lng);
        this.ensureCurrentZone(loc.lat, loc.lng);
        
        const target = this.navigationTarget();
        if (target) {
          const currentId = this.generateZoneId(loc.lat, loc.lng);
          if (target.id === currentId) {
             this.showToast(`TARGET REACHED: ${target.name}`, 'success');
             this.navigationTarget.set(null);
          }
        }
      }
    });
  }

  updateUsername(newName: string) {
    const cleaned = newName.trim().substring(0, 15) || 'Operator';
    this.username.set(cleaned);
    this.safeSave(this.KEYS.USERNAME, cleaned);
  }

  completeOnboarding() {
    this.hasOnboarded.set(true);
    this.safeSave(this.KEYS.ONBOARDED, true);
  }

  setNavigationTarget(zone: Zone) {
    this.navigationTarget.set(zone);
    this.showToast(`NAVIGATION SET: ${zone.name}`, 'info');
  }

  clearNavigation() {
    this.navigationTarget.set(null);
  }

  // --- PLANTATION SYSTEM ---

  plantTree(zone: Zone, species: string, mode: PlantationMode, specificLocation?: {lat: number, lng: number}) {
    const cost = this.PLANTATION_COSTS[mode];
    
    if (this.greenCredits() < cost) {
      this.showToast(`INSUFFICIENT CREDITS: Need ${cost}`, 'error');
      return;
    }
    
    if (zone.status !== 'Clean' && zone.status !== 'Pristine') {
      this.showToast(`ZONE UNSTABLE: Clean to 60%+ first`, 'error');
      return;
    }

    if (zone.greenLayer.plantableSpots <= 0) {
      this.showToast(`DENSITY LIMIT REACHED`, 'error');
      return;
    }

    // Deduct Credits
    this.greenCredits.update(c => c - cost);

    // Points Reward based on Mode
    let rewardXP = 0;
    if (mode === 'self') rewardXP = 500;
    else if (mode === 'community') rewardXP = 200;
    else rewardXP = 300;

    // Use specific location if provided, else random scatter within zone
    const location = specificLocation || {
      lat: zone.lat + (Math.random() * 0.0005 - 0.00025),
      lng: zone.lng + (Math.random() * 0.0005 - 0.00025)
    };

    // Create Tree
    const newTree: Tree = {
      id: crypto.randomUUID(),
      species: species,
      plantedAt: new Date(),
      location: location,
      ownerName: this.username(),
      zoneId: zone.id,
      mode: mode,
      stage: 'Seedling',
      health: 100,
      lastWatered: new Date(),
      co2Offset: 0.1
    };

    // Update Global Trees
    this.trees.update(t => [...t, newTree]);
    
    // Update Zone
    this.recalculateAllZones();

    this.showToast(`PLANTING SUCCESS: ${species} (+${rewardXP} XP)`, 'success');
    this.totalPoints.update(p => p + rewardXP);
  }

  waterTree(treeId: string) {
    const now = new Date();
    this.trees.update(currentTrees => 
      currentTrees.map(t => {
        if (t.id === treeId) {
           // Can only water once per 24h for reward
           const hoursSince = (now.getTime() - new Date(t.lastWatered).getTime()) / (3600 * 1000);
           if (hoursSince > 24) {
              this.showToast('IRRIGATION COMPLETE (+20 Credits)', 'success');
              this.greenCredits.update(c => c + 20);
              this.totalPoints.update(p => p + 50);
              return { ...t, lastWatered: now, health: Math.min(100, t.health + 10) };
           } else {
              this.showToast('ALREADY IRRIGATED TODAY', 'info');
              return t;
           }
        }
        return t;
      })
    );
    this.recalculateAllZones();
  }

  private updateTreeLifecycle() {
    const now = new Date();
    this.trees.update(trees => trees.map(tree => {
      const ageDays = (now.getTime() - new Date(tree.plantedAt).getTime()) / (1000 * 3600 * 24);
      
      // Update Stage
      let stage = tree.stage;
      if (ageDays > 180) stage = 'Mature';
      else if (ageDays > 30) stage = 'Growing';
      
      // Update CO2
      const baseRate = this.SPECIES_RATES[tree.species] || 20; // kg/year
      const ageFactor = Math.min(ageDays / 365, 20) / 20; // Caps at 20y
      const healthFactor = tree.health / 100;
      const annualOffset = baseRate * ageFactor * healthFactor;
      
      const newOffset = tree.co2Offset + (annualOffset / 365); // Daily increment

      // Health Decay if ignored
      const daysSinceWater = (now.getTime() - new Date(tree.lastWatered).getTime()) / (1000 * 3600 * 24);
      let newHealth = tree.health;
      if (daysSinceWater > 7) {
         newHealth = Math.max(0, tree.health - 5);
      }

      return {
        ...tree,
        stage: stage,
        co2Offset: newOffset,
        health: newHealth
      };
    }));
  }

  // --- PERSISTENCE ---

  private setupPersistence() {
    effect(() => this.safeSave(this.KEYS.POINTS, this.totalPoints()));
    effect(() => this.safeSave(this.KEYS.WEIGHT, this.totalWasteWeight()));
    effect(() => this.safeSave(this.KEYS.STREAK, this.streakDays()));
    effect(() => this.safeSave(this.KEYS.HISTORY, this.scanHistory()));
    effect(() => this.safeSave(this.KEYS.ZONES, this.zones()));
    effect(() => this.safeSave(this.KEYS.TREES, this.trees()));
    effect(() => this.safeSave(this.KEYS.GREEN_CREDITS, this.greenCredits()));
    effect(() => this.safeSave(this.KEYS.LOCATION, this.userLocation()));
  }

  // --- INTELLIGENT MAPPING SYSTEM ---
  
  private generateZoneId(lat: number, lng: number): string {
    return `${lat.toFixed(3)}_${lng.toFixed(3)}`;
  }

  private calculateZoneStatus(health: number): ZoneStatus {
    if (health >= 86) return 'Pristine';
    if (health >= 61) return 'Clean';
    if (health >= 41) return 'Moderate';
    if (health >= 21) return 'Dirty';
    return 'Critical';
  }

  private calculateZoneLevel(contributions: number): number {
    if (contributions > 100) return 5;
    if (contributions > 50) return 4;
    if (contributions > 25) return 3;
    if (contributions > 10) return 2;
    return 1;
  }

  /**
   * REFACTORED DECAY LOGIC (Industrial-Level)
   * Combines Waste Layer (Negative) and Green Layer (Positive)
   */
  private recalculateAllZones() {
    const history = this.scanHistory();
    const allTrees = this.trees();
    const now = new Date();

    this.zones.update(zones => {
      return zones.map(zone => {
         let baseHealth = 50; 
         
         const zoneScans = history.filter(h => 
            h.location && this.generateZoneId(h.location.lat, h.location.lng) === zone.id
         );
         
         const zoneTrees = allTrees.filter(t => t.zoneId === zone.id);

         // 1. Calculate Waste Layer Impact
         let netImpact = 0;
         zoneScans.forEach(scan => {
            if (scan.claimType === 'cleanup') {
               netImpact += 15; // Major boost for cleaning
            } else {
               netImpact -= 2; // Minor impact for reporting
            }
         });

         // 2. Calculate Green Layer Buff (Resilience)
         const treeBuff = zoneTrees.length * 8; 

         // 3. Last Interaction
         const lastInteraction = zoneScans.length > 0 
            ? zoneScans[0].timestamp 
            : (zone.wasteLayer?.lastDecay || new Date(now.getTime() - 86400000));

         const latestScanDate = zoneScans.length > 0
            ? zoneScans.reduce((latest, s) => s.timestamp > latest ? s.timestamp : latest, new Date(0))
            : undefined;

         const hoursSince = (now.getTime() - new Date(latestScanDate || lastInteraction).getTime()) / (1000 * 60 * 60);
         
         // 4. Dynamic Decay
         let currentProjectedHealth = baseHealth + netImpact + treeBuff;
         
         // Base Decay Rate
         let decayRatePerHour = 0.2; 
         if (currentProjectedHealth < 40) decayRatePerHour = 1.0; 
         else if (currentProjectedHealth > 80) decayRatePerHour = 0.05; 

         // Green Shield: Trees reduce decay
         const treeProtection = Math.min(0.5, zoneTrees.length * 0.1);
         decayRatePerHour = decayRatePerHour * (1 - treeProtection);

         const totalDecay = hoursSince * decayRatePerHour;

         // 5. Neglect Penalty
         let neglectPenalty = 0;
         if (hoursSince > 72) neglectPenalty = 20; 
         else if (hoursSince > 24) neglectPenalty = 5;

         // 6. Final Calculation
         let finalHealth = currentProjectedHealth - totalDecay - neglectPenalty;
         finalHealth = Math.max(0, Math.min(100, finalHealth));

         // 7. Ownership
         let owner = zone.gamification?.ownerName;
         if (finalHealth > 80 && zoneScans.length > 0) {
            owner = this.username(); 
         } else if (finalHealth < 40) {
            owner = undefined;
         }

         let trend: 'improving' | 'decaying' | 'stable' = 'stable';
         if (netImpact > totalDecay && neglectPenalty === 0) trend = 'improving';
         else if (totalDecay + neglectPenalty > 5) trend = 'decaying';

         return {
            ...zone,
            health: finalHealth,
            status: this.calculateZoneStatus(finalHealth),
            predictionTrend: trend,
            
            greenLayer: {
               treeCount: zoneTrees.length,
               plantableSpots: Math.max(0, 5 - zoneTrees.length),
               co2Offset: zoneTrees.reduce((acc, t) => acc + t.co2Offset, 0),
               forestCoverage: Math.min(100, zoneTrees.length * 20)
            },

            wasteLayer: {
               decayRate: decayRatePerHour,
               lastCleaned: latestScanDate ? new Date(latestScanDate) : undefined,
               lastDecay: new Date(),
               contributionCount: zoneScans.length,
               isBossActive: zone.wasteLayer?.isBossActive ?? (Math.random() < 0.05)
            },

            gamification: {
               ownerName: owner,
               zoneLevel: this.calculateZoneLevel(zoneScans.length),
               teamTerritory: owner ? 'Rangers' : undefined
            }
         };
      });
    });
  }

  private ensureCurrentZone(lat: number, lng: number) {
    const zoneId = this.generateZoneId(lat, lng);
    const exists = this.zones().some(z => z.id === zoneId);

    if (!exists) {
      const newZone: Zone = {
        id: zoneId,
        name: `Sector ${zoneId.slice(-4)}`, 
        health: 50,
        status: 'Moderate',
        lat: Number(lat.toFixed(3)),
        lng: Number(lng.toFixed(3)),
        predictionTrend: 'stable',
        greenLayer: {
          treeCount: 0,
          plantableSpots: 5,
          co2Offset: 0,
          forestCoverage: 0
        },
        wasteLayer: {
          decayRate: 0.2,
          contributionCount: 0,
          isBossActive: Math.random() < 0.05
        },
        gamification: {
           zoneLevel: 1
        }
      };
      this.zones.update(prev => [...prev, newZone]);
    }
  }

  // --- ADDRESS & LOCATION ---
  private async resolveAddress(lat: number, lng: number) {
    if (this.currentAddress() !== 'Waiting for GPS...' && Math.random() > 0.3) return; 

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        const data = await response.json();
        const addr = data.address;
        if (addr) {
           const parts = [
              addr.road || addr.pedestrian || addr.park || addr.building,
              addr.suburb || addr.neighbourhood || addr.residential
           ].filter(Boolean);
           const addressStr = parts.join(', ');
           if (addressStr) {
              this.currentAddress.set(addressStr);
              const zoneId = this.generateZoneId(lat, lng);
              this.zones.update(zones => zones.map(z => {
                if (z.id === zoneId) return { ...z, name: parts[1] || parts[0] || z.name };
                return z;
              }));
           }
        }
      }
    } catch (e) { /* Ignore */ }
  }

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

  private initLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
       this.handleGeoError({ code: 2, message: 'Geolocation not supported' } as GeolocationPositionError);
       return;
    }
    this.startWatchingPosition();
  }

  retryLocation() {
    this.locationError.set(null);
    this.currentAddress.set('INITIALIZING GPS...');
    this.startWatchingPosition();
  }

  private startWatchingPosition() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
       this.handleGeoError({ code: 2, message: 'Geolocation not supported' } as GeolocationPositionError);
       return;
    }

    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.updateUserLocation(pos.coords.latitude, pos.coords.longitude);
        this.locationError.set(null);
      },
      (err) => this.handleGeoError(err),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
    );
  }

  private handleGeoError(error: GeolocationPositionError) {
     let userMsg = '';
     let useFallback = true;
     
     // Specific error messaging based on code
     switch(error.code) {
        case 1: // PERMISSION_DENIED
           userMsg = "Location services are disabled. We'll use Mumbai as your approximate location for now. Enable location for more accurate results.";
           break;
        case 2: // POSITION_UNAVAILABLE
           userMsg = "GPS signal unavailable. Using default location. Check your network or move to an open area.";
           break;
        case 3: // TIMEOUT
           userMsg = "Location request timed out. Using default location. Check your internet connection.";
           break;
        default:
           userMsg = "Location signal lost. Switching to manual sector mode.";
     }

     this.locationError.set(userMsg);

     // Graceful Degradation: Only use fallback if we don't have a cached location
     if (useFallback && !this.userLocation()) {
        this.userLocation.set(this.FALLBACK_LOCATION);
        this.ensureCurrentZone(this.FALLBACK_LOCATION.lat, this.FALLBACK_LOCATION.lng);
        this.resolveAddress(this.FALLBACK_LOCATION.lat, this.FALLBACK_LOCATION.lng);
     }
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
    const now = Date.now();
    if (now - this.lastScanTime < 2000) { 
       this.showToast('CALIBRATING SENSORS...', 'error');
       return;
    }
    this.lastScanTime = now;

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
      location: location || this.userLocation() || undefined
    };

    this.scanHistory.update(history => [record, ...history]);
    this.totalPoints.update(p => p + totalScanPoints);
    
    if (claimType === 'cleanup') {
      this.totalWasteWeight.update(w => w + (analysis.estimatedWeight || 0));
      this.greenCredits.update(c => c + 15);
      this.showToast(`PROTOCOL COMPLETE: +${totalScanPoints} XP | +15 Cr`, 'success');
    } else {
      this.showToast(`INTEL LOGGED: +${totalScanPoints} XP`, 'success');
    }
    
    this.recalculateAllZones();
  }

  addPassiveBatch(items: { analysis: WasteAnalysis, image: string, location?: {lat: number, lng: number} }[]) {
    let totalBatchPoints = 0;
    items.forEach(item => {
      this.addScan(item.analysis, item.image, 'scout', item.location);
      totalBatchPoints += item.analysis.points;
    });
    
    if (items.length > 0) {
      this.showToast(`BATCH UPLOAD: +${totalBatchPoints} XP`, 'success');
    }
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
    this.showToast(`PROJECT COMPLETED: +${bonusPoints} XP`, 'success');
  }

  getLeaderboard(): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [{
      name: this.username(),
      points: this.totalPoints(),
      ward: this.currentZone()?.name || 'Unknown Sector',
      isUser: true,
      rank: 1,
      title: this.userRank()
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
      return defaultVal;
    }
  }

  private loadZones(): Zone[] {
     return this.load<Zone[]>(this.KEYS.ZONES, []);
  }
  
  private loadTrees(): Tree[] {
    const t = this.load<Tree[]>(this.KEYS.TREES, []);
    return t.map(tree => ({ ...tree, plantedAt: new Date(tree.plantedAt), lastWatered: new Date(tree.lastWatered) }));
  }

  private safeSave(key: string, value: any) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {}
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