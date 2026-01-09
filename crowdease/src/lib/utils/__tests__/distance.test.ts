import { describe, it, expect } from 'vitest';
import { haversineDistance, calculateDistance, formatDistance } from '../distance';

describe('distance', () => {
  describe('haversineDistance', () => {
    it('should calculate distance between two points', () => {
      // Distance between Gent center and a point ~1km away
      const distance = haversineDistance(51.0543, 3.7174, 51.0643, 3.7174);
      expect(distance).toBeCloseTo(1.11, 1); // ~1.11 km
    });

    it('should return 0 for same coordinates', () => {
      const distance = haversineDistance(51.0543, 3.7174, 51.0543, 3.7174);
      expect(distance).toBe(0);
    });

    it('should calculate large distances correctly', () => {
      // Distance between Gent and Brussels
      const distance = haversineDistance(51.0543, 3.7174, 50.8503, 4.3517);
      expect(distance).toBeGreaterThan(48);
      expect(distance).toBeLessThan(52);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance from user location to store', () => {
      const store = {
        coordinates: { lat: 51.0643, lng: 3.7174 },
      };

      const distance = calculateDistance(store, 51.0543, 3.7174);
      expect(distance).toBeCloseTo(1.11, 1);
    });
  });

  describe('formatDistance', () => {
    it('should format distances less than 1km in meters', () => {
      expect(formatDistance(0.5)).toBe('500 m');
      expect(formatDistance(0.85)).toBe('850 m');
      expect(formatDistance(0.123)).toBe('123 m');
    });

    it('should format distances 1km or more in kilometers', () => {
      expect(formatDistance(1.0)).toBe('1.0 km');
      expect(formatDistance(1.234)).toBe('1.2 km');
      expect(formatDistance(5.678)).toBe('5.7 km');
      expect(formatDistance(10.5)).toBe('10.5 km');
    });

    it('should handle edge case at 1km boundary', () => {
      expect(formatDistance(0.999)).toBe('999 m');
      expect(formatDistance(1.0)).toBe('1.0 km');
    });
  });
});
