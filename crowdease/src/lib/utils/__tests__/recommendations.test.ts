import { describe, it, expect } from 'vitest';
import {
  calculateRecommendation,
  isRecommended,
  type RecommendableStore,
} from '../recommendations';

describe('recommendations', () => {
  const createStore = (
    currentCrowd: 'rustig' | 'matig' | 'druk' | 'zeer_druk'
  ): RecommendableStore => ({
    currentCrowd,
  });

  describe('calculateRecommendation', () => {
    it('should return 1 for rustig (highest priority)', () => {
      const store = createStore('rustig');
      expect(calculateRecommendation(store)).toBe(1);
    });

    it('should return 2 for matig', () => {
      const store = createStore('matig');
      expect(calculateRecommendation(store)).toBe(2);
    });

    it('should return 3 for druk', () => {
      const store = createStore('druk');
      expect(calculateRecommendation(store)).toBe(3);
    });

    it('should return 4 for zeer_druk (lowest priority)', () => {
      const store = createStore('zeer_druk');
      expect(calculateRecommendation(store)).toBe(4);
    });
  });

  describe('isRecommended', () => {
    it('should return true for rustig stores', () => {
      const store = createStore('rustig');
      expect(isRecommended(store)).toBe(true);
    });

    it('should return true for matig stores', () => {
      const store = createStore('matig');
      expect(isRecommended(store)).toBe(true);
    });

    it('should return false for druk stores', () => {
      const store = createStore('druk');
      expect(isRecommended(store)).toBe(false);
    });

    it('should return false for zeer_druk stores', () => {
      const store = createStore('zeer_druk');
      expect(isRecommended(store)).toBe(false);
    });
  });
});
