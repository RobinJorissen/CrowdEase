# Tasks: Map/List View Switcher

**Feature**: 003-view-switcher | **Branch**: `003-view-switcher` | **Date**: 2026-01-07  
**Input**: Design documents from `/specs/003-view-switcher/`  
**Prerequisites**: spec.md  
**Dependencies**: Feature 001 (Store Map), Feature 002 (Check-in - for check-in buttons in list)

---

## Task Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

---

## Phase 1: Types & Utilities

### [201] [P] Create View Preference Types

**File**: `src/types/view.ts`

```typescript
export type ViewMode = 'map' | 'list';

export interface ViewPreference {
  currentView: ViewMode;
  lastUpdated: number;
}

export interface StoreWithDistance extends Store {
  distance: number; // in km
  isRecommended?: boolean;
}
```

**Dependencies**: types/store.ts from feature 001

---

### [202] Create View Storage Service

**File**: `src/lib/storage/viewStorage.ts`

```typescript
import { ViewMode, ViewPreference } from '@/types/view';

const VIEW_PREFERENCE_KEY = 'CrowdEase_view_preference';

export function getViewPreference(): ViewMode {
  if (typeof window === 'undefined') return 'map';

  const stored = localStorage.getItem(VIEW_PREFERENCE_KEY);
  if (!stored) return 'map';

  try {
    const parsed: ViewPreference = JSON.parse(stored);
    return parsed.currentView;
  } catch {
    return 'map';
  }
}

export function saveViewPreference(view: ViewMode): void {
  if (typeof window === 'undefined') return;

  const preference: ViewPreference = {
    currentView: view,
    lastUpdated: Date.now(),
  };

  localStorage.setItem(VIEW_PREFERENCE_KEY, JSON.stringify(preference));
}
```

**Dependencies**: types/view.ts

---

### [203] Create Recommendation Utility

**File**: `src/lib/utils/recommendation.ts`

```typescript
import { Store } from '@/types/store';
import { CrowdLevel } from '@/types/crowd';
import { haversineDistance } from '@/lib/location/distance';

const CROWD_ORDER: Record<CrowdLevel | 'null', number> = {
  [CrowdLevel.RUSTIG]: 0,
  [CrowdLevel.MATIG]: 1,
  [CrowdLevel.DRUK]: 2,
  null: 3,
};

export function getRecommendedStore(
  stores: Store[],
  userLocation: { lat: number; lng: number }
): Store | null {
  if (stores.length === 0) return null;

  const storesWithDistance = stores.map((store) => ({
    store,
    distance: haversineDistance(userLocation, store.coordinates),
  }));

  const sorted = storesWithDistance.sort((a, b) => {
    const levelA = a.store.crowdData?.level || 'null';
    const levelB = b.store.crowdData?.level || 'null';

    const crowdDiff = CROWD_ORDER[levelA] - CROWD_ORDER[levelB];
    if (crowdDiff !== 0) return crowdDiff;

    // If crowd levels equal, sort by distance
    return a.distance - b.distance;
  });

  return sorted[0]?.store || null;
}

export function sortStoresByDistance(
  stores: Store[],
  userLocation: { lat: number; lng: number }
): Array<Store & { distance: number }> {
  return stores
    .map((store) => ({
      ...store,
      distance: haversineDistance(userLocation, store.coordinates),
    }))
    .sort((a, b) => a.distance - b.distance);
}
```

**Dependencies**: types/store.ts, types/crowd.ts, lib/location/distance.ts

---

## Phase 2: UI Components

### [204] Create View Toggle Button

**File**: `src/components/view/ViewToggleButton.tsx`

```typescript
'use client';

import { ViewMode } from '@/types/view';

interface ViewToggleButtonProps {
  currentView: ViewMode;
  onToggle: () => void;
}

export default function ViewToggleButton({ currentView, onToggle }: ViewToggleButtonProps) {
  const isMapView = currentView === 'map';

  return (
    <button
      onClick={onToggle}
      className="fixed top-4 right-20 z-[1001] bg-white rounded-full shadow-lg p-3 hover:bg-gray-50 transition-all"
      aria-label={isMapView ? 'Schakel naar lijstweergave' : 'Schakel naar kaartweergave'}
      title={isMapView ? 'Lijstweergave' : 'Kaartweergave'}
    >
      {isMapView ? (
        // List icon
        <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
        </svg>
      ) : (
        // Map icon
        <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      )}
    </button>
  );
}
```

**Dependencies**: types/view.ts

---

### [205] Create Store List View Component

**File**: `src/components/view/StoreList.tsx`

```typescript
'use client';

import { Store } from '@/types/store';
import { CrowdLevel } from '@/types/crowd';
import StoreListItem from './StoreListItem';
import { sortStoresByDistance } from '@/lib/utils/recommendation';

interface StoreListProps {
  stores: Store[];
  userLocation: { lat: number; lng: number };
  recommendedStoreId?: string;
}

export default function StoreList({ stores, userLocation, recommendedStoreId }: StoreListProps) {
  const storesWithDistance = sortStoresByDistance(stores, userLocation);

  if (stores.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-500">Geen winkels gevonden in de buurt</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 space-y-3">
        {storesWithDistance.map((store) => (
          <StoreListItem
            key={store.id}
            store={store}
            distance={store.distance}
            isRecommended={store.id === recommendedStoreId}
          />
        ))}
      </div>
    </div>
  );
}
```

**Dependencies**: types/store.ts, lib/utils/recommendation.ts

---

### [206] Create Store List Item Component

**File**: `src/components/view/StoreListItem.tsx`

```typescript
'use client';

import { Store } from '@/types/store';
import { CrowdLevel } from '@/types/crowd';
import CheckInButton from '@/components/checkin/CheckInButton';

interface StoreListItemProps {
  store: Store & { distance: number };
  isRecommended?: boolean;
}

const CROWD_COLORS = {
  [CrowdLevel.RUSTIG]: 'bg-green-100 text-green-800 border-green-300',
  [CrowdLevel.MATIG]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [CrowdLevel.DRUK]: 'bg-red-100 text-red-800 border-red-300',
};

const CROWD_ICONS = {
  [CrowdLevel.RUSTIG]: '🟢',
  [CrowdLevel.MATIG]: '🟡',
  [CrowdLevel.DRUK]: '🔴',
};

export default function StoreListItem({ store, isRecommended }: StoreListItemProps) {
  const crowdLevel = store.crowdData?.level;
  const crowdColor = crowdLevel ? CROWD_COLORS[crowdLevel] : 'bg-gray-100 text-gray-600';
  const crowdIcon = crowdLevel ? CROWD_ICONS[crowdLevel] : '⚪';

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
        isRecommended ? 'border-2 border-emerald-500' : 'border-gray-200'
      }`}
    >
      {isRecommended && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-2 mb-3 -mx-4 -mt-4 rounded-t-lg">
          <p className="text-emerald-700 font-semibold text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Aanbeveling: rustigste winkel in de buurt
          </p>
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900">{store.name}</h3>
          <p className="text-sm text-gray-600 capitalize">{store.type}</p>
          <p className="text-sm text-gray-500 mt-1">{store.distance.toFixed(2)} km</p>
        </div>

        {crowdLevel && (
          <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${crowdColor}`}>
            {crowdIcon} {crowdLevel.charAt(0).toUpperCase() + crowdLevel.slice(1)}
          </div>
        )}
      </div>

      {store.crowdData?.message && (
        <p className="text-sm text-gray-600 mb-3">{store.crowdData.message}</p>
      )}

      <CheckInButton storeId={store.id} storeName={store.name} />
    </div>
  );
}
```

**Dependencies**: types/store.ts, types/crowd.ts, components/checkin/CheckInButton (from feature 002)

---

## Phase 3: Integration

### [207] Update StoreMap with View Switcher

**File**: `src/components/map/StoreMap.tsx`

Add state and imports:

```typescript
import { useState, useEffect, useMemo } from 'react';
import { ViewMode } from '@/types/view';
import { getViewPreference, saveViewPreference } from '@/lib/storage/viewStorage';
import { getRecommendedStore } from '@/lib/utils/recommendation';
import ViewToggleButton from '@/components/view/ViewToggleButton';
import StoreList from '@/components/view/StoreList';

// Inside component:
const [viewMode, setViewMode] = useState<ViewMode>('map');

useEffect(() => {
  setViewMode(getViewPreference());
}, []);

const handleViewToggle = () => {
  const newView: ViewMode = viewMode === 'map' ? 'list' : 'map';
  setViewMode(newView);
  saveViewPreference(newView);
};

const recommendedStore = useMemo(() => {
  return getRecommendedStore(filteredStores, center);
}, [filteredStores, center]);
```

In JSX:

```typescript
return (
  <div className="relative h-full w-full">
    <LocationInputMinimal onLocationFound={handleLocationFound} />
    <StoreFilterMinimal /* ... */ />
    <ViewToggleButton currentView={viewMode} onToggle={handleViewToggle} />

    {viewMode === 'map' ? (
      <MapContainer /* ... */>{/* existing map content */}</MapContainer>
    ) : (
      <StoreList
        stores={filteredStores}
        userLocation={center}
        recommendedStoreId={recommendedStore?.id}
      />
    )}
  </div>
);
```

**Dependencies**: Tasks [201-206], existing StoreMap from feature 001

---

### [208] Update StoreMarker with Recommendation Badge

**File**: `src/components/map/StoreMarker.tsx`

Add prop:

```typescript
interface StoreMarkerProps {
  store: Store;
  isRecommended?: boolean;
}
```

In Popup content:

```typescript
{
  isRecommended && (
    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-2 mb-3">
      <p className="text-emerald-700 font-semibold text-sm flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Aanbeveling
      </p>
    </div>
  );
}
```

Pass prop in StoreMap:

```typescript
<StoreMarker store={store} isRecommended={store.id === recommendedStore?.id} />
```

**Dependencies**: Task [207]

---

## Phase 4: Testing

### [209] Unit Tests for Recommendation Logic

**File**: `src/lib/utils/__tests__/recommendation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { getRecommendedStore, sortStoresByDistance } from '../recommendation';
import { CrowdLevel } from '@/types/crowd';
import { Store } from '@/types/store';

const MOCK_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'Delhaize Druk',
    type: 'supermarkt',
    coordinates: { lat: 51.0543, lng: 3.7174 },
    crowdData: { level: CrowdLevel.DRUK, message: 'Druk' },
  },
  {
    id: 'store-2',
    name: 'Carrefour Rustig',
    type: 'supermarkt',
    coordinates: { lat: 51.0553, lng: 3.7184 },
    crowdData: { level: CrowdLevel.RUSTIG, message: 'Rustig' },
  },
  {
    id: 'store-3',
    name: 'Albert Heijn Matig',
    type: 'supermarkt',
    coordinates: { lat: 51.0563, lng: 3.7194 },
    crowdData: { level: CrowdLevel.MATIG, message: 'Matig' },
  },
];

describe('Recommendation Logic', () => {
  it('should recommend rustig store over druk store', () => {
    const recommended = getRecommendedStore(MOCK_STORES, { lat: 51.0543, lng: 3.7174 });
    expect(recommended?.id).toBe('store-2');
  });

  it('should recommend closest store when crowd levels are equal', () => {
    const stores = [
      { ...MOCK_STORES[0], crowdData: { level: CrowdLevel.RUSTIG, message: '' } },
      { ...MOCK_STORES[1], crowdData: { level: CrowdLevel.RUSTIG, message: '' } },
    ];

    const recommended = getRecommendedStore(stores, { lat: 51.0543, lng: 3.7174 });
    expect(recommended?.id).toBe('store-1'); // Closest
  });

  it('should sort stores by distance correctly', () => {
    const sorted = sortStoresByDistance(MOCK_STORES, { lat: 51.0543, lng: 3.7174 });
    expect(sorted[0].id).toBe('store-1'); // Closest
    expect(sorted[2].id).toBe('store-3'); // Farthest
  });
});
```

---

### [210] Integration Test for View Switcher

**File**: `src/components/view/__tests__/ViewToggle.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewToggleButton from '../ViewToggleButton';

describe('ViewToggleButton', () => {
  it('should show list icon when in map view', () => {
    render(<ViewToggleButton currentView="map" onToggle={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Schakel naar lijstweergave');
  });

  it('should show map icon when in list view', () => {
    render(<ViewToggleButton currentView="list" onToggle={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Schakel naar kaartweergave');
  });

  it('should call onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<ViewToggleButton currentView="map" onToggle={onToggle} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
```

---

### [211] E2E Test for View Switching

**File**: `tests/e2e/view-switcher.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('View Switcher', () => {
  test('should toggle between map and list views', async ({ page }) => {
    await page.goto('/');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });

    // Map view should be visible by default
    await expect(page.locator('.leaflet-container')).toBeVisible();

    // Click toggle button to switch to list view
    await page.click('button[aria-label*="lijst"]');

    // List view should be visible, map should be hidden
    await expect(page.locator('.leaflet-container')).not.toBeVisible();
    await expect(page.locator('text=/winkels|supermarkt/i').first()).toBeVisible();

    // Click toggle button to switch back to map
    await page.click('button[aria-label*="kaart"]');

    // Map should be visible again
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });

  test('should persist view preference', async ({ page, context }) => {
    await page.goto('/');

    // Switch to list view
    await page.click('button[aria-label*="lijst"]');
    await expect(page.locator('.leaflet-container')).not.toBeVisible();

    // Reload page
    await page.reload();

    // Should still be in list view
    await expect(page.locator('.leaflet-container')).not.toBeVisible();
    await expect(page.locator('text=/winkels|supermarkt/i').first()).toBeVisible();
  });

  test('should show recommendation badge in both views', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });

    // Switch to list view
    await page.click('button[aria-label*="lijst"]');

    // Should see "Aanbeveling" text in list
    await expect(page.locator('text=Aanbeveling')).toBeVisible();

    // Switch back to map view
    await page.click('button[aria-label*="kaart"]');

    // Open recommended store popup (assuming it's visible)
    // Note: This test may need adjustment based on marker behavior
  });
});
```

---

## Phase 5: Documentation

### [212] Update README with View Switcher

Add section to `README.md`:

```markdown
## View Modes

Users can switch between map view and list view using the toggle button in the top-right corner.

### Map View (Default)

- Visual representation of stores on OpenStreetMap
- Markers show crowd level colors
- Click markers to see details and check in

### List View

- Sorted by distance (closest first)
- Shows distance, crowd level, and check-in button
- Recommended store highlighted at top

### Recommendation System

- Prioritizes quiet stores (rustig > matig > druk)
- If crowd levels are equal, chooses closest store
- Highlighted with ⭐ badge in both views
```

---

## Success Criteria

Feature complete when:

- ✅ Toggle button switches between map and list views
- ✅ List view shows stores sorted by distance
- ✅ Recommended store is highlighted in both views
- ✅ View preference persists in localStorage
- ✅ Both views display identical store data
- ✅ Recommendation logic prioritizes quiet + close stores
- ✅ All unit and E2E tests pass

---

## Dependencies Tree

```
[201] Types
  ↓
[202] View Storage ← [203] Recommendation Utility
  ↓
[204] ViewToggleButton ← [205] StoreList ← [206] StoreListItem
  ↓
[207] StoreMap Integration ← [208] StoreMarker Update
  ↓
[209-211] Tests
  ↓
[212] Documentation
```
