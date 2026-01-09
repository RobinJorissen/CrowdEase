# Data Model: Store Map with Crowd Levels

**Feature**: 001-store-map | **Phase**: 1 (Design) | **Date**: 2026-01-07

## Entity Definitions

### 1. Store

Represents a physical retail location.

```typescript
interface Store {
  id: string; // Unique identifier, e.g., "store_001"
  name: string; // Store name, e.g., "Colruyt"
  type: StoreType; // Category
  address: {
    street: string; // "Veldstraat 10"
    city: string; // "Gent"
    postalCode: string; // "9000"
  };
  coordinates: {
    lat: number; // 51.0543
    lng: number; // 3.7174
  };
  openingHours: {
    [day: number]: {
      // 0=Sunday, 6=Saturday
      open: string; // "08:00"
      close: string; // "22:00"
    };
  } | null; // null = always open or hours unknown
}

enum StoreType {
  SUPERMARKT = 'supermarkt',
  APOTHEEK = 'apotheek',
  DROGISTERIJ = 'drogisterij',
  BAKKERIJ = 'bakkerij',
  SLAGERIJ = 'slagerij',
}
```

**Mock Data Location**: `lib/stores/mockStores.ts`  
**Count**: ~60 stores in Gent centrum area  
**Source**: Hardcoded array, no external API

---

### 2. CrowdReport

User-submitted crowd indication with metadata for pattern analysis.

```typescript
interface CrowdReport {
  storeId: string; // Foreign key to Store.id
  crowdLevel: CrowdLevel; // User's assessment
  timestamp: number; // Unix timestamp (ms)
  reportWeight: ReportWeight; // 1.0 = GPS-verified, 0.7 = non-GPS
  dayOfWeek: number; // 0-6, Sunday = 0
  hourOfDay: number; // 0-23
}

enum CrowdLevel {
  RUSTIG = 'rustig', // Quiet
  MATIG = 'matig', // Moderate
  DRUK = 'druk', // Busy
}

type ReportWeight = 1.0 | 0.7; // Strongly typed weights
```

**Storage**: localStorage key `crowdReports` (JSON array)  
**Retention**:

- Weight 1.0: 7 days, then aggregated into patterns
- Weight 0.7: 24 hours, then deleted

**Privacy**:

- ❌ No GPS coordinates stored
- ❌ No user ID or device ID
- ✅ Only: storeId, level, timestamp, weight, day, hour

---

### 3. HistoricalPattern

Aggregated crowd data for a specific time slot.

```typescript
interface HistoricalPattern {
  storeId: string; // Foreign key to Store.id
  dayOfWeek: number; // 0-6
  hourOfDay: number; // 0-23
  averageCrowdLevel: number; // 0.0-1.0 (weighted average)
  reportCount: number; // Number of reports in aggregation
  lastUpdated: number; // Unix timestamp (ms)
}
```

**Calculation**:

```typescript
// Map CrowdLevel to numeric values
const levelToNumber = {
  rustig: 0.0,
  matig: 0.5,
  druk: 1.0
}

// Weighted average
averageCrowdLevel =
  Σ(levelToNumber[report.crowdLevel] × report.reportWeight)
  / Σ(report.reportWeight)
```

**Reverse Mapping** (for display):

- 0.00 - 0.33 → rustig
- 0.34 - 0.66 → matig
- 0.67 - 1.00 → druk

**Minimum Threshold**: Require ≥5 reports before showing pattern

**Storage**: localStorage key `historicalPatterns` (JSON array)  
**Update Frequency**: Daily at midnight (simulated via cron-like check on app load)

---

### 4. UserLocation

Runtime-only entity, never persisted.

```typescript
interface UserLocation {
  lat: number; // Latitude
  lng: number; // Longitude
  accuracy: number; // Meters (from Geolocation API)
  timestamp: number; // When location was obtained
  source: LocationSource; // How it was obtained
}

enum LocationSource {
  GPS = 'gps', // Browser Geolocation API
  GEOCODED = 'geocoded', // Nominatim address lookup
}
```

**Lifecycle**:

1. Obtained from browser or geocoding
2. Used to calculate nearby stores
3. **Immediately discarded** after use
4. Never written to localStorage or sessionStorage

**Privacy Requirement**: Clear from memory after:

- Calculating store distances
- Validating proximity for crowd reports

---

### 5. SavedAddress

Optional user preference for address-based location.

```typescript
interface SavedAddress {
  street: string; // "Veldstraat 10"
  city: string; // "Gent"
  postalCode: string; // "9000"
}
```

**Storage**: localStorage key `savedAddress` (JSON object or null)  
**Privacy**: No GPS coordinates stored, only human-readable address  
**Usage**: User can opt-in via checkbox "Bewaar dit adres"

**Geocoding Flow**:

1. User enters address
2. App calls Nominatim to get lat/lng
3. lat/lng used to center map (runtime only)
4. **Only address text** saved if user checks box

---

### 6. MapState

Client-side UI state, persisted for session continuity.

```typescript
interface MapState {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number; // 10-18
  selectedStoreId: string | null;
  activeFilters: StoreType[]; // Empty = show all
}
```

**Storage**: sessionStorage key `mapState` (cleared on browser close)  
**Purpose**: Restore map position if user refreshes page  
**Privacy**: No user location, just map viewport

---

## localStorage Schema Summary

```typescript
// Key: "crowdReports"
CrowdReport[]

// Key: "historicalPatterns"
HistoricalPattern[]

// Key: "savedAddress"
SavedAddress | null

// Key: "lastReportTime"
number  // Unix timestamp of user's last report (any store)

// Key: "mapState" (sessionStorage)
MapState
```

**Total Storage Estimate**:

- 1000 crowd reports: ~80KB
- 200 historical patterns: ~20KB
- Saved address: <1KB
- Total: ~100KB (well under 5MB limit)

---

## Data Flow Diagrams

### Flow 1: Viewing Crowd Levels

```
1. User opens app
2. Request GPS permission
   ├─ Granted → Get UserLocation (GPS)
   └─ Denied → Show address input
3. If address entered:
   → Geocode via Nominatim
   → Create UserLocation (GEOCODED)
4. Query stores within 5km of UserLocation
5. For each store:
   a. Get recent reports (last 30 min)
   b. If recent reports exist:
      → Calculate weighted average → Display as real-time
   c. Else check historical pattern for current day/hour:
      → Display pattern with clock icon
   d. Else:
      → Show "Geen drukte-informatie"
6. Render markers on map with crowd colors
7. Discard UserLocation from memory
```

### Flow 2: Submitting Crowd Report

```
1. User taps store marker
2. Popup shows "Druk" and "Rustig" buttons
3. User taps button
4. Check if GPS available:
   ├─ Yes → Validate distance to store
   │  ├─ <100m → weight = 1.0
   │  └─ ≥100m → weight = 0.7
   └─ No → weight = 0.7
5. Check last report time:
   ├─ <30 min ago → Reject (show error)
   └─ ≥30 min → Continue
6. Create CrowdReport:
   - storeId
   - crowdLevel (from button)
   - timestamp = now
   - reportWeight (from step 4)
   - dayOfWeek = now.getDay()
   - hourOfDay = now.getHours()
7. Append to localStorage "crowdReports"
8. Update "lastReportTime" = now
9. Run cleanup (remove expired reports)
10. Update map markers
11. Show confirmation toast
12. Discard GPS coords from memory
```

### Flow 3: Pattern Aggregation (Daily)

```
1. On app load, check if last aggregation was >24h ago
2. If yes:
   a. Group reports by storeId + dayOfWeek + hourOfDay
   b. For each group with ≥5 reports:
      - Calculate weighted average crowd level
      - Create/update HistoricalPattern
   c. Remove individual reports older than retention period:
      - Weight 0.7: >24h
      - Weight 1.0: >7 days
   d. Save patterns to localStorage "historicalPatterns"
   e. Save aggregation timestamp
```

---

## Validation Rules

### Crowd Report Validation

```typescript
function validateCrowdReport(
  storeId: string,
  userLocation: UserLocation | null,
  lastReportTime: number | null
): { valid: boolean; weight: ReportWeight; error?: string } {
  // 1. Check report cooldown
  if (lastReportTime && Date.now() - lastReportTime < 30 * 60 * 1000) {
    return {
      valid: false,
      weight: 0.7,
      error: 'Je hebt recent al een melding gedaan',
    };
  }

  // 2. Determine weight based on GPS proximity
  if (userLocation && userLocation.source === 'gps') {
    const store = getStoreById(storeId);
    const distance = haversineDistance(
      userLocation.lat,
      userLocation.lng,
      store.coordinates.lat,
      store.coordinates.lng
    );

    if (distance < 100) {
      return { valid: true, weight: 1.0 };
    } else {
      return {
        valid: true,
        weight: 0.7,
        error: 'Je bent te ver weg. Je melding telt minder zwaar.',
      };
    }
  } else {
    // No GPS or geocoded location
    return { valid: true, weight: 0.7 };
  }
}
```

### Historical Pattern Display

```typescript
function shouldShowPattern(pattern: HistoricalPattern): boolean {
  return pattern.reportCount >= 5;
}

function getPatternMessage(pattern: HistoricalPattern): string {
  const level = numberToCrowdLevel(pattern.averageCrowdLevel);
  const day = getDayName(pattern.dayOfWeek); // "zaterdag"
  const hour = pattern.hourOfDay;

  return `Meestal ${level} op ${day} tussen ${hour}:00-${hour + 1}:00`;
}
```

---

## Migration Strategy

**V1.0.0** (Current):

- Initial schema as defined above

**Future Considerations** (out of MVP scope):

- Schema versioning in localStorage
- Migration function on schema change
- Export/import for testing

---

## Privacy Compliance Checklist

- [x] No GPS coordinates in CrowdReport
- [x] No user ID or device ID stored
- [x] SavedAddress contains only human-readable text
- [x] UserLocation cleared immediately after use
- [x] No tracking of user movements
- [x] Retention limits enforced (7 days GPS, 24h non-GPS)
- [x] Aggregated patterns contain no PII

**Audit Method**: Manual inspection of localStorage contents in DevTools

---

## Next Steps

1. ✅ Define TypeScript interfaces in `types/` directory
2. → Create API contracts in `specs/001-store-map/contracts/`
3. → Write quickstart guide in `specs/001-store-map/quickstart.md`

**Phase 1 Status**: Data model complete and privacy-compliant.
