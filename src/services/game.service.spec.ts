import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline in tests')));

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(GameService);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('defaults to the Walking activity multiplier', () => {
    expect(service.activityMultiplier()).toBe(1.0);
  });

  it('applies the multiplier for each activity', () => {
    service.setActivity('Running');
    expect(service.activityMultiplier()).toBe(1.5);

    service.setActivity('Cycling');
    expect(service.activityMultiplier()).toBe(1.2);

    service.setActivity('Walking');
    expect(service.activityMultiplier()).toBe(1.0);
  });

  it('starts new users with 500 green credits', () => {
    expect(service.greenCredits()).toBe(500);
  });

  it('maps points to the correct rank', () => {
    service.totalPoints.set(0);
    expect(service.userRank()).toBe('Seedling');

    service.totalPoints.set(600);
    expect(service.userRank()).toBe('Sprout');

    service.totalPoints.set(2500);
    expect(service.userRank()).toBe('Guardian');

    service.totalPoints.set(6000);
    expect(service.userRank()).toBe('Ranger');

    service.totalPoints.set(20000);
    expect(service.userRank()).toBe('Zone Lord');

    service.totalPoints.set(60000);
    expect(service.userRank()).toBe('City Champion');
  });

  it('keeps rank progress within 0 and 100', () => {
    service.totalPoints.set(1000);
    const progress = service.nextRankProgress();
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it('exposes the plantation cost configuration', () => {
    expect(service.PLANTATION_COSTS.self).toBe(50);
    expect(service.PLANTATION_COSTS.community).toBe(100);
    expect(service.PLANTATION_COSTS.sponsored).toBe(0);
  });

  it('clears the location error on demand', () => {
    service.locationError.set('GPS signal unavailable.');
    expect(service.locationError()).toBe('GPS signal unavailable.');
    service.dismissLocationError();
    expect(service.locationError()).toBeNull();
  });
});
