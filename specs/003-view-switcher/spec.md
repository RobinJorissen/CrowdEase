# Feature: View Switcher (Map/List Toggle)

**Status**: Draft  
**Version**: 1.0.0  
**Created**: 2026-01-07  
**Owner**: Robin

---

## Overview

This feature allows users to toggle between map view and list view for displaying nearby stores. The toggle button is placed in the top-right corner of the interface, providing quick access to switch visualization modes based on user preference.

---

## Problem Statement

Some users prefer visual spatial representation (map), while others prefer structured textual information (list). Offering both views increases accessibility and caters to different user preferences and contexts (e.g., list view is better for low-bandwidth or accessibility tools).

**Success Metrics**:

- Users can easily find and use the view toggle
- Both views display identical store information
- View preference is remembered across sessions
- Switching is instant with no loading delay

---

## User Stories

### US-001: Switch to List View

**As a** user viewing the map  
**I want to** switch to a list view  
**So that** I can see stores in a structured, scannable format

**Acceptance Criteria**:

1. **Given** I am in map view, **When** I tap the list icon in top-right, **Then** the view switches to list layout
2. **Given** I am in list view, **When** stores load, **Then** I see stores sorted by distance (closest first)
3. **Given** I am in list view, **When** I tap a store, **Then** I see store details (crowd level, distance, check-in option)

### US-002: Switch to Map View

**As a** user viewing the list  
**I want to** switch back to map view  
**So that** I can see the spatial relationship between stores

**Acceptance Criteria**:

1. **Given** I am in list view, **When** I tap the map icon in top-right, **Then** the view switches to map layout
2. **Given** I switch to map view, **When** the map loads, **Then** I see the same stores as in list view with markers

### US-003: Persist View Preference

**As a** returning user  
**I want to** see my last used view when I reopen the app  
**So that** I don't have to switch views every time

**Acceptance Criteria**:

1. **Given** I close the app in list view, **When** I reopen the app, **Then** I see list view by default
2. **Given** I close the app in map view, **When** I reopen the app, **Then** I see map view by default

### US-004: Visual Recommendation in List View

**As a** user viewing the list  
**I want to** see the best/quietest store highlighted  
**So that** I can quickly identify the recommended option

**Acceptance Criteria**:

1. **Given** I am in list view, **When** stores load, **Then** the quietest store has a visual badge "Aanbeveling"
2. **Given** multiple stores have same crowd level, **When** determining aanbeveling, **Then** the closest store is chosen

---

## Functional Requirements

### FR-001: View Toggle Button

**Priority**: P0 (Critical)  
System MUST display a toggle button in top-right corner to switch between map and list

### FR-002: List View Rendering

**Priority**: P0 (Critical)  
System MUST render stores as a sortable list with: name, type, distance, crowd level

### FR-003: Map View Rendering

**Priority**: P0 (Critical)  
System MUST render stores as markers on OpenStreetMap with existing functionality

### FR-004: View State Persistence

**Priority**: P1 (High)  
System SHOULD save current view preference to localStorage

### FR-005: Recommendation Logic

**Priority**: P0 (Critical)  
System MUST highlight the quietest and closest store as "Aanbeveling" in both views

### FR-006: Responsive Sorting

**Priority**: P1 (High)  
System SHOULD re-sort list when location changes or filters are applied

### FR-007: Accessibility

**Priority**: P1 (High)  
System MUST provide ARIA labels for view toggle and list items

---

## Non-Functional Requirements

### NR-001: Performance

View switching MUST complete within 300ms (no loading spinner)

### NR-002: Visual Consistency

Both views MUST display identical store information and crowd levels

### NR-003: Mobile Optimization

List view MUST be thumb-friendly with minimum 44px touch targets

### NR-004: Icon Clarity

Toggle icons MUST be universally recognizable (map icon / list icon)

---

## UI/UX Requirements

### Toggle Button Design

- **Position**: Top-right corner (absolute positioning)
- **Icon**: Map icon (📍) when in list view, List icon (☰) when in map view
- **Style**: Circular button with shadow, emerald accent
- **Z-index**: Above map but below modals (z-1001)

### List View Layout

```
┌─────────────────────────────────────┐
│  🔍 Search        [Filters]  [📍/☰] │ <- Top bar
├─────────────────────────────────────┤
│  ⭐ AANBEVELING                     │
│  📍 Delhaize Kouter                 │
│  🟢 Rustig - 0.2 km                 │
│  [Check-in]                         │
├─────────────────────────────────────┤
│  📍 Carrefour Express               │
│  🟡 Matig - 0.5 km                  │
│  [Check-in]                         │
├─────────────────────────────────────┤
│  📍 Albert Heijn                    │
│  🔴 Druk - 0.8 km                   │
│  [Check-in]                         │
└─────────────────────────────────────┘
```

### Map View Layout

(Existing StoreMap component with markers)

### Recommendation Badge

- **Visual**: Emerald banner with star icon across top of card/marker
- **Text**: "⭐ Aanbeveling: rustigste winkel in de buurt"
- **Logic**: Prioritize `rustig` > `matig` > `druk`, then sort by distance

---

## Data Model

### ViewPreference

```typescript
interface ViewPreference {
  currentView: 'map' | 'list';
  lastUpdated: number;
}
```

### StoreListItem (extends Store)

```typescript
interface StoreListItem extends Store {
  distance: number; // in km
  isRecommended: boolean;
  crowdLevel: CrowdLevel;
  crowdMessage: string;
}
```

---

## Implementation Notes

### View State Management

- Use React `useState` for current view
- Load from localStorage on mount
- Save to localStorage on change

### Recommendation Algorithm

```typescript
function getRecommendedStore(stores: Store[]): Store | null {
  const sorted = stores.sort((a, b) => {
    // First by crowd level (rustig > matig > druk)
    const crowdOrder = { rustig: 0, matig: 1, druk: 2, null: 3 };
    const levelDiff = crowdOrder[a.crowdLevel] - crowdOrder[b.crowdLevel];
    if (levelDiff !== 0) return levelDiff;

    // Then by distance (closer is better)
    return a.distance - b.distance;
  });

  return sorted[0] || null;
}
```

### Component Structure

```
<ViewSwitcher>
  {view === 'map' ? (
    <StoreMap stores={stores} recommendedId={recommendedId} />
  ) : (
    <StoreList stores={stores} recommendedId={recommendedId} />
  )}
</ViewSwitcher>
```

---

## Testing Requirements

### Unit Tests

- Recommendation algorithm with various crowd levels
- Distance sorting logic
- View preference persistence

### Integration Tests

- Toggle between views maintains store data
- Filters apply to both views
- Recommended store appears in both views

### E2E Tests

- User toggles from map to list
- User toggles from list to map
- View preference persists after refresh
- Recommended store has badge in both views

---

## Dependencies

- Feature 001: Store Map
- Feature 002: Check-in & Rewards (check-in button in list items)
- Distance calculation utility
- localStorage

---

## Success Criteria

Feature is complete when:

- ✅ Toggle button switches between map and list views
- ✅ List view shows stores sorted by distance
- ✅ Recommended store is highlighted in both views
- ✅ View preference is saved and restored
- ✅ Both views show identical data
- ✅ E2E tests pass for view switching
