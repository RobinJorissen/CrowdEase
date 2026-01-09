/**
 * Flexible store interface for recommendation calculations
 */
export interface RecommendableStore {
  currentCrowd: 'rustig' | 'matig' | 'druk' | 'zeer_druk';
}

/**
 * Calculate recommendation score for a store based on crowd level
 * Lower scores are better (higher priority)
 *
 * Priority order:
 * 1. rustig (quiet) = score 1
 * 2. matig (moderate) = score 2
 * 3. druk (busy) = score 3
 * 4. zeer_druk (very busy) = score 4
 */
export function calculateRecommendation(store: RecommendableStore): number {
  const crowdLevel = store.currentCrowd;

  switch (crowdLevel) {
    case 'rustig':
      return 1;
    case 'matig':
      return 2;
    case 'druk':
      return 3;
    case 'zeer_druk':
      return 4;
    default:
      return 5; // Unknown status gets lowest priority
  }
}

/**
 * Check if a store should be recommended (rustig or matig)
 */
export function isRecommended(store: RecommendableStore): boolean {
  const crowdLevel = store.currentCrowd;
  return crowdLevel === 'rustig' || crowdLevel === 'matig';
}
