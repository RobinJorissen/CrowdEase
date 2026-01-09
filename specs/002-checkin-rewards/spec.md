# Feature: Check-in & Rewards System

**Status**: Draft  
**Version**: 1.0.0  
**Created**: 2026-01-07  
**Owner**: Robin

---

## Overview

This feature enables users to check in at stores when physically present (GPS-validated), earn points for check-ins, and view/redeem bonuses with accumulated points. This completes the core gamification loop and incentivizes accurate crowd reporting.

---

## Problem Statement

Users need motivation to actively participate in crowd reporting and check-ins. A points-based rewards system creates engagement and provides tangible feedback for their contributions to the community.

**Success Metrics**:

- Users understand how to check in at stores
- Users can see their point balance
- Users can view available rewards
- Check-in validation prevents fraud (must be within 100m)

---

## User Stories

### US-001: Check-in at Store

**As a** user visiting a store  
**I want to** check in when I arrive  
**So that** I can earn points and help validate crowd data

**Acceptance Criteria**:

1. **Given** I am within 100m of a store, **When** I tap the check-in button, **Then** I successfully check in and earn points
2. **Given** I am more than 100m from a store, **When** I tap the check-in button, **Then** I see an error message "Je bent te ver van de winkel"
3. **Given** I successfully check in, **When** the check-in completes, **Then** I see a confirmation message with points earned

### US-002: View Points Balance

**As a** user  
**I want to** see my current point balance  
**So that** I know how many points I have available

**Acceptance Criteria**:

1. **Given** I open the app, **When** the app loads, **Then** I see my current point balance displayed
2. **Given** I earn points from a check-in, **When** the check-in completes, **Then** my point balance updates immediately

### US-003: View Available Rewards

**As a** user  
**I want to** see what rewards I can earn  
**So that** I am motivated to collect more points

**Acceptance Criteria**:

1. **Given** I tap the rewards button, **When** the rewards screen opens, **Then** I see a list of available bonuses with point costs
2. **Given** I have sufficient points, **When** I view a reward, **Then** I can see a "Inwisselen" button
3. **Given** I have insufficient points, **When** I view a reward, **Then** the button is disabled with "Onvoldoende punten"

### US-004: Redeem Rewards

**As a** user with enough points  
**I want to** redeem a reward  
**So that** I can use my earned points

**Acceptance Criteria**:

1. **Given** I have enough points for a reward, **When** I tap "Inwisselen", **Then** my points decrease and I see a confirmation
2. **Given** I redeem a reward, **When** the redemption completes, **Then** the reward appears in my "Mijn bonussen" list

---

## Functional Requirements

### FR-001: Check-in Validation

**Priority**: P0 (Critical)  
System MUST validate user's GPS location is within 100m of store coordinates before allowing check-in

### FR-002: Points Assignment

**Priority**: P0 (Critical)  
System MUST award 10 points per successful check-in

### FR-003: Points Persistence

**Priority**: P0 (Critical)  
System MUST store points in localStorage with structure: `{ userId, points, lastUpdated }`

### FR-004: Check-in Cooldown

**Priority**: P1 (High)  
System SHOULD prevent multiple check-ins at same store within 4 hours

### FR-005: Rewards Catalog

**Priority**: P1 (High)  
System MUST display mock rewards with point costs (e.g., "5% korting - 50 punten")

### FR-006: Reward Redemption

**Priority**: P1 (High)  
System MUST deduct points when user redeems a reward and add to redeemed list

### FR-007: Points Display

**Priority**: P0 (Critical)  
System MUST display current point balance in UI (top bar or profile area)

---

## Non-Functional Requirements

### NR-001: GPS Accuracy

System MUST use device GPS with minimum accuracy of 100m for check-in validation

### NR-002: Offline Support

Points balance MUST be readable offline from localStorage

### NR-003: Performance

Check-in validation MUST complete within 2 seconds

### NR-004: Error Handling

System MUST display clear error messages for:

- GPS unavailable
- Out of range
- Already checked in recently
- Insufficient points for redemption

---

## API Contracts

### POST /api/check-in

**Purpose**: Validate user location and register check-in

**Request**:

```json
{
  "storeId": "store-abc-123",
  "location": {
    "lat": 51.0543,
    "lng": 3.7174,
    "accuracy": 50
  }
}
```

**Response (Success)**:

```json
{
  "success": true,
  "pointsEarned": 10,
  "message": "Check-in succesvol! +10 punten",
  "checkIn": {
    "storeId": "store-abc-123",
    "timestamp": 1704634800000,
    "points": 10
  }
}
```

**Response (Out of Range)**:

```json
{
  "success": false,
  "error": "Je bent te ver van de winkel (250m). Kom dichterbij om in te checken.",
  "distance": 250
}
```

**Response (Cooldown Active)**:

```json
{
  "success": false,
  "error": "Je hebt hier recent al ingecheckt. Probeer opnieuw over 2 uur.",
  "cooldownRemaining": 7200000
}
```

### GET /api/rewards

**Purpose**: Fetch available rewards catalog

**Response**:

```json
{
  "rewards": [
    {
      "id": "reward-001",
      "title": "5% korting op volgende aankoop",
      "description": "Geldig bij alle deelnemende winkels",
      "cost": 50,
      "category": "discount"
    },
    {
      "id": "reward-002",
      "title": "Gratis koffie",
      "description": "Een gratis koffie bij participating stores",
      "cost": 30,
      "category": "freebie"
    }
  ]
}
```

---

## Data Model

### CheckIn

```typescript
interface CheckIn {
  id: string;
  storeId: string;
  timestamp: number;
  pointsEarned: number;
  location: {
    lat: number;
    lng: number;
    accuracy: number;
  };
}
```

### UserPoints

```typescript
interface UserPoints {
  userId: string;
  points: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: number;
}
```

### Reward

```typescript
interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'discount' | 'freebie' | 'priority';
  imageUrl?: string;
}
```

### RedeemedReward

```typescript
interface RedeemedReward {
  id: string;
  rewardId: string;
  title: string;
  redeemedAt: number;
  used: boolean;
}
```

---

## UI/UX Requirements

### Check-in Button Placement

- Appears in store popup/detail view
- Only visible when user is viewing a specific store
- Shows distance to store if > 100m
- Disabled with tooltip if cooldown active

### Points Display

- Show in top-right corner of app (small badge with point count)
- Animates when points are earned
- Tappable to open rewards screen

### Rewards Screen

- Grid layout showing available rewards
- Each reward card shows: title, description, point cost, redeem button
- "Mijn bonussen" tab shows redeemed rewards
- Clear visual distinction between available/unavailable rewards

---

## Testing Requirements

### Unit Tests

- Distance calculation for check-in validation
- Points calculation logic
- Cooldown timer logic
- Reward affordability checks

### Integration Tests

- Full check-in flow with GPS mock
- Points increment on successful check-in
- Reward redemption decreases points
- localStorage persistence

### E2E Tests

- User checks in at store within range
- User attempts check-in outside range (shows error)
- User views rewards and redeems one
- Points balance updates correctly across flows

---

## Implementation Notes

- Use existing `haversineDistance()` function for proximity check
- Store check-ins in localStorage with 7-day retention
- Mock rewards catalog (no external API)
- Use react-spring for points animation
- Implement optimistic UI updates for check-ins

---

## Dependencies

- Feature 001: Store Map (requires store coordinates)
- GPS/Geolocation API
- localStorage
- Distance calculation utility

---

## Success Criteria

Feature is complete when:

- ✅ Users can check in at stores when within 100m
- ✅ Points are awarded and persisted correctly
- ✅ Rewards catalog is viewable
- ✅ Rewards can be redeemed with sufficient points
- ✅ All error states are handled gracefully
- ✅ E2E tests pass for all flows
