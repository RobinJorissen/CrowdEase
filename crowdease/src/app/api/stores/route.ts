import { NextRequest, NextResponse } from 'next/server';
import { getNearbyStores } from '@/lib/stores/storeService';
import { haversineDistance } from '@/lib/location/distance';
import { generateMockOpeningHours } from '@/lib/utils/openingHours';
import { CrowdLevel } from '@/types/crowd';
import { numberToCrowdLevel } from '@/lib/crowd/crowdCalculation';
import { getPatternForStore } from '@/lib/crowd/historicalPatterns';
import { getDayOfWeek, getHourOfDay } from '@/lib/utils/dateTime';

// Mock crowd data for demo (server-side)
const mockCrowdData: Record<string, CrowdLevel> = {
  store_001: CrowdLevel.RUSTIG,
  store_002: CrowdLevel.DRUK,
  store_003: CrowdLevel.MATIG,
  store_004: CrowdLevel.RUSTIG,
  store_005: CrowdLevel.DRUK,
  store_006: CrowdLevel.MATIG,
  store_007: CrowdLevel.RUSTIG,
  store_008: CrowdLevel.MATIG,
  store_009: CrowdLevel.RUSTIG,
  store_010: CrowdLevel.MATIG,
  store_011: CrowdLevel.DRUK,
  store_012: CrowdLevel.RUSTIG,
  store_013: CrowdLevel.MATIG,
  store_014: CrowdLevel.DRUK,
  store_015: CrowdLevel.RUSTIG,
  store_016: CrowdLevel.MATIG,
  store_017: CrowdLevel.DRUK,
  store_018: CrowdLevel.RUSTIG,
  store_019: CrowdLevel.MATIG,
  store_020: CrowdLevel.DRUK,
  store_021: CrowdLevel.RUSTIG,
  store_022: CrowdLevel.MATIG,
  store_023: CrowdLevel.DRUK,
  store_024: CrowdLevel.RUSTIG,
  store_025: CrowdLevel.MATIG,
  store_026: CrowdLevel.DRUK,
  store_027: CrowdLevel.RUSTIG,
  store_028: CrowdLevel.MATIG,
  store_029: CrowdLevel.DRUK,
  store_030: CrowdLevel.RUSTIG,
  store_031: CrowdLevel.MATIG,
  store_032: CrowdLevel.DRUK,
  store_033: CrowdLevel.RUSTIG,
  store_034: CrowdLevel.MATIG,
  store_035: CrowdLevel.DRUK,
  store_036: CrowdLevel.RUSTIG,
  store_037: CrowdLevel.MATIG,
  store_038: CrowdLevel.DRUK,
  store_039: CrowdLevel.RUSTIG,
  store_040: CrowdLevel.MATIG,
  store_041: CrowdLevel.DRUK,
  store_042: CrowdLevel.RUSTIG,
  store_043: CrowdLevel.MATIG,
  store_044: CrowdLevel.DRUK,
  store_045: CrowdLevel.RUSTIG,
  store_046: CrowdLevel.MATIG,
  store_047: CrowdLevel.DRUK,
  store_048: CrowdLevel.RUSTIG,
  store_049: CrowdLevel.MATIG,
  store_050: CrowdLevel.DRUK,
  store_061: CrowdLevel.RUSTIG,
  store_062: CrowdLevel.MATIG,
  store_063: CrowdLevel.DRUK,
  store_064: CrowdLevel.RUSTIG,
  store_065: CrowdLevel.MATIG,
  store_070: CrowdLevel.DRUK,
  store_075: CrowdLevel.RUSTIG,
  store_080: CrowdLevel.MATIG,
  store_085: CrowdLevel.DRUK,
  store_090: CrowdLevel.RUSTIG,
  store_095: CrowdLevel.MATIG,
};

function getCrowdDataMock(storeId: string) {
  const now = Date.now();

  // 1. First priority: Mock real-time data
  const level = mockCrowdData[storeId] || null;
  if (level) {
    return {
      level,
      source: 'real-time' as const,
      lastUpdated: now - Math.random() * 20 * 60 * 1000,
      message: `${level.charAt(0).toUpperCase() + level.slice(1)} - ${Math.floor(
        Math.random() * 20 + 5
      )} minuten geleden`,
    };
  }

  // 2. Second priority: Historical pattern
  const currentDay = getDayOfWeek(now);
  const currentHour = getHourOfDay(now);
  const pattern = getPatternForStore(storeId, currentDay, currentHour);

  if (pattern && pattern.reportCount >= 5) {
    const historicalLevel = numberToCrowdLevel(pattern.averageCrowdLevel);
    return {
      level: historicalLevel,
      source: 'historical' as const,
      lastUpdated: pattern.lastUpdated,
      message: `${
        historicalLevel.charAt(0).toUpperCase() + historicalLevel.slice(1)
      } (historisch patroon, ${pattern.reportCount} meldingen)`,
    };
  }

  // 3. No data available
  return {
    level: null,
    source: 'none' as const,
    lastUpdated: null,
    message: 'Geen drukte-informatie beschikbaar',
  };
}

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get('lat') || '');
  const lng = parseFloat(request.nextUrl.searchParams.get('lng') || '');
  const radius = parseFloat(request.nextUrl.searchParams.get('radius') || '5');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const stores = getNearbyStores(lat, lng, radius);

  const storesWithCrowdData = stores.map((store) => ({
    ...store,
    distance: haversineDistance(lat, lng, store.coordinates.lat, store.coordinates.lng),
    crowdData: getCrowdDataMock(store.id),
    openingHours: generateMockOpeningHours(store.type),
    isOpen: true, // TODO: implement opening hours check
  }));

  return NextResponse.json({ stores: storesWithCrowdData });
}
