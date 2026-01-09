import { CrowdReport } from '@/types/crowd';
import { mockCrowdReports } from '../crowd/mockCrowdReports';

const STORAGE_KEY = 'crowdReports';
const CROWD_REPORT_HISTORY_KEY = 'CrowdEase_crowd_report_history';

export function getCrowdReports(): CrowdReport[] {
  if (typeof window === 'undefined') return [];

  const data = localStorage.getItem(STORAGE_KEY);

  // If no data in localStorage, seed with mock data
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCrowdReports));
    return mockCrowdReports;
  }

  return JSON.parse(data);
}

export function saveCrowdReport(report: CrowdReport): void {
  const reports = getCrowdReports();
  reports.push(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function clearExpiredReports(): void {
  const now = Date.now();
  const reports = getCrowdReports();

  const validReports = reports.filter((r) => {
    const age = now - r.timestamp;
    const maxAge =
      r.reportWeight === 1.0
        ? 7 * 24 * 60 * 60 * 1000 // 7 days
        : 24 * 60 * 60 * 1000; // 24 hours
    return age < maxAge;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(validReports));
}

export function getRecentReportForStore(
  storeId: string,
  maxAgeMinutes: number = 30
): CrowdReport | null {
  if (typeof window === 'undefined') return null;

  const reports = getCrowdReports();
  const now = Date.now();
  const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds

  // Filter reports for this store that are recent enough
  const recentReports = reports
    .filter((r) => r.storeId === storeId && now - r.timestamp < maxAge)
    .sort((a, b) => b.timestamp - a.timestamp); // Most recent first

  return recentReports.length > 0 ? recentReports[0] : null;
}

// Crowd report cooldown (1 hour per store)
export function canReportCrowd(storeId: string): boolean {
  if (typeof window === 'undefined') return true;

  const history = JSON.parse(localStorage.getItem(CROWD_REPORT_HISTORY_KEY) || '{}');
  const lastReport = history[storeId];

  if (!lastReport) return true;

  const hourInMs = 60 * 60 * 1000;
  return Date.now() - lastReport > hourInMs;
}

export function recordCrowdReport(storeId: string): void {
  if (typeof window === 'undefined') return;

  const history = JSON.parse(localStorage.getItem(CROWD_REPORT_HISTORY_KEY) || '{}');
  history[storeId] = Date.now();
  localStorage.setItem(CROWD_REPORT_HISTORY_KEY, JSON.stringify(history));
}
