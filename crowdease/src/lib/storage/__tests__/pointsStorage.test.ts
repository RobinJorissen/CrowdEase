import { describe, it, expect, beforeEach } from 'vitest';
import { getUserPoints, updatePoints, canCheckIn, recordCheckIn } from '../pointsStorage';

describe('Points Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with zero points', () => {
    const points = getUserPoints();
    expect(points.points).toBe(0);
    expect(points.totalEarned).toBe(0);
    expect(points.totalSpent).toBe(0);
  });

  it('should add points correctly', () => {
    updatePoints(10);
    const points = getUserPoints();
    expect(points.points).toBe(10);
    expect(points.totalEarned).toBe(10);
    expect(points.totalSpent).toBe(0);
  });

  it('should deduct points correctly', () => {
    updatePoints(50);
    updatePoints(-20);
    const points = getUserPoints();
    expect(points.points).toBe(30);
    expect(points.totalEarned).toBe(50);
    expect(points.totalSpent).toBe(20);
  });

  it('should allow check-in when no history exists', () => {
    expect(canCheckIn('store-123')).toBe(true);
  });

  it('should prevent check-in during cooldown', () => {
    recordCheckIn('store-123');
    expect(canCheckIn('store-123')).toBe(false);
  });

  it('should allow check-in after cooldown period', () => {
    recordCheckIn('store-123');
    expect(canCheckIn('store-123', 0)).toBe(true); // 0ms cooldown = immediate
  });

  it('should track check-in count', () => {
    recordCheckIn('store-123');
    recordCheckIn('store-123');

    const history = JSON.parse(localStorage.getItem('CrowdEase_checkin_history') || '{}');
    expect(history['store-123'].count).toBe(2);
  });
});
