# API Contract: Rewards

**Version**: 1.0.0  
**Status**: Draft  
**Last Updated**: 2026-01-07

---

## Endpoints

### GET /api/rewards

**Purpose**: Fetch catalog of available rewards that users can redeem with points

---

## Authentication

None (MVP - public endpoint)

---

## Request

### GET /api/rewards

**Query Parameters**: None

**Example**:

```
GET /api/rewards
```

---

## Response

### Success (200 OK)

```typescript
{
  rewards: Array<{
    id: string;
    title: string;
    description: string;
    cost: number; // Points required
    category: 'discount' | 'freebie' | 'priority';
    imageUrl?: string; // Optional image
    terms?: string; // Optional terms and conditions
  }>;
}
```

**Example**:

```json
{
  "rewards": [
    {
      "id": "reward-001",
      "title": "5% korting op volgende aankoop",
      "description": "Geldig bij alle deelnemende winkels",
      "cost": 50,
      "category": "discount",
      "terms": "Eenmalig te gebruiken binnen 30 dagen"
    },
    {
      "id": "reward-002",
      "title": "Gratis koffie",
      "description": "Een gratis koffie bij participating stores",
      "cost": 30,
      "category": "freebie"
    },
    {
      "id": "reward-003",
      "title": "Priority check-out toegang",
      "description": "Spring de rij over met deze bonus",
      "cost": 100,
      "category": "priority"
    }
  ]
}
```

---

### POST /api/rewards/redeem

**Purpose**: Redeem a reward by spending points

---

## Request

### Headers

```
Content-Type: application/json
```

### Body Schema

```typescript
{
  rewardId: string;
  userId?: string;     // Optional user identifier from localStorage
}
```

**Example**:

```json
{
  "rewardId": "reward-001",
  "userId": "user-temp-123"
}
```

---

## Response

### Success (200 OK)

```typescript
{
  success: true;
  message: string;
  redeemedReward: {
    id: string;              // Unique redemption ID
    rewardId: string;
    title: string;
    redeemedAt: number;      // Timestamp
    code?: string;           // Optional redemption code
    expiresAt?: number;      // Optional expiration timestamp
  };
  userPoints: {
    total: number;           // Remaining points
    totalSpent: number;      // Total points spent all-time
  };
}
```

**Example**:

```json
{
  "success": true,
  "message": "Bonus succesvol ingewisseld!",
  "redeemedReward": {
    "id": "redemption-abc-123",
    "rewardId": "reward-001",
    "title": "5% korting op volgende aankoop",
    "redeemedAt": 1704634800000,
    "code": "CROWD5OFF",
    "expiresAt": 1707226800000
  },
  "userPoints": {
    "total": 0,
    "totalSpent": 50
  }
}
```

---

### Error: Insufficient Points (400 Bad Request)

```typescript
{
  success: false;
  error: string;
  errorCode: 'INSUFFICIENT_POINTS';
  required: number;
  available: number;
}
```

**Example**:

```json
{
  "success": false,
  "error": "Onvoldoende punten. Je hebt 50 punten nodig maar hebt er slechts 30.",
  "errorCode": "INSUFFICIENT_POINTS",
  "required": 50,
  "available": 30
}
```

---

### Error: Reward Not Found (404 Not Found)

```typescript
{
  success: false;
  error: string;
  errorCode: 'REWARD_NOT_FOUND';
  rewardId: string;
}
```

**Example**:

```json
{
  "success": false,
  "error": "Bonus niet gevonden",
  "errorCode": "REWARD_NOT_FOUND",
  "rewardId": "reward-invalid-999"
}
```

---

### Error: Already Redeemed (409 Conflict)

```typescript
{
  success: false;
  error: string;
  errorCode: 'ALREADY_REDEEMED';
  redemptionId: string;
}
```

**Example**:

```json
{
  "success": false,
  "error": "Je hebt deze bonus al ingewisseld",
  "errorCode": "ALREADY_REDEEMED",
  "redemptionId": "redemption-abc-123"
}
```

---

## Data Model

### Reward

```typescript
interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'discount' | 'freebie' | 'priority';
  imageUrl?: string;
  terms?: string;
  maxRedemptions?: number; // Optional limit per user
}
```

### RedeemedReward

```typescript
interface RedeemedReward {
  id: string;
  rewardId: string;
  title: string;
  redeemedAt: number;
  code?: string;
  expiresAt?: number;
  used: boolean;
}
```

---

## Business Rules

### BR-001: Points Deduction

- Points deducted immediately upon successful redemption
- Transaction is atomic (points deducted only if redemption succeeds)

### BR-002: Reward Availability

- All rewards are available to all users (no personalization in MVP)
- No stock limits or availability windows

### BR-003: Redemption Limits

- Users can redeem same reward multiple times (no limit in MVP)
- Each redemption is separate transaction

### BR-004: Expiration

- Redeemed rewards expire after 30 days (mock expiration)
- Expired rewards remain visible but marked as "Verlopen"

---

## Mock Data

### Sample Rewards Catalog

```typescript
const MOCK_REWARDS: Reward[] = [
  {
    id: 'reward-001',
    title: '5% korting op volgende aankoop',
    description: 'Geldig bij alle deelnemende winkels',
    cost: 50,
    category: 'discount',
    terms: 'Eenmalig te gebruiken binnen 30 dagen',
  },
  {
    id: 'reward-002',
    title: 'Gratis koffie',
    description: 'Een gratis koffie bij participating stores',
    cost: 30,
    category: 'freebie',
  },
  {
    id: 'reward-003',
    title: 'Priority check-out toegang',
    description: 'Spring de rij over met deze bonus',
    cost: 100,
    category: 'priority',
  },
  {
    id: 'reward-004',
    title: '10% korting op boodschappen',
    description: 'Hoge korting voor loyale gebruikers',
    cost: 150,
    category: 'discount',
  },
  {
    id: 'reward-005',
    title: 'Gratis parkeren',
    description: '1 uur gratis parkeren bij winkelcentrum',
    cost: 75,
    category: 'freebie',
  },
];
```

---

## Storage (localStorage)

### Redeemed Rewards

```typescript
interface RedeemedRewardStorage {
  userId: string;
  redemptions: RedeemedReward[];
}

// Key: "CrowdEase_redeemed_rewards"
```

---

## Performance Requirements

- GET /api/rewards: < 200ms
- POST /api/rewards/redeem: < 300ms
- localStorage operations: < 10ms

---

## Testing Scenarios

1. ✅ Fetch rewards catalog successfully
2. ✅ Redeem reward with sufficient points
3. ✅ Reject redemption with insufficient points
4. ✅ Reject redemption for invalid reward ID
5. ✅ Points deducted correctly after redemption
6. ✅ Redeemed reward appears in user's collection
7. ✅ Multiple redemptions of same reward allowed
