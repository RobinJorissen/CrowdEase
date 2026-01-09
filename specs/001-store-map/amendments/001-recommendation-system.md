# Recommendation System Extension

**Status**: Amendment to Feature 001  
**Version**: 1.0.0  
**Created**: 2026-01-07  
**Owner**: Robin

---

## Overview

This amendment adds visual recommendation logic to the existing Store Map feature. The system identifies the "best" store (quietest and closest) and highlights it prominently for users to reduce choice overload.

---

## Changes to Existing Behavior

### Store Map Markers

- Add emerald star badge to recommended store marker
- Ensure recommended marker appears on top of other markers (z-index)
- Marker popup shows "⭐ Aanbeveling" badge

### Store Popup

- Display "Dit is de rustigste winkel in de buurt!" message for recommended store
- Use distinct styling (emerald border, star icon)

---

## Functional Requirements

### FR-017: Recommendation Calculation

**Priority**: P0 (Critical)  
System MUST calculate recommended store using:

1. Prefer stores with `rustig` crowd level
2. If tied, prefer closest distance
3. If no crowd data, use closest store

### FR-018: Visual Highlighting

**Priority**: P0 (Critical)  
System MUST visually distinguish recommended store with:

- Star icon/badge
- Emerald color accent
- "Aanbeveling" label

### FR-019: Recommendation Update

**Priority**: P1 (High)  
System SHOULD recalculate recommendation when:

- User location changes
- Crowd levels update
- Filters change

---

## Implementation

### Update StoreMap.tsx

Add recommendation logic:

```typescript
const recommendedStore = useMemo(() => {
  if (filteredStores.length === 0) return null;

  const sorted = [...filteredStores].sort((a, b) => {
    const crowdOrder: Record<CrowdLevel | 'null', number> = {
      [CrowdLevel.RUSTIG]: 0,
      [CrowdLevel.MATIG]: 1,
      [CrowdLevel.DRUK]: 2,
      null: 3,
    };

    const levelA = a.crowdData?.level || 'null';
    const levelB = b.crowdData?.level || 'null';
    const crowdDiff = crowdOrder[levelA] - crowdOrder[levelB];

    if (crowdDiff !== 0) return crowdDiff;

    // If crowd levels are equal, sort by distance
    const distA = haversineDistance(center, a.coordinates);
    const distB = haversineDistance(center, b.coordinates);
    return distA - distB;
  });

  return sorted[0];
}, [filteredStores, center]);
```

### Update StoreMarker.tsx

Add `isRecommended` prop:

```typescript
interface StoreMarkerProps {
  store: Store;
  isRecommended?: boolean;
}

// In popup:
{
  isRecommended && (
    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-2 mb-2">
      <span className="text-emerald-700 font-semibold">
        ⭐ Aanbeveling: rustigste winkel in de buurt
      </span>
    </div>
  );
}
```

---

## Testing

### Unit Tests

- Recommendation logic with various crowd levels
- Recommendation with tied crowd levels (distance tiebreaker)
- Recommendation with no crowd data

### Integration Tests

- Recommended store updates when location changes
- Recommended store changes when crowd levels update

---

## Success Criteria

- ✅ Quietest store is identified correctly
- ✅ Recommendation updates dynamically
- ✅ Visual highlighting is clear and prominent
- ✅ Tests validate recommendation logic
