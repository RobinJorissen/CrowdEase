export interface CrowdReport {
  storeId: string;
  crowdLevel: CrowdLevel;
  timestamp: number;
  reportWeight: ReportWeight;
  dayOfWeek: number;
  hourOfDay: number;
}

export enum CrowdLevel {
  RUSTIG = 'rustig',
  MATIG = 'matig',
  DRUK = 'druk',
}

export type ReportWeight = 1.0 | 0.7;

export interface HistoricalPattern {
  storeId: string;
  dayOfWeek: number;
  hourOfDay: number;
  averageCrowdLevel: number;
  reportCount: number;
  lastUpdated: number;
}
