import { CrowdReport, CrowdLevel } from '@/types/crowd';

// Mock crowd reports for demo purposes
export const mockCrowdReports: CrowdReport[] = [
  {
    storeId: 'store_001',
    crowdLevel: CrowdLevel.RUSTIG,
    timestamp: Date.now() - 5 * 60 * 1000, // 5 minutes ago
    reportWeight: 1.0,
    dayOfWeek: new Date().getDay(),
    hourOfDay: new Date().getHours(),
  },
  {
    storeId: 'store_002',
    crowdLevel: CrowdLevel.DRUK,
    timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
    reportWeight: 1.0,
    dayOfWeek: new Date().getDay(),
    hourOfDay: new Date().getHours(),
  },
  {
    storeId: 'store_003',
    crowdLevel: CrowdLevel.MATIG,
    timestamp: Date.now() - 15 * 60 * 1000,
    reportWeight: 0.7,
    dayOfWeek: new Date().getDay(),
    hourOfDay: new Date().getHours(),
  },
  {
    storeId: 'store_004',
    crowdLevel: CrowdLevel.RUSTIG,
    timestamp: Date.now() - 8 * 60 * 1000,
    reportWeight: 1.0,
    dayOfWeek: new Date().getDay(),
    hourOfDay: new Date().getHours(),
  },
  {
    storeId: 'store_005',
    crowdLevel: CrowdLevel.DRUK,
    timestamp: Date.now() - 12 * 60 * 1000,
    reportWeight: 1.0,
    dayOfWeek: new Date().getDay(),
    hourOfDay: new Date().getHours(),
  },
  {
    storeId: 'store_006',
    crowdLevel: CrowdLevel.MATIG,
    timestamp: Date.now() - 20 * 60 * 1000,
    reportWeight: 0.7,
    dayOfWeek: new Date().getDay(),
    hourOfDay: new Date().getHours(),
  },
  {
    storeId: 'store_007',
    crowdLevel: CrowdLevel.RUSTIG,
    timestamp: Date.now() - 7 * 60 * 1000,
    reportWeight: 1.0,
    dayOfWeek: new Date().getDay(),
    hourOfDay: new Date().getHours(),
  },
  {
    storeId: 'store_008',
    crowdLevel: CrowdLevel.MATIG,
    timestamp: Date.now() - 18 * 60 * 1000,
    reportWeight: 1.0,
    dayOfWeek: new Date().getDay(),
    hourOfDay: new Date().getHours(),
  },
];
