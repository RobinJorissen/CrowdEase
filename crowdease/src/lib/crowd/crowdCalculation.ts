import { CrowdReport, CrowdLevel } from '@/types/crowd';

export function calculateWeightedAverage(reports: CrowdReport[]): number {
  if (reports.length === 0) return 0;

  const levelToNumber = {
    [CrowdLevel.RUSTIG]: 0.0,
    [CrowdLevel.MATIG]: 0.5,
    [CrowdLevel.DRUK]: 1.0,
  };

  const totalWeight = reports.reduce((sum, r) => sum + r.reportWeight, 0);
  const weightedSum = reports.reduce(
    (sum, r) => sum + levelToNumber[r.crowdLevel] * r.reportWeight,
    0
  );

  return weightedSum / totalWeight;
}

export function numberToCrowdLevel(value: number): CrowdLevel {
  if (value <= 0.33) return CrowdLevel.RUSTIG;
  if (value <= 0.66) return CrowdLevel.MATIG;
  return CrowdLevel.DRUK;
}
