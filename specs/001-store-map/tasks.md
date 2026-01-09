# Tasks: Store Map with Crowd Levels

**Feature**: 001-store-map | **Branch**: `001-store-map` | **Date**: 2026-01-07  
**Input**: Design documents from `/specs/001-store-map/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

---

## Task Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (Setup, Foundation, US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure. These tasks establish the foundation.

### [001] [P] Initialize Next.js 15 Project

Create Next.js 15 project with TypeScript and App Router in `CrowdEase/` subdirectory.

```bash
npx create-next-app@latest CrowdEase --typescript --tailwind --app --use-npm
```

**Files created**:

- `package.json`
- `tsconfig.json`
- `next.config.js`
- `app/layout.tsx`
- `app/page.tsx`
- `tailwind.config.ts`

---

### [002] [P] Install Core Dependencies

Install React Leaflet, PWA, and testing libraries.

```bash
npm install react-leaflet@latest leaflet@latest
npm install @types/leaflet@latest
npm install next-pwa@latest
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test
npm install -D @vitejs/plugin-react
```

**Files modified**: `package.json`

---

### [003] Configure PWA Support

Configure next-pwa plugin in Next.js config.

**File**: `next.config.js`

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  reactStrictMode: true,
});
```

---

### [004] Create PWA Manifest

**File**: `app/manifest.json`

```json
{
  "name": "CrowdEase",
  "short_name": "CrowdEase",
  "description": "Vind rustige winkels in de buurt",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**TODO**: Create placeholder icon files in `public/icons/`

---

### [005] Configure Vitest

**File**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**File**: `tests/setup.ts`

```typescript
import '@testing-library/jest-dom';
```

---

### [006] Configure Playwright

**File**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### [007] Update package.json Scripts

Add test and dev scripts.

**File**: `package.json` (scripts section)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

---

### [008] Install shadcn/ui

Initialize shadcn/ui and add button, input, card components.

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
```

**Files created**:

- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/card.tsx`
- `lib/utils.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, utilities, and services needed by all user stories.

### [009] [P] Define Core TypeScript Types

**File**: `types/store.ts`

```typescript
export interface Store {
  id: string;
  name: string;
  type: StoreType;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  openingHours: {
    [day: number]: {
      open: string;
      close: string;
    };
  } | null;
}

export enum StoreType {
  SUPERMARKT = 'supermarkt',
  APOTHEEK = 'apotheek',
  DROGISTERIJ = 'drogisterij',
  BAKKERIJ = 'bakkerij',
  SLAGERIJ = 'slagerij',
}
```

---

### [010] [P] Define Crowd & Location Types

**File**: `types/crowd.ts`

```typescript
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
```

**File**: `types/location.ts`

```typescript
export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  source: LocationSource;
}

export enum LocationSource {
  GPS = 'gps',
  GEOCODED = 'geocoded',
}

export interface SavedAddress {
  street: string;
  city: string;
  postalCode: string;
}
```

**File**: `types/map.ts`

```typescript
import { StoreType } from './store';

export interface MapState {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  selectedStoreId: string | null;
  activeFilters: StoreType[];
}
```

---

### [011] [P] Create Mock Store Data

Generate 60 stores in Gent centrum area.

**File**: `lib/stores/mockStores.ts`

```typescript
import { Store, StoreType } from '@/types/store';

export const mockStores: Store[] = [
  {
    id: 'store_001',
    name: 'Colruyt',
    type: StoreType.SUPERMARKT,
    address: {
      street: 'Veldstraat 10',
      city: 'Gent',
      postalCode: '9000',
    },
    coordinates: {
      lat: 51.0543,
      lng: 3.7174,
    },
    openingHours: {
      0: { open: '10:00', close: '20:00' },
      1: { open: '08:00', close: '22:00' },
      2: { open: '08:00', close: '22:00' },
      3: { open: '08:00', close: '22:00' },
      4: { open: '08:00', close: '22:00' },
      5: { open: '08:00', close: '22:00' },
      6: { open: '08:00', close: '22:00' },
    },
  },
  // ... add 59 more stores
];
```

**TODO**: Generate realistic Gent addresses and coordinates programmatically or manually.

---

### [012] [P] Implement Haversine Distance Calculation

Calculate distance between two GPS coordinates.

**File**: `lib/location/distance.ts`

```typescript
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
```

**Test file**: `lib/location/distance.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { haversineDistance } from './distance';

describe('haversineDistance', () => {
  it('should calculate distance between two points in km', () => {
    // Gent Korenmarkt to Gent Sint-Pieters
    const distance = haversineDistance(51.0543, 3.7174, 51.0362, 3.7104);
    expect(distance).toBeCloseTo(2.1, 1);
  });

  it('should return 0 for same coordinates', () => {
    const distance = haversineDistance(51.0543, 3.7174, 51.0543, 3.7174);
    expect(distance).toBe(0);
  });
});
```

**Run**: `npm test distance.test.ts`

---

### [013] [P] Implement DateTime Utilities

Extract day of week and hour from timestamp.

**File**: `lib/utils/dateTime.ts`

```typescript
export function getDayOfWeek(timestamp: number): number {
  return new Date(timestamp).getDay();
}

export function getHourOfDay(timestamp: number): number {
  return new Date(timestamp).getHours();
}

export function getDayName(dayOfWeek: number): string {
  const days = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  return days[dayOfWeek];
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return `${seconds} seconden`;
  if (seconds < 120) return '1 minuut';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minuten`;
  if (seconds < 7200) return '1 uur';
  return `${Math.floor(seconds / 3600)} uur`;
}
```

**Test file**: `lib/utils/dateTime.test.ts`

---

### [014] [P] Implement localStorage Storage Utilities

CRUD operations for crowd reports and patterns.

**File**: `lib/storage/crowdStorage.ts`

```typescript
import { CrowdReport } from '@/types/crowd';

const STORAGE_KEY = 'crowdReports';

export function getCrowdReports(): CrowdReport[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
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
```

**File**: `lib/storage/patternStorage.ts` (similar structure for HistoricalPattern)

**File**: `lib/storage/addressStorage.ts` (similar for SavedAddress)

---

### [015] Implement Crowd Level Calculation Logic

Weighted average and number-to-level conversion.

**File**: `lib/crowd/crowdCalculation.ts`

```typescript
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
```

**Test file**: `lib/crowd/crowdCalculation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { calculateWeightedAverage, numberToCrowdLevel } from './crowdCalculation';
import { CrowdLevel } from '@/types/crowd';

describe('calculateWeightedAverage', () => {
  it('should calculate weighted average correctly', () => {
    const reports = [
      {
        crowdLevel: CrowdLevel.DRUK,
        reportWeight: 1.0,
        storeId: '1',
        timestamp: 0,
        dayOfWeek: 0,
        hourOfDay: 0,
      },
      {
        crowdLevel: CrowdLevel.RUSTIG,
        reportWeight: 0.7,
        storeId: '1',
        timestamp: 0,
        dayOfWeek: 0,
        hourOfDay: 0,
      },
    ];

    const avg = calculateWeightedAverage(reports);
    expect(avg).toBeCloseTo(0.588, 2);
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
});
```

**Run**: `npm test crowdCalculation.test.ts`

---

## User Story 1: View Nearby Stores on Map (Priority: P1)

**Goal**: Display interactive map with store markers based on GPS or address input.

### [016] Create Map Page Layout

**File**: `app/(map)/layout.tsx`

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CrowdEase - Vind rustige winkels',
  description: 'Zie welke winkels druk of rustig zijn in je buurt',
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

---

### [017] Create Map Page with Dynamic Import

**File**: `app/(map)/page.tsx`

```typescript
'use client';

import dynamic from 'next/dynamic';

const StoreMap = dynamic(() => import('@/components/map/StoreMap'), {
  ssr: false,
  loading: () => <div className="h-screen flex items-center justify-center">Kaart laden...</div>,
});

export default function MapPage() {
  return (
    <main className="h-screen w-full">
      <StoreMap />
    </main>
  );
}
```

---

### [018] Implement Browser Geolocation Service

**File**: `lib/location/geolocation.ts`

```typescript
import { UserLocation, LocationSource } from '@/types/location';

export async function getCurrentLocation(): Promise<UserLocation | null> {
  if (!navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
          source: LocationSource.GPS,
        });
      },
      () => resolve(null),
      { timeout: 5000, maximumAge: 0 }
    );
  });
}
```

**Test file**: Mock geolocation API in tests

---

### [019] Create LocationInput Component

Address input with geocoding.

**File**: `components/map/LocationInput.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  onLocationFound: (lat: number, lng: number) => void;
}

export default function LocationInput({ onLocationFound }: Props) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGeocode = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const data = await res.json();

      if (data.success) {
        onLocationFound(data.result.lat, data.result.lng);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg max-w-md">
      <Input
        type="text"
        placeholder="Voer je adres in (bijv. Veldstraat 10, Gent)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleGeocode()}
      />
      <Button onClick={handleGeocode} disabled={loading} className="mt-2 w-full">
        {loading ? 'Zoeken...' : 'Zoek'}
      </Button>
    </div>
  );
}
```

---

### [020] Create StoreMap Component

Main Leaflet map with markers.

**File**: `components/map/StoreMap.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getCurrentLocation } from '@/lib/location/geolocation';
import LocationInput from './LocationInput';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = { lat: 51.0543, lng: 3.7174 };
const DEFAULT_ZOOM = 14;

export default function StoreMap() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    getCurrentLocation().then((location) => {
      if (location) {
        setCenter({ lat: location.lat, lng: location.lng });
        setHasLocation(true);
      }
    });
  }, []);

  return (
    <div className="relative h-full w-full">
      {!hasLocation && (
        <LocationInput
          onLocationFound={(lat, lng) => {
            setCenter({ lat, lng });
            setHasLocation(true);
          }}
        />
      )}

      <MapContainer center={[center.lat, center.lng]} zoom={DEFAULT_ZOOM} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* TODO: Add store markers in next task */}
      </MapContainer>
    </div>
  );
}
```

---

### [021] Implement GET /api/geocode Route Handler

**File**: `app/api/geocode/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Missing address', message: 'Address parameter is required' },
      { status: 400 }
    );
  }

  try {
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
    nominatimUrl.searchParams.set('q', address);
    nominatimUrl.searchParams.set('format', 'json');
    nominatimUrl.searchParams.set('limit', '1');
    nominatimUrl.searchParams.set('countrycodes', 'be');

    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'CrowdEase/1.0',
      },
    });

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error: 'Address not found',
          message: 'Adres niet gevonden. Probeer een ander adres of postcode.',
        },
        { status: 404 }
      );
    }

    const result = data[0];

    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400));

    return NextResponse.json({
      success: true,
      result: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
        confidence: parseFloat(result.importance ?? 0.5),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Geocoding service unavailable' }, { status: 503 });
  }
}
```

---

### [022] E2E Test: Map Loads and Accepts Address Input

**File**: `tests/e2e/mapInteraction.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('should display map with location input when GPS denied', async ({ page }) => {
  await page.goto('/');

  // Wait for map to load
  await expect(page.locator('.leaflet-container')).toBeVisible();

  // Check for location input
  await expect(page.getByPlaceholder(/Voer je adres in/)).toBeVisible();
});

test('should geocode address and center map', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder(/Voer je adres in/).fill('Korenmarkt, Gent');
  await page.getByRole('button', { name: /Zoek/ }).click();

  // Map should re-center (check for tile loading)
  await expect(page.locator('.leaflet-tile-loaded')).toBeVisible({ timeout: 10000 });
});
```

**Run**: `npm run test:e2e`

---

### [022-A] [FUTURE] Add Address Autocomplete Suggestions

**Priority**: P2 (Enhancement)  
**Depends on**: Task 021 (geocode API)

Add autocomplete dropdown for address input starting from 3 typed characters.

**File**: `components/map/LocationInput.tsx` (update)

Features:

- Debounced Nominatim autocomplete API calls (min 3 chars)
- Dropdown with max 5 suggestions
- Keyboard navigation (arrow keys, Enter to select)
- Click to select suggestion
- Loading state while fetching

**File**: `app/api/geocode/autocomplete/route.ts` (new)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
    nominatimUrl.searchParams.set('q', query);
    nominatimUrl.searchParams.set('format', 'json');
    nominatimUrl.searchParams.set('limit', '5');
    nominatimUrl.searchParams.set('countrycodes', 'be');
    nominatimUrl.searchParams.set('addressdetails', '1');

    const response = await fetch(nominatimUrl.toString(), {
      headers: { 'User-Agent': 'CrowdEase/1.0' },
    });

    const data = await response.json();

    const suggestions = data.map((item: any) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ suggestions: [] });
  }
}
```

**Test file**: `components/map/LocationInput.test.tsx`

---

## User Story 2: See Real-time Crowd Levels (Priority: P1)

**Goal**: Display crowd levels on store markers (real-time + historical).

### [023] Implement Store Service

Query nearby stores.

**File**: `lib/stores/storeService.ts`

```typescript
import { mockStores } from './mockStores';
import { Store } from '@/types/store';
import { haversineDistance } from '@/lib/location/distance';

export function getStoreById(id: string): Store | undefined {
  return mockStores.find((s) => s.id === id);
}

export function getNearbyStores(lat: number, lng: number, radiusKm: number = 5): Store[] {
  return mockStores
    .map((store) => ({
      store,
      distance: haversineDistance(lat, lng, store.coordinates.lat, store.coordinates.lng),
    }))
    .filter(({ distance }) => distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .map(({ store }) => store);
}
```

---

### [024] Implement Historical Pattern Service

**File**: `lib/crowd/historicalPatterns.ts`

```typescript
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
```

---

### [025] Implement Crowd Report Service

Combines real-time and historical data.

**File**: `lib/crowd/crowdReportService.ts`

```typescript
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
      message: `${level.charAt(0).toUpperCase() + level.slice(1)} - ${timeAgo(lastUpdated)} gemeld`,
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
```

**Test file**: `lib/crowd/crowdReportService.test.ts`

---

### [026] Implement GET /api/stores Route Handler

**File**: `app/api/stores/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getNearbyStores } from '@/lib/stores/storeService';
import { getCrowdDataForStore } from '@/lib/crowd/crowdReportService';
import { haversineDistance } from '@/lib/location/distance';

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
    crowdData: getCrowdDataForStore(store.id),
    isOpen: true, // TODO: implement opening hours check
  }));

  // Simulate latency
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

  return NextResponse.json({ stores: storesWithCrowdData });
}
```

---

### [027] Create StoreMarker Component

**File**: `components/map/StoreMarker.tsx`

```typescript
'use client';

import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { CrowdLevel } from '@/types/crowd';

interface Props {
  lat: number;
  lng: number;
  name: string;
  crowdLevel: CrowdLevel | null;
  crowdMessage: string;
}

// Custom marker colors based on crowd level
const getMarkerColor = (level: CrowdLevel | null) => {
  if (level === CrowdLevel.RUSTIG) return 'green';
  if (level === CrowdLevel.MATIG) return 'yellow';
  if (level === CrowdLevel.DRUK) return 'red';
  return 'gray';
};

export default function StoreMarker({ lat, lng, name, crowdLevel, crowdMessage }: Props) {
  const color = getMarkerColor(crowdLevel);

  return (
    <Marker
      position={[lat, lng]}
      icon={
        new Icon({
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      }
    >
      <Popup>
        <div className="text-sm">
          <h3 className="font-bold">{name}</h3>
          <p className="mt-1">{crowdMessage}</p>
        </div>
      </Popup>
    </Marker>
  );
}
```

---

### [028] Update StoreMap to Fetch and Display Stores

**File**: `components/map/StoreMap.tsx` (update)

Add state for stores and fetch from API:

```typescript
const [stores, setStores] = useState([]);

useEffect(() => {
  if (hasLocation) {
    fetch(`/api/stores?lat=${center.lat}&lng=${center.lng}`)
      .then((res) => res.json())
      .then((data) => setStores(data.stores));
  }
}, [center, hasLocation]);

// In MapContainer, add:
{
  stores.map((store) => (
    <StoreMarker
      key={store.id}
      lat={store.coordinates.lat}
      lng={store.coordinates.lng}
      name={store.name}
      crowdLevel={store.crowdData.level}
      crowdMessage={store.crowdData.message}
    />
  ));
}
```

---

### [029] Integration Test: Store Discovery Flow

**File**: `tests/integration/storeDiscovery.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getNearbyStores } from '@/lib/stores/storeService';
import { getCrowdDataForStore } from '@/lib/crowd/crowdReportService';

describe('Store Discovery Flow', () => {
  it('should find stores within radius', () => {
    const stores = getNearbyStores(51.0543, 3.7174, 5);
    expect(stores.length).toBeGreaterThan(0);
  });

  it('should get crowd data for store', () => {
    const crowdData = getCrowdDataForStore('store_001');
    expect(crowdData).toHaveProperty('level');
    expect(crowdData).toHaveProperty('source');
    expect(crowdData).toHaveProperty('message');
  });
});
```

---

## User Story 3: Compare Multiple Stores (Priority: P2)

**Goal**: Filter stores by type and visually emphasize quieter options.

### [030] Create Store Type Filter Component

**File**: `components/map/StoreTypeFilter.tsx`

```typescript
'use client';

import { StoreType } from '@/types/store';
import { Button } from '@/components/ui/button';

interface Props {
  activeFilters: StoreType[];
  onFilterChange: (filters: StoreType[]) => void;
}

export default function StoreTypeFilter({ activeFilters, onFilterChange }: Props) {
  const types = Object.values(StoreType);

  const toggleFilter = (type: StoreType) => {
    if (activeFilters.includes(type)) {
      onFilterChange(activeFilters.filter((t) => t !== type));
    } else {
      onFilterChange([...activeFilters, type]);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
      <h3 className="font-bold mb-2">Filter op type</h3>
      <div className="flex flex-col gap-2">
        {types.map((type) => (
          <Button
            key={type}
            variant={activeFilters.includes(type) ? 'default' : 'outline'}
            onClick={() => toggleFilter(type)}
            size="sm"
          >
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

---

### [031] Add Filter Logic to StoreMap

Update StoreMap to support filtering by store type.

---

### [032] Add Comparison Info to Store Popup

Update StoreMarker popup to show comparison: "Rustiger dan X van Y winkels in de buurt"

---

## User Story 4: Indicate Store Crowdedness (Priority: P2)

**Goal**: Allow users to submit crowd reports with weighted validation.

### [033] Implement Crowd Report Validation

**File**: `lib/crowd/validation.ts`

```typescript
import { UserLocation } from '@/types/location';
import { ReportWeight } from '@/types/crowd';
import { getStoreById } from '@/lib/stores/storeService';
import { haversineDistance } from '@/lib/location/distance';

interface ValidationResult {
  valid: boolean;
  weight: ReportWeight;
  error?: string;
}

export function validateCrowdReport(
  storeId: string,
  userLocation: UserLocation | null,
  lastReportTime: number | null
): ValidationResult {
  // Check cooldown
  if (lastReportTime && Date.now() - lastReportTime < 30 * 60 * 1000) {
    return {
      valid: false,
      weight: 0.7,
      error: 'Je hebt recent al een melding gedaan',
    };
  }

  // Determine weight based on GPS proximity
  if (userLocation && userLocation.source === 'gps') {
    const store = getStoreById(storeId);
    if (!store) {
      return { valid: false, weight: 0.7, error: 'Winkel niet gevonden' };
    }

    const distance =
      haversineDistance(
        userLocation.lat,
        userLocation.lng,
        store.coordinates.lat,
        store.coordinates.lng
      ) * 1000; // Convert to meters

    if (distance < 100) {
      return { valid: true, weight: 1.0 };
    } else {
      return {
        valid: true,
        weight: 0.7,
        error: 'Je bent te ver weg. Je melding telt minder zwaar.',
      };
    }
  }

  // No GPS or geocoded location
  return { valid: true, weight: 0.7 };
}
```

**Test file**: `lib/crowd/validation.test.ts`

---

### [034] Implement POST /api/crowd-report Route Handler

**File**: `app/api/crowd-report/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CrowdLevel, CrowdReport, ReportWeight } from '@/types/crowd';
import { saveCrowdReport, clearExpiredReports } from '@/lib/storage/crowdStorage';
import { validateCrowdReport } from '@/lib/crowd/validation';
import { getDayOfWeek, getHourOfDay } from '@/lib/utils/dateTime';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { storeId, crowdLevel, userLocation } = body;

  if (!storeId || !crowdLevel) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!Object.values(CrowdLevel).includes(crowdLevel)) {
    return NextResponse.json({ error: 'Invalid crowd level' }, { status: 400 });
  }

  // Get last report time from localStorage simulation
  // In real implementation, this would come from request headers or session
  const lastReportTime = null; // TODO: implement properly

  const validation = validateCrowdReport(storeId, userLocation, lastReportTime);

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 429 });
  }

  const now = Date.now();
  const report: CrowdReport = {
    storeId,
    crowdLevel,
    timestamp: now,
    reportWeight: validation.weight,
    dayOfWeek: getDayOfWeek(now),
    hourOfDay: getHourOfDay(now),
  };

  saveCrowdReport(report);
  clearExpiredReports();

  const message =
    validation.weight === 1.0
      ? 'Bedankt! Je melding helpt anderen.'
      : 'Bedankt! Je melding telt minder zwaar maar helpt wel.';

  // Simulate latency
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

  return NextResponse.json(
    {
      success: true,
      report: {
        storeId,
        crowdLevel,
        timestamp: now,
        reportWeight: validation.weight,
        message,
      },
    },
    { status: 201 }
  );
}
```

---

### [035] Add Report Buttons to Store Popup

Update StoreMarker to include "Druk" and "Rustig" buttons.

**File**: `components/map/StoreMarker.tsx` (update)

Add buttons and submit logic.

---

### [036] Integration Test: Crowd Reporting Flow

**File**: `tests/integration/crowdReporting.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { validateCrowdReport } from '@/lib/crowd/validation';
import { LocationSource } from '@/types/location';

describe('Crowd Reporting Flow', () => {
  it('should assign weight 1.0 for GPS within 100m', () => {
    const result = validateCrowdReport(
      'store_001',
      {
        lat: 51.0543,
        lng: 3.7174,
        accuracy: 10,
        timestamp: Date.now(),
        source: LocationSource.GPS,
      },
      null
    );
    expect(result.valid).toBe(true);
    expect(result.weight).toBe(1.0);
  });

  it('should assign weight 0.7 for non-GPS', () => {
    const result = validateCrowdReport('store_001', null, null);
    expect(result.valid).toBe(true);
    expect(result.weight).toBe(0.7);
  });

  it('should reject duplicate report within 30 min', () => {
    const lastReportTime = Date.now() - 10 * 60 * 1000; // 10 min ago
    const result = validateCrowdReport('store_001', null, lastReportTime);
    expect(result.valid).toBe(false);
  });
});
```

---

## Final Tasks

### [037] E2E Test: Full User Journey

**File**: `tests/e2e/crowdReportFlow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('complete user journey: view stores → submit report', async ({ page }) => {
  await page.goto('/');

  // Enter address
  await page.getByPlaceholder(/Voer je adres in/).fill('Korenmarkt, Gent');
  await page.getByRole('button', { name: /Zoek/ }).click();

  // Wait for stores to load
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(10, { timeout: 10000 });

  // Click on a store marker
  await page.locator('.leaflet-marker-icon').first().click();

  // Submit crowd report
  await page.getByRole('button', { name: /Rustig/ }).click();

  // Verify confirmation message
  await expect(page.getByText(/Bedankt!/)).toBeVisible();
});
```

---

### [038] Add Leaflet CSS to Root Layout

**File**: `app/layout.tsx`

Add Leaflet CSS link in `<head>`.

---

### [039] Create Offline Fallback Page

**File**: `public/offline.html`

Simple HTML page shown when PWA is offline.

---

### [040] Run All Tests and Fix Issues

```bash
npm run test:all
```

Fix any failing tests.

---

## Task Execution Order

### Sequential (Blocking)

1. Phase 1: Setup (001-008) - Must complete first
2. Phase 2: Foundational (009-015) - Blocks all user stories
3. User Story 1 (016-022) - Required for US2
4. User Story 2 (023-029) - Required for US3 & US4
5. User Story 3 (030-032) - Can run in parallel with US4
6. User Story 4 (033-036) - Can run in parallel with US3
7. Final Tasks (037-040) - Must be last

### Parallel Opportunities

Within each phase, tasks marked **[P]** can run in parallel:

- Setup: All tasks (001-008) can parallelize
- Foundational: (009-014) can parallelize, (015) depends on (012-014)
- US1: (016-018) parallel, (019-021) parallel after (016-018)
- US2: (023-025) parallel, (026-028) sequential
- US3-US4: Entire user stories can run in parallel after US2

---

## Definition of Done

Each task is complete when:

- [ ] Code is written and follows TypeScript strict mode
- [ ] Tests are written and passing (if applicable)
- [ ] Code is committed to branch `001-store-map`
- [ ] No linting errors (`npm run lint`)
- [ ] Functionality is manually tested in browser

---

**Total Tasks**: 40  
**Estimated Effort**: 5-7 development days for one developer  
**Test Coverage**: Unit tests (12 files), Integration tests (2 files), E2E tests (3 files)

Ready for implementation! 🚀
