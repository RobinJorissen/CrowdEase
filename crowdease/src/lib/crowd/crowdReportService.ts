import { CrowdLevel } from '@/types/crowd';
import { getCrowdReports } from '@/lib/storage/crowdStorage';
import { getPatternForStore } from './historicalPatterns';
import { calculateWeightedAverage, numberToCrowdLevel } from './crowdCalculation';
import { getDayOfWeek, getHourOfDay, timeAgo, getDayName } from '@/lib/utils/dateTime';

interface CrowdData {
  level: CrowdLevel | null;
  source: 'real-time' | 'historical' | 'none';
  lastUpdated: number | null;
  message: string;
}

export function getCrowdDataForStore(storeId: string): CrowdData {
  const now = Date.now();
  const recentReports = getCrowdReports().filter(
    (r) => r.storeId === storeId && now - r.timestamp < 30 * 60 * 1000
  );

  // Real-time data available
  if (recentReports.length > 0) {
    const avg = calculateWeightedAverage(recentReports);
    const level = numberToCrowdLevel(avg);
    const lastUpdated = Math.max(...recentReports.map((r) => r.timestamp));

    return {
      level,
      source: 'real-time',
      lastUpdated,
      message: `${level.charAt(0).toUpperCase() + level.slice(1)} - ${timeAgo(lastUpdated)}`,
    };
  }

  // Check historical pattern
  const dayOfWeek = getDayOfWeek(now);
  const hourOfDay = getHourOfDay(now);
  const pattern = getPatternForStore(storeId, dayOfWeek, hourOfDay);

  if (pattern && pattern.reportCount >= 5) {
    const level = numberToCrowdLevel(pattern.averageCrowdLevel);
    const dayName = getDayName(dayOfWeek);

    return {
      level,
      source: 'historical',
      lastUpdated: null,
      message: `Meestal ${level} op ${dayName} tussen ${hourOfDay}:00-${hourOfDay + 1}:00`,
    };
  }

  // No data
  return {
    level: null,
    source: 'none',
    lastUpdated: null,
    message: 'Geen drukte-informatie beschikbaar',
  };
}
