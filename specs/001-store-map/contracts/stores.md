# API Contract: Get Nearby Stores

**Endpoint**: `GET /api/stores`  
**Purpose**: Retrieve stores within radius of user location with current crowd levels  
**Authentication**: None (MVP, client-side only)

---

## Request

### Query Parameters

| Parameter | Type   | Required | Description                      | Example      |
| --------- | ------ | -------- | -------------------------------- | ------------ |
| `lat`     | number | Yes      | User latitude                    | `52.3676`    |
| `lng`     | number | Yes      | User longitude                   | `4.9041`     |
| `radius`  | number | No       | Search radius in km (default: 5) | `3`          |
| `type`    | string | No       | Filter by store type             | `supermarkt` |

### Example Request

```http
GET /api/stores?lat=51.0543&lng=3.7174&radius=5
```

---

## Response

### Success (200 OK)

```typescript
{
  stores: Array<{
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
    distance: number; // km from user location
    crowdData: {
      level: CrowdLevel | null; // null if no data
      source: 'real-time' | 'historical' | 'none';
      lastUpdated: number | null; // Unix timestamp
      message: string; // Dutch display text
    };
    isOpen: boolean; // Based on opening hours
  }>;
}
```

### Example Response

```json
{
  "stores": [
    {
      "id": "store_001",
      "name": "Colruyt",
      "type": "supermarkt",
      "address": {
        "street": "Veldstraat 10",
        "city": "Gent",
        "postalCode": "9000"
      },
      "coordinates": {
        "lat": 51.0543,
        "lng": 3.7174
      },
      "distance": 0.2,
      "crowdData": {
        "level": "rustig",
        "source": "real-time",
        "lastUpdated": 1704643200000,
        "message": "Rustig - 2 minuten geleden gemeld"
      },
      "isOpen": true
    },
    {
      "id": "store_002",
      "name": "Delhaize",
      "type": "supermarkt",
      "coordinates": {
        "lat": 51.058,
        "lng": 3.72
      },
      "distance": 0.5,
      "crowdData": {
        "level": "druk",
        "source": "historical",
        "lastUpdated": null,
        "message": "Meestal druk op zaterdagen tussen 11:00-12:00"
      },
      "isOpen": true
    },
    {
      "id": "store_003",
      "name": "Etos",
      "type": "drogisterij",
      "coordinates": {
        "lat": 52.365,
        "lng": 4.91
      },
      "distance": 0.8,
      "crowdData": {
        "level": null,
        "source": "none",
        "lastUpdated": null,
        "message": "Geen drukte-informatie beschikbaar"
      },
      "isOpen": false
    }
  ]
}
```

### Error (400 Bad Request)

```json
{
  "error": "Invalid coordinates",
  "message": "Latitude and longitude are required"
}
```

---

## Business Logic

### 1. Filter by Distance

```typescript
const storesWithinRadius = mockStores.filter((store) => {
  const distance = haversineDistance(lat, lng, store.coordinates.lat, store.coordinates.lng);
  return distance <= radius;
});
```

### 2. Calculate Crowd Level

For each store:

```typescript
// 1. Get recent reports (last 30 min)
const recentReports = getReportsForStore(store.id).filter(
  (r) => now - r.timestamp < 30 * 60 * 1000
);

if (recentReports.length > 0) {
  // Use weighted average
  const totalWeight = recentReports.reduce((sum, r) => sum + r.reportWeight, 0);
  const weightedSum = recentReports.reduce(
    (sum, r) => sum + levelToNumber[r.crowdLevel] * r.reportWeight,
    0
  );
  const avgLevel = weightedSum / totalWeight;

  crowdData = {
    level: numberToCrowdLevel(avgLevel),
    source: 'real-time',
    lastUpdated: Math.max(...recentReports.map((r) => r.timestamp)),
    message: `${level} - ${timeAgo(lastUpdated)} gemeld`,
  };
} else {
  // Check historical pattern
  const pattern = getPattern(store.id, now.getDay(), now.getHours());

  if (pattern && pattern.reportCount >= 5) {
    crowdData = {
      level: numberToCrowdLevel(pattern.averageCrowdLevel),
      source: 'historical',
      lastUpdated: null,
      message: getPatternMessage(pattern),
    };
  } else {
    crowdData = {
      level: null,
      source: 'none',
      lastUpdated: null,
      message: 'Geen drukte-informatie beschikbaar',
    };
  }
}
```

### 3. Check Opening Hours

```typescript
const now = new Date();
const dayOfWeek = now.getDay();
const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
  .getMinutes()
  .toString()
  .padStart(2, '0')}`;

const hours = store.openingHours?.[dayOfWeek];
const isOpen = hours ? currentTime >= hours.open && currentTime < hours.close : true; // Assume open if hours unknown
```

### 4. Sort by Distance

```typescript
storesWithinRadius.sort((a, b) => a.distance - b.distance);
```

---

## Simulated API Latency

To simulate realistic backend behavior:

```typescript
await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));
```

**Range**: 200-500ms

---

## Validation

### Request Validation

```typescript
if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
  return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
}

if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
  return NextResponse.json({ error: 'Coordinates out of range' }, { status: 400 });
}

if (radius && (radius < 0.1 || radius > 50)) {
  return NextResponse.json({ error: 'Radius must be between 0.1 and 50 km' }, { status: 400 });
}
```

---

## Testing Scenarios

1. **Happy path**: Valid coords → Returns stores with crowd data
2. **No stores nearby**: Valid coords in remote area → Returns empty array
3. **Invalid coords**: Missing lat/lng → Returns 400 error
4. **Filter by type**: `?type=supermarkt` → Only supermarkets returned
5. **Real-time data**: Recent reports exist → Shows "real-time" source
6. **Historical data**: No recent reports, pattern exists → Shows "historical" source
7. **No data**: No reports or patterns → Shows "none" source

---

## Privacy Compliance

- ✅ Endpoint does not store user coordinates
- ✅ Coordinates only used for runtime distance calculation
- ✅ No logging of user location
- ✅ Response contains no user-identifiable data
