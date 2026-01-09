import { HistoricalPattern } from '@/types/crowd';
import { getHistoricalPatterns, saveHistoricalPatterns } from '@/lib/storage/patternStorage';
import { getCrowdReports } from '@/lib/storage/crowdStorage';
import { calculateWeightedAverage } from './crowdCalculation';

export function getPatternForStore(
  storeId: string,
  dayOfWeek: number,
  hourOfDay: number
): HistoricalPattern | null {
  const patterns = getHistoricalPatterns();
  return (
    patterns.find(
      (p) => p.storeId === storeId && p.dayOfWeek === dayOfWeek && p.hourOfDay === hourOfDay
    ) || null
  );
}

export function aggregatePatterns(): void {
  const reports = getCrowdReports();
  const grouped = new Map<string, typeof reports>();

  // Group by storeId + dayOfWeek + hourOfDay
  reports.forEach((report) => {
    const key = `${report.storeId}_${report.dayOfWeek}_${report.hourOfDay}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(report);
  });

  const patterns: HistoricalPattern[] = [];

  grouped.forEach((reports, key) => {
    if (reports.length >= 5) {
      const [storeId, dayOfWeek, hourOfDay] = key.split('_');
      patterns.push({
        storeId,
        dayOfWeek: parseInt(dayOfWeek),
        hourOfDay: parseInt(hourOfDay),
        averageCrowdLevel: calculateWeightedAverage(reports),
        reportCount: reports.length,
        lastUpdated: Date.now(),
      });
    }
  });

  saveHistoricalPatterns(patterns);
}
