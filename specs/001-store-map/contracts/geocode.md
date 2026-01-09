# API Contract: Geocode Address

**Endpoint**: `GET /api/geocode`  
**Purpose**: Convert Dutch address to GPS coordinates using Nominatim  
**Authentication**: None (MVP, client-side only)

---

## Request

### Query Parameters

| Parameter | Type   | Required | Description             | Example                     |
| --------- | ------ | -------- | ----------------------- | --------------------------- |
| `address` | string | Yes      | Full or partial address | `Marktstraat 10, Amsterdam` |

### Example Request

```http
GET /api/geocode?address=Veldstraat%2010%2C%20Gent
```

---

## Response

### Success (200 OK)

```typescript
{
  success: true;
  result: {
    lat: number;
    lng: number;
    displayName: string; // Full formatted address from Nominatim
    confidence: number; // 0.0-1.0 (based on Nominatim accuracy)
  }
}
```

### Example Response

```json
{
  "success": true,
  "result": {
    "lat": 51.0543,
    "lng": 3.7174,
    "displayName": "Veldstraat 10, Gent, Oost-Vlaanderen, België",
    "confidence": 0.95
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Address

```json
{
  "error": "Missing address",
  "message": "Address parameter is required"
}
```

#### 404 Not Found - No Results

```json
{
  "error": "Address not found",
  "message": "Adres niet gevonden. Probeer een ander adres of postcode."
}
```

#### 429 Too Many Requests - Rate Limit

```json
{
  "error": "Rate limit exceeded",
  "message": "Te veel verzoeken. Probeer over 1 seconde opnieuw.",
  "retryAfter": 1
}
```

#### 503 Service Unavailable - Nominatim Down

```json
{
  "error": "Geocoding service unavailable",
  "message": "Geocodeer-service tijdelijk niet beschikbaar. Gebruik handmatig de kaart."
}
```

---

## Implementation

### 1. Validate Input

```typescript
const address = new URL(request.url).searchParams.get('address');

if (!address || address.trim().length === 0) {
  return NextResponse.json(
    { error: 'Missing address', message: 'Address parameter is required' },
    { status: 400 }
  );
}
```

### 2. Call Nominatim API

```typescript
const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
nominatimUrl.searchParams.set('q', address);
nominatimUrl.searchParams.set('format', 'json');
nominatimUrl.searchParams.set('limit', '1');
nominatimUrl.searchParams.set('countrycodes', 'be'); // Limit to Belgium
nominatimUrl.searchParams.set('addressdetails', '1');

const response = await fetch(nominatimUrl.toString(), {
  headers: {
    'User-Agent': 'CrowdEase/1.0 (MVP testing)', // Required by Nominatim
  },
});

if (!response.ok) {
  throw new Error('Nominatim API error');
}

const data = await response.json();
```

### 3. Parse Response

```typescript
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

return NextResponse.json({
  success: true,
  result: {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    displayName: result.display_name,
    confidence: calculateConfidence(result),
  },
});
```

### 4. Calculate Confidence

```typescript
function calculateConfidence(nominatimResult: any): number {
  // Nominatim returns importance (0-1) - use as confidence
  return parseFloat(nominatimResult.importance ?? 0.5);
}
```

---

## Rate Limiting

Nominatim allows **1 request per second** per IP.

### Client-Side Debouncing

```typescript
// In AddressInput component
const debouncedGeocode = useMemo(
  () =>
    debounce((address: string) => {
      fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setMapCenter({ lat: data.result.lat, lng: data.result.lng });
          }
        });
    }, 1000), // Wait 1 second after user stops typing
  []
);
```

### Server-Side Rate Limit

```typescript
// Simple in-memory rate limiter (MVP-acceptable)
const lastRequestTime = { value: 0 };

export async function GET(request: Request) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime.value;

  if (timeSinceLastRequest < 1000) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Te veel verzoeken. Probeer over 1 seconde opnieuw.',
        retryAfter: 1,
      },
      { status: 429 }
    );
  }

  lastRequestTime.value = now;

  // ... proceed with geocoding
}
```

---

## Simulated API Latency

```typescript
await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400));
```

**Range**: 300-700ms (slower than other endpoints due to external API)

---

## Error Handling

### Network Errors

```typescript
try {
  const response = await fetch(nominatimUrl.toString(), {
    /* ... */
  });
  // ...
} catch (error) {
  console.error('Nominatim error:', error);
  return NextResponse.json(
    {
      error: 'Geocoding service unavailable',
      message: 'Geocodeer-service tijdelijk niet beschikbaar. Gebruik handmatig de kaart.',
    },
    { status: 503 }
  );
}
```

### Timeout

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

try {
  const response = await fetch(nominatimUrl.toString(), {
    signal: controller.signal,
    // ...
  });
} finally {
  clearTimeout(timeoutId);
}
```

---

## Privacy Compliance

### What Gets Sent to Nominatim

✅ **Address text only** (e.g., "Marktstraat 10, Amsterdam")

### What Gets Returned to Client

✅ **Coordinates + formatted address**

### What Gets Stored

❌ **Nothing** - coordinates used runtime only, then discarded (per privacy rules)

### Optional: Save Address Text

If user checks "Bewaar dit adres":

- ✅ Save address **text** to localStorage
- ❌ Do NOT save coordinates

---

## Testing Scenarios

1. **Valid full address**: "Marktstraat 10, Amsterdam" → Returns coordinates
2. **Valid postal code**: "1012 AB" → Returns coordinates
3. **Partial address**: "Dam Amsterdam" → Returns Dam Square coordinates
4. **Invalid address**: "zxcvbnm123" → 404 error
5. **Empty address**: "" → 400 error
6. **Special characters**: "O'Connell Street, Amsterdam" → Handles correctly
7. **Rate limit**: 2 requests <1s apart → 429 on 2nd request
8. **Nominatim down**: Network error → 503 error

---

## Integration with Map Component

### Usage Flow

```typescript
// 1. User enters address
<input
  type="text"
  placeholder="Voer je adres in (bijv. Marktstraat 10, Amsterdam)"
  onChange={(e) => debouncedGeocode(e.target.value)}
/>;

// 2. API call (debounced)
const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
const data = await response.json();

// 3. Update map center (runtime only)
if (data.success) {
  setMapCenter({ lat: data.result.lat, lng: data.result.lng });
  setMapZoom(15); // Zoom in on geocoded location
}

// 4. Optional: Save address text
if (saveAddress) {
  localStorage.setItem(
    'savedAddress',
    JSON.stringify({
      street: extractStreet(data.result.displayName),
      city: 'Amsterdam',
      postalCode: '',
    })
  );
}

// 5. Discard coordinates after map update
// (No explicit action needed - not stored anywhere)
```

---

## Example cURL Request

```bash
curl "http://localhost:3000/api/geocode?address=Veldstraat%2010%2C%20Gent"
```

---

## Fallback Strategy

If geocoding fails:

1. Show error message in Dutch
2. Allow user to manually pan/zoom map
3. Suggest using postal code instead of full address
4. Optionally: Try again with simplified query (remove street number)

```typescript
if (response.status === 404) {
  // Retry with simplified address
  const simplified = address.split(',')[0]; // Remove city
  return fetch(`/api/geocode?address=${simplified}`);
}
```

---

## Nominatim Terms of Use

✅ **Compliant for MVP**:

- Free for low-volume use (<1 req/s)
- User-Agent header required
- No commercial restrictions for MVP testing

⚠️ **Post-MVP Considerations**:

- Self-host Nominatim for production
- Or use Google Maps Geocoding API (requires billing)

**Reference**: https://operations.osmfoundation.org/policies/nominatim/
