import { describe, it, expect } from 'vitest';
import { calculateWeightedAverage, numberToCrowdLevel } from './crowdCalculation';
import { CrowdLevel } from '@/types/crowd';

describe('calculateWeightedAverage', () => {
  it('should calculate weighted average correctly', () => {
    const reports = [
      {
        crowdLevel: CrowdLevel.DRUK,
        reportWeight: 1.0 as 1.0,
        storeId: '1',
        timestamp: 0,
        dayOfWeek: 0,
        hourOfDay: 0,
      },
      {
        crowdLevel: CrowdLevel.RUSTIG,
        reportWeight: 0.7 as 0.7,
        storeId: '1',
        timestamp: 0,
        dayOfWeek: 0,
        hourOfDay: 0,
      },
    ];

    const avg = calculateWeightedAverage(reports);
    // (1.0 * 1.0 + 0.0 * 0.7) / (1.0 + 0.7) = 1.0 / 1.7 ≈ 0.588
    expect(avg).toBeCloseTo(0.588, 2);
  });

  it('should return 0 for empty array', () => {
    expect(calculateWeightedAverage([])).toBe(0);
  });

  it('should handle all same level reports', () => {
    const reports = [
      {
        crowdLevel: CrowdLevel.MATIG,
        reportWeight: 1.0 as 1.0,
        storeId: '1',
        timestamp: 0,
        dayOfWeek: 0,
        hourOfDay: 0,
      },
      {
        crowdLevel: CrowdLevel.MATIG,
        reportWeight: 1.0 as 1.0,
        storeId: '1',
        timestamp: 0,
        dayOfWeek: 0,
        hourOfDay: 0,
      },
    ];

    expect(calculateWeightedAverage(reports)).toBe(0.5);
  });
});

describe('numberToCrowdLevel', () => {
  it('should map 0.2 to RUSTIG', () => {
    expect(numberToCrowdLevel(0.2)).toBe(CrowdLevel.RUSTIG);
  });

  it('should map 0.5 to MATIG', () => {
    expect(numberToCrowdLevel(0.5)).toBe(CrowdLevel.MATIG);
  });

  it('should map 0.8 to DRUK', () => {
    expect(numberToCrowdLevel(0.8)).toBe(CrowdLevel.DRUK);
  });

  it('should handle boundary values', () => {
    expect(numberToCrowdLevel(0.33)).toBe(CrowdLevel.RUSTIG);
    expect(numberToCrowdLevel(0.34)).toBe(CrowdLevel.MATIG);
    expect(numberToCrowdLevel(0.66)).toBe(CrowdLevel.MATIG);
    expect(numberToCrowdLevel(0.67)).toBe(CrowdLevel.DRUK);
  });
});
