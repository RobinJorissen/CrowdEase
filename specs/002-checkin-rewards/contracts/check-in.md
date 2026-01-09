# API Contract: Check-in

**Version**: 1.0.0  
**Status**: Draft  
**Last Updated**: 2026-01-07

---

## Endpoint

```
POST /api/check-in
```

**Purpose**: Validate user's physical presence at a store and register check-in for points

---

## Authentication

None (MVP uses client-side userId from localStorage)

---

## Request

### Headers

```
Content-Type: application/json
```

### Body Schema

```typescript
{
  storeId: string;        // ID of the store to check in at
  location: {
    lat: number;          // User's GPS latitude
    lng: number;          // User's GPS longitude
    accuracy: number;     // GPS accuracy in meters (optional)
  };
  userId?: string;        // Optional user identifier from localStorage
}
```

### Example

```json
{
  "storeId": "store-delhaize-kouter",
  "location": {
    "lat": 51.0543,
    "lng": 3.7174,
    "accuracy": 25
  },
  "userId": "user-temp-123"
}
```

---

## Response

### Success (200 OK)

User is within 100m and check-in cooldown has passed

```typescript
{
  success: true;
  pointsEarned: number;
  message: string;
  checkIn: {
    id: string;
    storeId: string;
    timestamp: number;
    points: number;
  }
  userPoints: {
    total: number;
    totalEarned: number;
  }
}
```

**Example**:

```json
{
  "success": true,
  "pointsEarned": 10,
  "message": "Check-in succesvol! +10 punten",
  "checkIn": {
    "id": "checkin-abc-123",
    "storeId": "store-delhaize-kouter",
    "timestamp": 1704634800000,
    "points": 10
  },
  "userPoints": {
    "total": 50,
    "totalEarned": 50
  }
}
```

---

### Error: Out of Range (400 Bad Request)

User is more than 100m from store

```typescript
{
  success: false;
  error: string;
  errorCode: 'OUT_OF_RANGE';
  distance: number; // Distance in meters
  requiredRange: number; // Maximum allowed distance (100)
}
```

**Example**:

```json
{
  "success": false,
  "error": "Je bent te ver van de winkel (250m). Kom dichterbij om in te checken.",
  "errorCode": "OUT_OF_RANGE",
  "distance": 250,
  "requiredRange": 100
}
```

---

### Error: Cooldown Active (429 Too Many Requests)

User has checked in at this store too recently

```typescript
{
  success: false;
  error: string;
  errorCode: 'COOLDOWN_ACTIVE';
  cooldownRemaining: number; // Milliseconds until next check-in allowed
  lastCheckIn: number; // Timestamp of last check-in
}
```

**Example**:

```json
{
  "success": false,
  "error": "Je hebt hier recent al ingecheckt. Probeer opnieuw over 2 uur.",
  "errorCode": "COOLDOWN_ACTIVE",
  "cooldownRemaining": 7200000,
  "lastCheckIn": 1704627600000
}
```

---

### Error: Store Not Found (404 Not Found)

```typescript
{
  success: false;
  error: string;
  errorCode: 'STORE_NOT_FOUND';
  storeId: string;
}
```

**Example**:

```json
{
  "success": false,
  "error": "Winkel niet gevonden",
  "errorCode": "STORE_NOT_FOUND",
  "storeId": "store-invalid-123"
}
```

---

### Error: GPS Required (400 Bad Request)

Location data is missing or invalid

```typescript
{
  success: false;
  error: string;
  errorCode: 'GPS_REQUIRED';
}
```

**Example**:

```json
{
  "success": false,
  "error": "GPS-locatie is vereist voor check-in",
  "errorCode": "GPS_REQUIRED"
}
```

---

## Business Rules

### BR-001: Distance Validation

- User MUST be within 100m of store coordinates
- Distance calculated using Haversine formula
- Use existing `haversineDistance()` utility

### BR-002: Cooldown Period

- 4-hour cooldown per store (14,400,000 ms)
- Stored in localStorage: `{ storeId, lastCheckIn }`
- Cooldown applies per store (can check in at different stores)

### BR-003: Points Award

- Standard check-in: **10 points**
- No bonus multipliers in MVP
- Points added to user's total immediately

### BR-004: GPS Accuracy

- Accept any GPS accuracy (no minimum threshold)
- Log accuracy for potential future analysis
- Use device's best available location

---

## Mock Implementation

### Check-in Data Storage (localStorage)

```typescript
interface CheckInHistory {
  [storeId: string]: {
    lastCheckIn: number;
    count: number;
  };
}

// Key: "CrowdEase_checkin_history"
```

### Points Data Storage (localStorage)

```typescript
interface UserPoints {
  userId: string;
  points: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: number;
}

// Key: "CrowdEase_user_points"
```

---

## Performance Requirements

- Response time: < 500ms
- Distance calculation: < 50ms
- localStorage operations: < 10ms

---

## Security Considerations

- No authentication in MVP (acceptable for demo)
- GPS coordinates NOT stored server-side
- Check-in history stored client-side only
- Rate limiting by cooldown mechanism

---

## Testing Scenarios

1. ✅ Successful check-in within range
2. ✅ Rejected check-in outside range
3. ✅ Rejected check-in during cooldown
4. ✅ Points increment correctly
5. ✅ Error handling for missing GPS
6. ✅ Error handling for invalid store ID
7. ✅ Multiple check-ins at different stores allowed
