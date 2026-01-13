import { Injectable, signal, computed, effect } from '@angular/core';
import { WasteAnalysis, ActivityType } from './gemini.service';

export type ClaimType = 'scout' | 'cleanup';
export type MessageType = 'error' | 'success' | 'info';

// Interfaces
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

export type ZoneStatus = 'Critical' | 'Dirty' | 'Moderate' | 'Clean' | 'Pristine';
export type TreeStage = 'Sapling' | 'Young' | 'Growing' | 'Mature';
export type PlantationMode = 'self' | 'community' | 'sponsored';

export interface MaintenanceLog {
  date: Date;
  action: 'water' | 'fertilize' | 'prune';
  healthImpact: number;
}

export interface Tree {
  id: string;
  species: string;
  plantedAt: Date;
  location: { lat: number; lng: number };
  ownerName: string;
  zoneId: string;
  mode: PlantationMode;
  stage: TreeStage;
  health: number;
  lastWatered: Date;
  lastFertilized?: Date;
  maintenanceLog: MaintenanceLog[];
  co2Offset: number;
  metrics?: {
    carFreeDays: number;
    acHours: number;
    plasticBottles: number;
  };
}

export interface Zone {
  id: string;
  name: string;
  health: number;
  status: ZoneStatus;
  lat: number;
  lng: number;
  predictionTrend: 'improving' | 'decaying' | 'stable';
  greenLayer: {
    treeCount: number;
    plantableSpots: number;
    co2Offset: number;
    forestCoverage: number;
  };
  wasteLayer: {
    decayRate: number;
    lastCleaned?: Date;
    lastDecay?: Date;
    contributionCount: number;
    isBossActive: boolean;
  };
  gamification: {
    ownerName?: string;
    teamTerritory?: string;
    zoneLevel: number;
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

// Constants
export const GROWTH_CONFIG: Record<TreeStage, { duration: number; co2PerDay: number; icon: string }> = {
  'Sapling': { duration: 90, co2PerDay: 0.5, icon: '🌱' },
  'Young': { duration: 365, co2PerDay: 2.0, icon: '🌿' },
  'Growing': { duration: 730, co2PerDay: 5.0, icon: '🌳' },
  'Mature': { duration: 99999, co2PerDay: 10.0, icon: '🌲' }
};

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
    ZONES: 'swh_real_zones_v8',
    TREES: 'swh_trees_v4',
    GREEN_CREDITS: 'swh_credits',
    USERNAME: 'swh_username',
    DEVICE_ID: 'swh_device_id',
    ONBOARDED: 'swh_onboarded',
    LOCATION: 'swh_last_location'
  };

  private readonly FALLBACK_LOCATION = { lat: 19.0760, lng: 72.8777 };
  readonly SPECIES_RATES: Record<string, number> = {
    "Neem": 22, "Banyan": 45, "Peepal": 35, "Mango": 28, "Eucalyptus": 25, "Bamboo": 30
  };
  readonly PLANTATION_COSTS: Record<PlantationMode, number> = {
    'self': 50,
    'community': 100,
    'sponsored': 0
  };

  // Signals
  readonly currentActivity = signal<ActivityType>('Walking');
  readonly userLocation = signal<{ lat: number, lng: number } | null>(null);
  readonly currentAddress = signal<string>('Waiting for GPS...');
  readonly navigationTarget = signal<Zone | null>(null);
  readonly username = signal<string>(this.load(this.KEYS.USERNAME, 'Operator'));
  private generateUUID = (): string => crypto.randomUUID ? crypto.randomUUID() : `user-${Math.random().toString(36).substring(2, 9)}`;
  readonly deviceId = signal<string>(this.load(this.KEYS.DEVICE_ID, this.generateUUID()));
  readonly hasOnboarded = signal<boolean>(this.load(this.KEYS.ONBOARDED, false));
  readonly locationError = signal<string | null>(null);
  readonly systemMessage = signal<SystemMessage | null>(null);
  readonly isFallbackLocation = signal<boolean>(false);
  readonly totalPoints = signal<number>(this.load(this.KEYS.POINTS, 0));
  readonly totalWasteWeight = signal<number>(this.load(this.KEYS.WEIGHT, 0));
  readonly streakDays = signal<number>(this.load(this.KEYS.STREAK, 0));
  readonly greenCredits = signal<number>(this.load(this.KEYS.GREEN_CREDITS, 500));
  readonly trees = signal<Tree[]>(this.loadTrees());
  readonly scanHistory = signal<ScanRecord[]>(this.loadHistory());
  readonly zones = signal<Zone[]>(this.loadZones());

  // Computed Signals
  readonly activityMultiplier = computed(() => ({ 'Running': 1.5, 'Cycling': 1.2, 'Walking': 1.0 }[this.currentActivity()] || 1.0));
  readonly userRank = computed(() => this.calculateUserRank(this.totalPoints()));
  readonly nextRankProgress = computed(() => this.calculateNextRankProgress(this.totalPoints()));
  readonly neighborhoodHealth = computed(() => this.calculateNeighborhoodHealth(this.zones()));
  readonly currentZone = computed(() => this.findCurrentZone(this.userLocation(), this.zones()));
  readonly totalCo2Offset = computed(() => this.calculateTotalCo2Offset(this.trees()));
  readonly weeklyImpactStory = computed(() => this.generateWeeklyImpactStory());

  private watchId: number | null = null;
  private lastScanTime = 0;

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.setupPersistence();
    this.initializeLocation();
    this.recalculateAllZones();
    this.updateTreeLifecycle();
    setInterval(() => this.updateTreeLifecycle(), 60000);
    this.setupLocationEffects();
  }

  private setupLocationEffects() {
    effect(() => {
      const loc = this.userLocation();
      if (loc) {
        this.resolveAddress(loc.lat, loc.lng);
        this.ensureCurrentZone(loc.lat, loc.lng);
        this.checkNavigationTarget(loc);
      }
    });
  }

  private checkNavigationTarget(loc: { lat: number; lng: number }) {
    const target = this.navigationTarget();
    if (target && target.id === this.generateZoneId(loc.lat, loc.lng)) {
      this.showToast(`TARGET REACHED: ${target.name}`, 'success');
      this.navigationTarget.set(null);
    }
  }

  // Public Methods
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

  plantTree(zone: Zone, species: string, mode: PlantationMode, quantity: number = 1, userLoc?: { lat: number; lng: number }) {
    const cost = this.calculatePlantingCost(mode, quantity);
    if (!this.canAffordPlanting(mode, cost) || !this.isEligibleForSponsored(mode) || !this.hasEnoughPlantableSpots(zone, quantity)) {
      return;
    }

    const plantingLocation = (mode === 'self' && userLoc) ? userLoc : { lat: zone.lat, lng: zone.lng };
    if (mode === 'self' && !userLoc) {
      this.showToast('GPS REQUIRED for Self-Planting.', 'error');
      return;
    }

    if (mode !== 'sponsored') {
      this.greenCredits.update(c => c - cost);
    }

    const rewardXP = this.calculatePlantingXP(mode, quantity);
    const newTrees = Array.from({ length: quantity }, () => this.createNewTree(zone, species, mode, plantingLocation));
    
    this.trees.update(t => [...t, ...newTrees]);
    this.totalPoints.update(p => p + rewardXP);
    
    if (mode === 'self') {
      this.greenCredits.update(c => c + 50);
      this.showToast(`SUCCESS: Verified & Planted! (+${rewardXP} XP, +50 Credits)`, 'success');
    } else {
      this.showToast(`SUCCESS: ${quantity} ${species} Planted (+${rewardXP} XP)`, 'success');
    }

    this.recalculateAllZones();
  }

  private calculatePlantingCost(mode: PlantationMode, quantity: number): number {
    let cost = this.PLANTATION_COSTS[mode] * quantity;
    if (mode === 'community' && quantity >= 10) cost *= 0.85;
    else if (mode === 'community' && quantity >= 5) cost *= 0.9;
    return Math.floor(cost);
  }

  private canAffordPlanting(mode: PlantationMode, cost: number): boolean {
    if (mode !== 'sponsored' && this.greenCredits() < cost) {
      this.showToast(`INSUFFICIENT CREDITS: Need ${cost}`, 'error');
      return false;
    }
    return true;
  }

  private isEligibleForSponsored(mode: PlantationMode): boolean {
    if (mode === 'sponsored' && this.streakDays() < 30 && this.totalPoints() < 1000) {
      this.showToast('LOCKED: Require 30-day streak or 1000 XP', 'error');
      return false;
    }
    return true;
  }

  private hasEnoughPlantableSpots(zone: Zone, quantity: number): boolean {
    if (zone.greenLayer.plantableSpots < quantity) {
      this.showToast(`DENSITY LIMIT: Only ${zone.greenLayer.plantableSpots} spots left`, 'error');
      return false;
    }
    return true;
  }

  private calculatePlantingXP(mode: PlantationMode, quantity: number): number {
    if (mode === 'self') return 500;
    if (mode === 'community') return 200 * quantity;
    return 300 * quantity;
  }

  private createNewTree(zone: Zone, species: string, mode: PlantationMode, location: { lat: number; lng: number }): Tree {
    const now = new Date();
    const loc = mode === 'self' ? location : {
      lat: zone.lat + (Math.random() * 0.0005 - 0.00025),
      lng: zone.lng + (Math.random() * 0.0005 - 0.00025)
    };
    return {
      id: this.generateUUID(),
      species,
      plantedAt: now,
      location: loc,
      ownerName: this.username(),
      zoneId: zone.id,
      mode,
      stage: 'Sapling',
      health: 100,
      lastWatered: now,
      maintenanceLog: [],
      co2Offset: 0
    };
  }

  maintainTree(treeId: string, action: 'water' | 'fertilize') {
    const now = new Date();
    this.trees.update(currentTrees =>
      currentTrees.map(t => {
        if (t.id !== treeId) return t;

        const cooldowns = { water: 12 * 3600 * 1000, fertilize: 7 * 24 * 3600 * 1000 };
        const lastActionTime = action === 'water' ? t.lastWatered.getTime() : (t.lastFertilized?.getTime() || 0);

        if (now.getTime() - lastActionTime < cooldowns[action]) {
          this.showToast('TOO SOON: Wait for cooldown', 'info');
          return t;
        }

        const rewards = { water: { health: 10, xp: 50, cr: 10 }, fertilize: { health: 15, xp: 100, cr: 25 } };
        const { health, xp, cr } = rewards[action];

        this.showToast(`${action.toUpperCase()} COMPLETE (+${xp} XP)`, 'success');
        this.totalPoints.update(p => p + xp);
        this.greenCredits.update(c => c + cr);

        return {
          ...t,
          health: Math.min(100, t.health + health),
          lastWatered: action === 'water' ? now : t.lastWatered,
          lastFertilized: action === 'fertilize' ? now : t.lastFertilized,
          maintenanceLog: [...t.maintenanceLog, { date: now, action, healthImpact: health }]
        };
      })
    );
    this.recalculateAllZones();
  }

  // Lifecycle, Persistence, and Location Methods...
  private updateTreeLifecycle() {
    this.trees.update(trees => trees.map(tree => this.updateSingleTree(tree)));
  }

  private updateSingleTree(tree: Tree): Tree {
    const now = new Date();
    const daysOld = (now.getTime() - new Date(tree.plantedAt).getTime()) / (1000 * 3600 * 24);
    const stage = this.determineTreeStage(daysOld);
    const totalCO2 = this.calculateCo2Offset(daysOld, stage, tree.species);
    const health = this.calculateTreeHealth(tree, now);
    const metrics = this.calculateTreeMetrics(totalCO2);

    return { ...tree, stage, health, co2Offset: totalCO2, metrics };
  }

  private determineTreeStage(daysOld: number): TreeStage {
    if (daysOld > GROWTH_CONFIG['Growing'].duration) return 'Mature';
    if (daysOld > GROWTH_CONFIG['Young'].duration) return 'Growing';
    if (daysOld > GROWTH_CONFIG['Sapling'].duration) return 'Young';
    return 'Sapling';
  }

  private calculateCo2Offset(daysOld: number, stage: TreeStage, species: string): number {
    const dailyRate = GROWTH_CONFIG[stage].co2PerDay;
    const speciesMultiplier = (this.SPECIES_RATES[species] || 20) / 20;
    return daysOld * dailyRate * speciesMultiplier;
  }

  private calculateTreeHealth(tree: Tree, now: Date): number {
    if (tree.mode !== 'self') return 100;
    const daysSinceWater = (now.getTime() - new Date(tree.lastWatered).getTime()) / (1000 * 3600 * 24);
    if (daysSinceWater <= 7) return tree.health;
    if (daysSinceWater > 30) return 0;
    return Math.max(0, 100 - (daysSinceWater - 7) * 2);
  }

  private calculateTreeMetrics(totalCO2: number) {
    return {
      carFreeDays: totalCO2 / 4.6,
      acHours: totalCO2 / 1.5,
      plasticBottles: totalCO2 / 0.08
    };
  }

  private setupPersistence() {
    const signalsToSave = {
      [this.KEYS.POINTS]: this.totalPoints,
      [this.KEYS.WEIGHT]: this.totalWasteWeight,
      [this.KEYS.STREAK]: this.streakDays,
      [this.KEYS.HISTORY]: this.scanHistory,
      [this.KEYS.ZONES]: this.zones,
      [this.KEYS.TREES]: this.trees,
      [this.KEYS.GREEN_CREDITS]: this.greenCredits
    };
    Object.entries(signalsToSave).forEach(([key, signal]) => effect(() => this.safeSave(key, signal())));
    effect(() => {
      if (!this.isFallbackLocation()) this.safeSave(this.KEYS.LOCATION, this.userLocation());
    });
  }

  private generateZoneId = (lat: number, lng: number): string => `${lat.toFixed(3)}_${lng.toFixed(3)}`;
  private calculateZoneStatus = (health: number): ZoneStatus => {
    if (health >= 86) return 'Pristine';
    if (health >= 61) return 'Clean';
    if (health >= 41) return 'Moderate';
    if (health >= 21) return 'Dirty';
    return 'Critical';
  };
  private calculateZoneLevel = (contributions: number): number => {
    if (contributions > 100) return 5;
    if (contributions > 50) return 4;
    if (contributions > 25) return 3;
    if (contributions > 10) return 2;
    return 1;
  };

  private recalculateAllZones() {
    this.zones.update(zones => zones.map(zone => this.recalculateSingleZone(zone)));
  }

  private recalculateSingleZone(zone: Zone): Zone {
    const zoneScans = this.scanHistory().filter(h => h.location && this.generateZoneId(h.location.lat, h.location.lng) === zone.id);
    const zoneTrees = this.trees().filter(t => t.zoneId === zone.id);
    const now = new Date();

    const netImpact = zoneScans.reduce((acc, scan) => acc + (scan.claimType === 'cleanup' ? 15 : -2), 0);
    const treeBuff = zoneTrees.length * 8;
    const latestScanDate = zoneScans.length > 0 ? zoneScans.reduce((latest, s) => new Date(s.timestamp) > latest ? new Date(s.timestamp) : latest, new Date(0)) : undefined;
    const lastInteraction = latestScanDate || zone.wasteLayer?.lastDecay || new Date(now.getTime() - 86400000);
    const hoursSince = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);

    const currentProjectedHealth = 50 + netImpact + treeBuff;
    const decayRatePerHour = this.calculateDecayRate(currentProjectedHealth, zoneTrees.length);
    const totalDecay = hoursSince * decayRatePerHour;
    const neglectPenalty = hoursSince > 72 ? 20 : (hoursSince > 24 ? 5 : 0);

    const finalHealth = Math.max(0, Math.min(100, currentProjectedHealth - totalDecay - neglectPenalty));
    const trend = (netImpact > totalDecay && neglectPenalty === 0) ? 'improving' : ((totalDecay + neglectPenalty > 5) ? 'decaying' : 'stable');
    const owner = (finalHealth > 80 && zoneScans.length > 0) ? this.username() : ((finalHealth < 40) ? undefined : zone.gamification?.ownerName);

    return {
      ...zone,
      health: finalHealth,
      status: this.calculateZoneStatus(finalHealth),
      predictionTrend: trend,
      greenLayer: this.updateZoneGreenLayer(zoneTrees),
      wasteLayer: this.updateZoneWasteLayer(decayRatePerHour, zoneScans.length, latestScanDate),
      gamification: this.updateZoneGamification(owner, zoneScans.length)
    };
  }

  private calculateDecayRate(health: number, treeCount: number): number {
    let decayRate = 0.2;
    if (health < 40) decayRate = 1.0;
    else if (health > 80) decayRate = 0.05;
    const treeProtection = Math.min(0.5, treeCount * 0.1);
    return decayRate * (1 - treeProtection);
  }

  private updateZoneGreenLayer(zoneTrees: Tree[]) {
    return {
      treeCount: zoneTrees.length,
      plantableSpots: Math.max(0, 5 - zoneTrees.length),
      co2Offset: zoneTrees.reduce((acc, t) => acc + t.co2Offset, 0),
      forestCoverage: Math.min(100, zoneTrees.length * 20)
    };
  }

  private updateZoneWasteLayer(decayRate: number, contributionCount: number, lastCleaned?: Date) {
    return {
      decayRate,
      lastCleaned,
      lastDecay: new Date(),
      contributionCount,
      isBossActive: Math.random() < 0.05
    };
  }

  private updateZoneGamification(ownerName: string | undefined, contributionCount: number) {
    return {
      ownerName,
      zoneLevel: this.calculateZoneLevel(contributionCount),
      teamTerritory: ownerName ? 'Rangers' : undefined
    };
  }

  private ensureCurrentZone(lat: number, lng: number) {
    const zoneId = this.generateZoneId(lat, lng);
    if (!this.zones().some(z => z.id === zoneId)) {
      this.zones.update(prev => [...prev, this.createNewZone(lat, lng, zoneId)]);
    }
  }

  private createNewZone(lat: number, lng: number, zoneId: string): Zone {
    return {
      id: zoneId,
      name: `Sector ${zoneId.slice(-4)}`,
      health: 50,
      status: 'Moderate',
      lat: Number(lat.toFixed(3)),
      lng: Number(lng.toFixed(3)),
      predictionTrend: 'stable',
      greenLayer: { treeCount: 0, plantableSpots: 5, co2Offset: 0, forestCoverage: 0 },
      wasteLayer: { decayRate: 0.2, contributionCount: 0, isBossActive: Math.random() < 0.05 },
      gamification: { zoneLevel: 1 }
    };
  }

  private async resolveAddress(lat: number, lng: number) {
    if (this.currentAddress() !== 'Waiting for GPS...' && Math.random() > 0.3) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        const { road, pedestrian, park, building, suburb, neighbourhood, residential } = data.address || {};
        const parts = [road || pedestrian || park || building, suburb || neighbourhood || residential].filter(Boolean);
        const addressStr = parts.join(', ');
        if (addressStr) {
          this.currentAddress.set(addressStr);
          this.updateZoneName(lat, lng, parts[1] || parts[0]);
        }
      }
    } catch (e) { /* Ignore fetch errors */ }
  }

  private updateZoneName(lat: number, lng: number, name?: string) {
    if (!name) return;
    const zoneId = this.generateZoneId(lat, lng);
    this.zones.update(zones => zones.map(z => z.id === zoneId ? { ...z, name } : z));
  }

  showToast(text: string, type: MessageType = 'info') {
    this.systemMessage.set({ text, type });
    setTimeout(() => {
      if (this.systemMessage()?.text === text) this.systemMessage.set(null);
    }, 4000);
  }

  dismissToast() { this.systemMessage.set(null); }
  requestLocationAccess() {
    this.locationError.set(null);
    this.currentAddress.set('Locating...');
    this.startWatchingPosition();
  }
  retryLocation() { this.requestLocationAccess(); }

  private initializeLocation() {
    const cached = this.load<{ lat: number; lng: number } | null>(this.KEYS.LOCATION, null);
    if (cached) {
      this.userLocation.set(cached);
      this.checkPermissionsAndStart();
    } else {
      this.setFallbackLocation();
    }
  }

  private setFallbackLocation() {
    this.userLocation.set(this.FALLBACK_LOCATION);
    this.isFallbackLocation.set(true);
    this.ensureCurrentZone(this.FALLBACK_LOCATION.lat, this.FALLBACK_LOCATION.lng);
    this.resolveAddress(this.FALLBACK_LOCATION.lat, this.FALLBACK_LOCATION.lng);
  }

  private async checkPermissionsAndStart() {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' } as any);
        if (result.state === 'granted') this.startWatchingPosition();
      } catch (e) { /* Ignore */ }
    }
  }

  private startWatchingPosition() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.handleGeoError({ code: 2, message: 'Geolocation not supported' } as GeolocationPositionError);
      return;
    }
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    this.watchId = navigator.geolocation.watchPosition(
      pos => {
        this.updateUserLocation(pos.coords.latitude, pos.coords.longitude);
        this.isFallbackLocation.set(false);
        this.locationError.set(null);
      },
      err => this.handleGeoError(err),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
    );
  }

  private handleGeoError(error: GeolocationPositionError) {
    const messages: { [key: number]: string } = {
      2: "GPS signal unavailable. Switched to fallback sector.",
      3: "Location request timed out. Using default sector."
    };
    const userMsg = messages[error.code] || (error.code === 1 ? "" : "Location signal lost. Switching to manual mode.");

    if (error.code !== 1) this.locationError.set(userMsg);
    if (error.code === 1) this.isFallbackLocation.set(true);
    if (!this.userLocation() || this.isFallbackLocation()) this.setFallbackLocation();
  }

  dismissLocationError() { this.locationError.set(null); }
  setActivity(mode: ActivityType) { this.currentActivity.set(mode); }
  updateUserLocation(lat: number, lng: number) { this.userLocation.set({ lat, lng }); }

  addScan(analysis: WasteAnalysis, imageBase64: string, claimType: ClaimType, location?: { lat: number, lng: number }) {
    if (Date.now() - this.lastScanTime < 2000) {
      this.showToast('CALIBRATING SENSORS...', 'error');
      return;
    }
    this.lastScanTime = Date.now();

    const totalScanPoints = this.calculateScanPoints(analysis.points, claimType);
    const record = this.createScanRecord(analysis, imageBase64, claimType, totalScanPoints, location);

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

  private calculateScanPoints(basePoints: number, claimType: ClaimType): number {
    const cleanupBonus = claimType === 'cleanup' ? basePoints : 0;
    const combinedBase = basePoints + cleanupBonus;
    const fitnessBonus = Math.round(combinedBase * (this.activityMultiplier() - 1));
    return combinedBase + fitnessBonus;
  }

  private createScanRecord(analysis: WasteAnalysis, imageBase64: string, claimType: ClaimType, totalPoints: number, location?: { lat: number, lng: number }): ScanRecord {
    return {
      ...analysis,
      id: this.generateUUID(),
      timestamp: new Date(),
      imageThumbnail: imageBase64,
      upcycleBonusClaimed: false,
      activityMode: this.currentActivity(),
      claimType: claimType,
      basePoints: analysis.points,
      cleanupBonus: claimType === 'cleanup' ? analysis.points : 0,
      fitnessBonus: Math.round((analysis.points + (claimType === 'cleanup' ? analysis.points : 0)) * (this.activityMultiplier() - 1)),
      points: totalPoints,
      location: location || this.userLocation() || undefined
    };
  }

  addPassiveBatch(items: { analysis: WasteAnalysis, image: string, location?: { lat: number, lng: number } }[]) {
    const totalBatchPoints = items.reduce((acc, item) => {
      this.addScan(item.analysis, item.image, 'scout', item.location);
      return acc + item.analysis.points;
    }, 0);
    if (items.length > 0) {
      this.showToast(`BATCH UPLOAD: +${totalBatchPoints} XP`, 'success');
    }
  }

  claimUpcycleBonus(scanId: string) {
    const bonusPoints = 50;
    this.scanHistory.update(history => history.map(scan => scan.id === scanId && !scan.upcycleBonusClaimed ? { ...scan, upcycleBonusClaimed: true } : scan));
    this.totalPoints.update(p => p + bonusPoints);
    this.showToast(`PROJECT COMPLETED: +${bonusPoints} XP`, 'success');
  }

  getLeaderboard(): LeaderboardEntry[] {
    return [{
      name: this.username(),
      points: this.totalPoints(),
      ward: this.currentZone()?.name || 'Unknown Sector',
      isUser: true,
      rank: 1,
      title: this.userRank()
    }];
  }

  private load<T>(key: string, defaultVal: T): T {
    try {
      return typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem(key) || 'null') || defaultVal : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private loadTrees(): Tree[] {
    return this.load<Tree[]>(this.KEYS.TREES, []).map(tree => ({
      ...tree,
      plantedAt: new Date(tree.plantedAt),
      lastWatered: new Date(tree.lastWatered),
      lastFertilized: tree.lastFertilized ? new Date(tree.lastFertilized) : undefined,
      maintenanceLog: tree.maintenanceLog || []
    }));
  }

  private safeSave = (key: string, value: any) => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { console.error("Failed to save to localStorage", e); }
  }

  private loadHistory(): ScanRecord[] {
    return this.load<ScanRecord[]>(this.KEYS.HISTORY, []).map(d => ({ ...d, timestamp: new Date(d.timestamp) }));
  }

  private loadZones(): Zone[] {
    return this.load<Zone[]>(this.KEYS.ZONES, []);
  }

  private calculateUserRank(pts: number): string {
    if (pts > 50000) return 'City Champion';
    if (pts > 15000) return 'Zone Lord';
    if (pts > 5000) return 'Ranger';
    if (pts > 2000) return 'Guardian';
    if (pts > 500) return 'Sprout';
    return 'Seedling';
  }

  private calculateNextRankProgress(pts: number): number {
    const ranks = { 'Seedling': 500, 'Sprout': 2000, 'Guardian': 5000, 'Ranger': 15000, 'Zone Lord': 50000 };
    const currentRank = this.calculateUserRank(pts);
    if (currentRank === 'City Champion') return 100;
    const nextRankThreshold = ranks[currentRank as keyof typeof ranks];
    const prevRankThreshold = Object.values(ranks).find(val => val === nextRankThreshold) ? Object.values(ranks)[Object.values(ranks).indexOf(nextRankThreshold) - 1] || 0 : 0;
    return Math.min(100, Math.max(0, ((pts - prevRankThreshold) / (nextRankThreshold - prevRankThreshold)) * 100));
  }

  private calculateNeighborhoodHealth(zones: Zone[]): number {
    if (zones.length === 0) return 100;
    return Math.round(zones.reduce((acc, z) => acc + z.health, 0) / zones.length);
  }

  private findCurrentZone(location: { lat: number, lng: number } | null, zones: Zone[]): Zone | null {
    if (!location) return null;
    return zones.find(z => z.id === this.generateZoneId(location.lat, location.lng)) || null;
  }

  private calculateTotalCo2Offset(trees: Tree[]): number {
    return trees.reduce((acc, t) => acc + t.co2Offset, 0);
  }

  private generateWeeklyImpactStory(): string {
    const weightKg = (this.totalWasteWeight() / 1000).toFixed(1);
    const treeCount = this.trees().length;
    const co2 = this.totalCo2Offset().toFixed(1);

    return treeCount > 0
      ? `Sector Status: RESTORATION ACTIVE. ${treeCount} trees planted. ${co2}kg CO₂ offset. Rank: ${this.userRank()}.`
      : `Sector Status: MONITORING. ${weightKg}kg debris logged. Initiate plantation protocols to offset carbon.`;
  }
}