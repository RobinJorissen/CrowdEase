import { describe, it, expect } from 'vitest';
import { haversineDistance } from './distance';

describe('haversineDistance', () => {
  it('should calculate distance between two points in km', () => {
    // Gent Korenmarkt to Gent Sint-Pieters
    const distance = haversineDistance(51.0543, 3.7174, 51.0362, 3.7104);
    expect(distance).toBeCloseTo(2.1, 1);
  });

  it('should return 0 for same coordinates', () => {
    const distance = haversineDistance(51.0543, 3.7174, 51.0543, 3.7174);
    expect(distance).toBe(0);
  });

  it('should calculate positive distance regardless of order', () => {
    const distance1 = haversineDistance(51.0543, 3.7174, 51.0362, 3.7104);
    const distance2 = haversineDistance(51.0362, 3.7104, 51.0543, 3.7174);
    expect(distance1).toBeCloseTo(distance2, 5);
  });
});
