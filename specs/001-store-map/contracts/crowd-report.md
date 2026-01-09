# API Contract: Submit Crowd Report

**Endpoint**: `POST /api/crowd-report`  
**Purpose**: Submit user's assessment of store crowd level  
**Authentication**: None (MVP, client-side only)

---

## Request

### Headers

```
Content-Type: application/json
```

### Body

```typescript
{
  storeId: string               // Store identifier
  crowdLevel: CrowdLevel        // "druk" | "rustig" | "matig"
  userLocation?: {              // Optional GPS data for weight calculation
    lat: number
    lng: number
    accuracy: number
  }
}
```

### Example Request

```http
POST /api/crowd-report
Content-Type: application/json

{
  "storeId": "store_001",
  "crowdLevel": "rustig",
  "userLocation": {
    "lat": 51.0543,
    "lng": 3.7174,
    "accuracy": 10
  }
}
```

---

## Response

### Success (201 Created)

```typescript
{
  success: true;
  report: {
    storeId: string;
    crowdLevel: CrowdLevel;
    timestamp: number; // Server time (simulated)
    reportWeight: ReportWeight; // 1.0 or 0.7
    message: string; // Confirmation message in Dutch
  }
}
```

### Example Response (GPS-verified)

```json
{
  "success": true,
  "report": {
    "storeId": "store_001",
    "crowdLevel": "rustig",
    "timestamp": 1704643200000,
    "reportWeight": 1.0,
    "message": "Bedankt! Je melding helpt anderen."
  }
}
```

### Example Response (Non-GPS)

```json
{
  "success": true,
  "report": {
    "storeId": "store_001",
    "crowdLevel": "druk",
    "timestamp": 1704643200000,
    "reportWeight": 0.7,
    "message": "Bedankt! Je melding telt minder zwaar maar helpt wel."
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Input

```json
{
  "error": "Invalid crowd level",
  "message": "crowdLevel must be one of: druk, rustig, matig"
}
```

#### 400 Bad Request - Store Not Found

```json
{
  "error": "Store not found",
  "message": "Winkel met ID 'store_999' bestaat niet"
}
```

#### 429 Too Many Requests - Rate Limit

```json
{
  "error": "Rate limit exceeded",
  "message": "Je hebt recent al een melding gedaan. Probeer over 30 minuten opnieuw.",
  "retryAfter": 1800 // seconds
}
```

---

## Business Logic

### 1. Validate Input

```typescript
if (!storeId || !crowdLevel) {
  return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
}

if (!['druk', 'rustig', 'matig'].includes(crowdLevel)) {
  return NextResponse.json({ error: 'Invalid crowd level' }, { status: 400 });
}

const store = getStoreById(storeId);
if (!store) {
  return NextResponse.json(
    { error: 'Store not found', message: `Winkel met ID '${storeId}' bestaat niet` },
    { status: 400 }
  );
}
```

### 2. Check Rate Limit

```typescript
const lastReportTime = getLastReportTime(); // from localStorage simulation
const now = Date.now();

if (lastReportTime && now - lastReportTime < 30 * 60 * 1000) {
  const retryAfter = Math.ceil((30 * 60 * 1000 - (now - lastReportTime)) / 1000);

  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: 'Je hebt recent al een melding gedaan. Probeer over 30 minuten opnieuw.',
      retryAfter,
    },
    { status: 429 }
  );
}
```

### 3. Determine Report Weight

```typescript
let reportWeight: ReportWeight = 0.7; // Default for non-GPS

if (userLocation) {
  const distance = haversineDistance(
    userLocation.lat,
    userLocation.lng,
    store.coordinates.lat,
    store.coordinates.lng
  );

  if (distance < 100) {
    // Within 100 meters
    reportWeight = 1.0;
  } else {
    reportWeight = 0.7;
  }
}
```

### 4. Create Report

```typescript
const report: CrowdReport = {
  storeId,
  crowdLevel,
  timestamp: now,
  reportWeight,
  dayOfWeek: new Date(now).getDay(),
  hourOfDay: new Date(now).getHours(),
};

// Simulate saving to localStorage (in Next.js Route Handler)
saveReport(report);
updateLastReportTime(now);
```

### 5. Cleanup Old Reports

```typescript
cleanupExpiredReports(); // Remove reports past retention period
```

### 6. Generate Confirmation Message

```typescript
const message =
  reportWeight === 1.0
    ? 'Bedankt! Je melding helpt anderen.'
    : 'Bedankt! Je melding telt minder zwaar maar helpt wel.';
```

---

## Simulated API Latency

```typescript
await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));
```

**Range**: 200-500ms

---

## Privacy Implementation

### What Gets Stored

```typescript
// ✅ Stored in localStorage
{
  storeId: "store_001",
  crowdLevel: "rustig",
  timestamp: 1704643200000,
  reportWeight: 0.7,
  dayOfWeek: 6,
  hourOfDay: 11
}

// ✅ Stored separately
lastReportTime: 1704643200000
```

### What Gets Discarded

```typescript
// ❌ NEVER stored - discarded after weight calculation
userLocation: {
  lat: 52.3676,
  lng: 4.9041,
  accuracy: 10
}
```

**Process**:

1. Receive userLocation in request
2. Calculate distance to store
3. Determine weight (1.0 or 0.7)
4. **Discard userLocation** (do not write to any storage)
5. Save report with weight only

---

## Retention Policy Enforcement

### Cleanup Logic

```typescript
function cleanupExpiredReports() {
  const now = Date.now();
  const reports = getAllReports();

  const validReports = reports.filter((report) => {
    const age = now - report.timestamp;

    if (report.reportWeight === 0.7) {
      // Non-GPS: keep for 24 hours
      return age < 24 * 60 * 60 * 1000;
    } else {
      // GPS: keep for 7 days
      return age < 7 * 24 * 60 * 60 * 1000;
    }
  });

  saveReports(validReports);

  // Aggregate old GPS reports into patterns
  aggregatePatternsIfNeeded(
    reports.filter((r) => r.reportWeight === 1.0 && now - r.timestamp >= 7 * 24 * 60 * 60 * 1000)
  );
}
```

---

## Testing Scenarios

1. **GPS-verified report**: userLocation within 100m → weight 1.0, success message
2. **GPS-verified but far**: userLocation >100m → weight 0.7, lower weight message
3. **Non-GPS report**: No userLocation → weight 0.7, lower weight message
4. **Rate limit**: Submit 2 reports within 30 min → 429 error on 2nd
5. **Invalid store**: Non-existent storeId → 400 error
6. **Invalid crowd level**: crowdLevel = "unknown" → 400 error
7. **Missing fields**: No crowdLevel → 400 error

---

## Integration with GET /api/stores

After successful POST:

- New report affects GET response immediately
- If within 30 min window: Shows as real-time data
- Contributes to historical patterns (GPS reports only after 7 days)

---

## Example cURL Request

```bash
curl -X POST http://localhost:3000/api/crowd-report \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "store_001",
    "crowdLevel": "rustig",
    "userLocation": {
      "lat": 51.0543,
      "lng": 3.7174,
      "accuracy": 10
    }
  }'
```

---

## Security Considerations (MVP)

- ⚠️ **No authentication**: Anyone can submit reports (acceptable for MVP)
- ⚠️ **No spam prevention**: Only 30-min rate limit (acceptable for MVP)
- ✅ **No PII stored**: GPS coords discarded after weight calculation
- ✅ **Input validation**: Prevents invalid data
- ✅ **CORS**: Next.js handles same-origin by default

**Post-MVP**: Consider CAPTCHA, session tokens, or device fingerprinting for abuse prevention.
