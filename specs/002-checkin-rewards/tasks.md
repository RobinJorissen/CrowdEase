# Tasks: Check-in & Rewards System

**Feature**: 002-checkin-rewards | **Branch**: `002-checkin-rewards` | **Date**: 2026-01-07  
**Input**: Design documents from `/specs/002-checkin-rewards/`  
**Prerequisites**: spec.md, contracts/check-in.md, contracts/rewards.md  
**Dependencies**: Feature 001 (Store Map) must be complete

---

## Task Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

---

## Phase 1: Types & Data Models

### [101] [P] Create Points Types

**File**: `src/types/points.ts`

```typescript
export interface UserPoints {
  userId: string;
  points: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: number;
}

export interface CheckIn {
  id: string;
  storeId: string;
  timestamp: number;
  pointsEarned: number;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
}

export interface CheckInHistory {
  [storeId: string]: {
    lastCheckIn: number;
    count: number;
  };
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'discount' | 'freebie' | 'priority';
  imageUrl?: string;
  terms?: string;
}

export interface RedeemedReward {
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

## Phase 2: Storage Layer

### [102] Create Points Storage Service

**File**: `src/lib/storage/pointsStorage.ts`

```typescript
import { UserPoints, CheckInHistory } from '@/types/points';

const POINTS_KEY = 'CrowdEase_user_points';
const CHECKIN_HISTORY_KEY = 'CrowdEase_checkin_history';

export function getUserPoints(): UserPoints {
  if (typeof window === 'undefined') {
    return {
      userId: 'temp-user',
      points: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastUpdated: Date.now(),
    };
  }

  const stored = localStorage.getItem(POINTS_KEY);
  if (!stored) {
    const initial: UserPoints = {
      userId: 'temp-user',
      points: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(POINTS_KEY, JSON.stringify(initial));
    return initial;
  }

  return JSON.parse(stored);
}

export function updatePoints(pointsToAdd: number): UserPoints {
  const current = getUserPoints();
  const updated: UserPoints = {
    ...current,
    points: current.points + pointsToAdd,
    totalEarned: current.totalEarned + (pointsToAdd > 0 ? pointsToAdd : 0),
    totalSpent: current.totalSpent + (pointsToAdd < 0 ? Math.abs(pointsToAdd) : 0),
    lastUpdated: Date.now(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(POINTS_KEY, JSON.stringify(updated));
  }

  return updated;
}

export function getCheckInHistory(): CheckInHistory {
  if (typeof window === 'undefined') return {};

  const stored = localStorage.getItem(CHECKIN_HISTORY_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function recordCheckIn(storeId: string): void {
  if (typeof window === 'undefined') return;

  const history = getCheckInHistory();
  history[storeId] = {
    lastCheckIn: Date.now(),
    count: (history[storeId]?.count || 0) + 1,
  };

  localStorage.setItem(CHECKIN_HISTORY_KEY, JSON.stringify(history));
}

export function canCheckIn(storeId: string, cooldownMs: number = 14400000): boolean {
  const history = getCheckInHistory();
  const storeHistory = history[storeId];

  if (!storeHistory) return true;

  const timeSinceLastCheckIn = Date.now() - storeHistory.lastCheckIn;
  return timeSinceLastCheckIn >= cooldownMs;
}
```

**Dependencies**: types/points.ts

---

### [103] Create Rewards Storage Service

**File**: `src/lib/storage/rewardsStorage.ts`

```typescript
import { RedeemedReward } from '@/types/points';

const REDEEMED_REWARDS_KEY = 'CrowdEase_redeemed_rewards';

export function getRedeemedRewards(): RedeemedReward[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(REDEEMED_REWARDS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function redeemReward(rewardId: string, title: string, code?: string): RedeemedReward {
  const redeemed: RedeemedReward = {
    id: `redemption-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    rewardId,
    title,
    redeemedAt: Date.now(),
    code,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    used: false,
  };

  const rewards = getRedeemedRewards();
  rewards.push(redeemed);

  if (typeof window !== 'undefined') {
    localStorage.setItem(REDEEMED_REWARDS_KEY, JSON.stringify(rewards));
  }

  return redeemed;
}

export function markRewardAsUsed(redemptionId: string): void {
  const rewards = getRedeemedRewards();
  const reward = rewards.find((r) => r.id === redemptionId);

  if (reward) {
    reward.used = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem(REDEEMED_REWARDS_KEY, JSON.stringify(rewards));
    }
  }
}
```

**Dependencies**: types/points.ts

---

## Phase 3: Mock Data

### [104] Create Mock Rewards Catalog

**File**: `src/lib/rewards/mockRewards.ts`

```typescript
import { Reward } from '@/types/points';

export const MOCK_REWARDS: Reward[] = [
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
    description: 'Een gratis koffie bij deelnemende winkels',
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

**Dependencies**: types/points.ts

---

## Phase 4: API Routes

### [105] Create Check-in API Route

**File**: `src/app/api/check-in/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { haversineDistance } from '@/lib/location/distance';
import { getStoreById } from '@/lib/stores/storeService';

const CHECK_IN_RANGE_METERS = 100;
const CHECK_IN_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours
const POINTS_PER_CHECKIN = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, location, userId } = body;

    // Validate required fields
    if (!storeId || !location || !location.lat || !location.lng) {
      return NextResponse.json(
        {
          success: false,
          error: 'GPS-locatie is vereist voor check-in',
          errorCode: 'GPS_REQUIRED',
        },
        { status: 400 }
      );
    }

    // Get store coordinates
    const store = getStoreById(storeId);
    if (!store) {
      return NextResponse.json(
        {
          success: false,
          error: 'Winkel niet gevonden',
          errorCode: 'STORE_NOT_FOUND',
          storeId,
        },
        { status: 404 }
      );
    }

    // Calculate distance
    const distance = haversineDistance({ lat: location.lat, lng: location.lng }, store.coordinates);

    // Check range
    if (distance > CHECK_IN_RANGE_METERS) {
      return NextResponse.json(
        {
          success: false,
          error: `Je bent te ver van de winkel (${Math.round(
            distance
          )}m). Kom dichterbij om in te checken.`,
          errorCode: 'OUT_OF_RANGE',
          distance: Math.round(distance),
          requiredRange: CHECK_IN_RANGE_METERS,
        },
        { status: 400 }
      );
    }

    // Return success with mock data
    // (Client handles cooldown and points via localStorage)
    const checkIn = {
      id: `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      storeId,
      timestamp: Date.now(),
      points: POINTS_PER_CHECKIN,
    };

    return NextResponse.json({
      success: true,
      pointsEarned: POINTS_PER_CHECKIN,
      message: `Check-in succesvol! +${POINTS_PER_CHECKIN} punten`,
      checkIn,
      userPoints: {
        total: 0, // Client will update from localStorage
        totalEarned: 0,
      },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Er ging iets mis bij het inchecken',
        errorCode: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
```

**Dependencies**: lib/location/distance.ts, lib/stores/storeService.ts

---

### [106] Create Rewards API Routes

**File**: `src/app/api/rewards/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { MOCK_REWARDS } from '@/lib/rewards/mockRewards';

export async function GET() {
  return NextResponse.json({ rewards: MOCK_REWARDS });
}
```

**File**: `src/app/api/rewards/redeem/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { MOCK_REWARDS } from '@/lib/rewards/mockRewards';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rewardId, userId } = body;

    if (!rewardId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reward ID is vereist',
          errorCode: 'MISSING_REWARD_ID',
        },
        { status: 400 }
      );
    }

    // Find reward
    const reward = MOCK_REWARDS.find((r) => r.id === rewardId);
    if (!reward) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bonus niet gevonden',
          errorCode: 'REWARD_NOT_FOUND',
          rewardId,
        },
        { status: 404 }
      );
    }

    // Generate redemption code
    const code = `CROWD${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const redemptionId = `redemption-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Return success (client handles points deduction)
    return NextResponse.json({
      success: true,
      message: 'Bonus succesvol ingewisseld!',
      redeemedReward: {
        id: redemptionId,
        rewardId: reward.id,
        title: reward.title,
        redeemedAt: Date.now(),
        code,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      },
      userPoints: {
        total: 0, // Client will update from localStorage
        totalSpent: 0,
      },
    });
  } catch (error) {
    console.error('Redemption error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Er ging iets mis bij het inwisselen',
        errorCode: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
```

**Dependencies**: lib/rewards/mockRewards.ts

---

## Phase 5: UI Components

### [107] Create Points Badge Component

**File**: `src/components/points/PointsBadge.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getUserPoints } from '@/lib/storage/pointsStorage';
import { UserPoints } from '@/types/points';

interface PointsBadgeProps {
  onClick?: () => void;
}

export default function PointsBadge({ onClick }: PointsBadgeProps) {
  const [points, setPoints] = useState<UserPoints | null>(null);

  useEffect(() => {
    setPoints(getUserPoints());

    // Listen for points updates
    const handleStorageChange = () => {
      setPoints(getUserPoints());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pointsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pointsUpdated', handleStorageChange);
    };
  }, []);

  if (!points) return null;

  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-[1002] bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-emerald-700 transition-all font-semibold"
      aria-label={`Je hebt ${points.points} punten`}
    >
      <span className="flex items-center gap-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        {points.points}
      </span>
    </button>
  );
}
```

**Dependencies**: lib/storage/pointsStorage.ts, types/points.ts

---

### [108] Create Check-in Button Component

**File**: `src/components/checkin/CheckInButton.tsx`

```typescript
'use client';

import { useState } from 'react';
import { getCurrentLocation } from '@/lib/location/geolocation';
import { canCheckIn, recordCheckIn, updatePoints } from '@/lib/storage/pointsStorage';

interface CheckInButtonProps {
  storeId: string;
  storeName: string;
  onSuccess?: () => void;
}

export default function CheckInButton({ storeId, storeName, onSuccess }: CheckInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Check cooldown
      if (!canCheckIn(storeId)) {
        setMessage('Je hebt hier recent al ingecheckt. Probeer later opnieuw.');
        setLoading(false);
        return;
      }

      // Get current location
      const location = await getCurrentLocation();
      if (!location) {
        setMessage('Kon je locatie niet bepalen. Zorg dat GPS aan staat.');
        setLoading(false);
        return;
      }

      // Call API
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          location: {
            lat: location.lat,
            lng: location.lng,
            accuracy: location.accuracy,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.error || 'Check-in mislukt');
        setLoading(false);
        return;
      }

      // Update local storage
      recordCheckIn(storeId);
      updatePoints(data.pointsEarned);

      // Trigger points update event
      window.dispatchEvent(new Event('pointsUpdated'));

      setMessage(data.message);
      onSuccess?.();
    } catch (error) {
      console.error('Check-in error:', error);
      setMessage('Er ging iets mis bij het inchecken');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckIn}
        disabled={loading || !canCheckIn(storeId)}
        className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'Inchecken...' : 'Check-in (+10 punten)'}
      </button>

      {message && (
        <p
          className={`text-sm ${
            message.includes('succesvol') ? 'text-emerald-700' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
```

**Dependencies**: lib/location/geolocation.ts, lib/storage/pointsStorage.ts

---

### [109] Create Rewards Screen Component

**File**: `src/components/rewards/RewardsScreen.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Reward } from '@/types/points';
import { getUserPoints, updatePoints } from '@/lib/storage/pointsStorage';
import { redeemReward, getRedeemedRewards } from '@/lib/storage/rewardsStorage';
import RewardCard from './RewardCard';

export default function RewardsScreen({ onClose }: { onClose: () => void }) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
    setUserPoints(getUserPoints().points);
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/rewards');
      const data = await response.json();
      setRewards(data.rewards || []);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (userPoints < reward.cost) {
      alert(
        `Onvoldoende punten. Je hebt ${reward.cost} punten nodig maar hebt er slechts ${userPoints}.`
      );
      return;
    }

    try {
      const response = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId: reward.id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || 'Kon bonus niet inwisselen');
        return;
      }

      // Deduct points locally
      updatePoints(-reward.cost);
      redeemReward(reward.id, reward.title, data.redeemedReward.code);

      // Update UI
      setUserPoints(getUserPoints().points);
      window.dispatchEvent(new Event('pointsUpdated'));

      alert(data.message);
    } catch (error) {
      console.error('Redemption error:', error);
      alert('Er ging iets mis bij het inwisselen');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[1003] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Bonussen</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 p-4 bg-emerald-50 rounded-lg">
            <p className="text-emerald-700 font-semibold">Je punten: {userPoints}</p>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Laden...</p>
          ) : (
            <div className="grid gap-4">
              {rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  userPoints={userPoints}
                  onRedeem={() => handleRedeem(reward)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**File**: `src/components/rewards/RewardCard.tsx`

```typescript
import { Reward } from '@/types/points';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onRedeem: () => void;
}

export default function RewardCard({ reward, userPoints, onRedeem }: RewardCardProps) {
  const canAfford = userPoints >= reward.cost;

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{reward.title}</h3>
          <p className="text-gray-600 text-sm">{reward.description}</p>
        </div>
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
          {reward.cost} pts
        </span>
      </div>

      {reward.terms && <p className="text-xs text-gray-500 mb-3">{reward.terms}</p>}

      <button
        onClick={onRedeem}
        disabled={!canAfford}
        className={`w-full py-2 rounded-lg font-semibold transition-all ${
          canAfford
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {canAfford ? 'Inwisselen' : 'Onvoldoende punten'}
      </button>
    </div>
  );
}
```

**Dependencies**: types/points.ts, lib/storage/\*

---

## Phase 6: Integration

### [110] Integrate Check-in into StoreMarker

Update `src/components/map/StoreMarker.tsx` to include CheckInButton in popup.

Add import:

```typescript
import CheckInButton from '@/components/checkin/CheckInButton';
```

In Popup content:

```typescript
<CheckInButton storeId={store.id} storeName={store.name} />
```

**Dependencies**: Task [108], StoreMarker component from feature 001

---

### [111] Add PointsBadge to Main Layout

Update `src/app/layout.tsx` or `src/components/map/StoreMap.tsx`:

```typescript
import PointsBadge from '@/components/points/PointsBadge';
import RewardsScreen from '@/components/rewards/RewardsScreen';

// In component:
const [showRewards, setShowRewards] = useState(false);

return (
  <>
    <PointsBadge onClick={() => setShowRewards(true)} />
    {showRewards && <RewardsScreen onClose={() => setShowRewards(false)} />}
    {/* rest of content */}
  </>
);
```

**Dependencies**: Tasks [107], [109]

---

## Phase 7: Testing

### [112] Unit Tests for Points Storage

**File**: `src/lib/storage/__tests__/pointsStorage.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getUserPoints, updatePoints, canCheckIn, recordCheckIn } from '../pointsStorage';

describe('Points Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with zero points', () => {
    const points = getUserPoints();
    expect(points.points).toBe(0);
    expect(points.totalEarned).toBe(0);
  });

  it('should add points correctly', () => {
    updatePoints(10);
    const points = getUserPoints();
    expect(points.points).toBe(10);
    expect(points.totalEarned).toBe(10);
  });

  it('should allow check-in when no history exists', () => {
    expect(canCheckIn('store-123')).toBe(true);
  });

  it('should prevent check-in during cooldown', () => {
    recordCheckIn('store-123');
    expect(canCheckIn('store-123')).toBe(false);
  });
});
```

---

### [113] Integration Test for Check-in Flow

**File**: `src/app/api/check-in/__tests__/route.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock distance calculation
vi.mock('@/lib/location/distance', () => ({
  haversineDistance: vi.fn(() => 50), // Mock within range
}));

describe('POST /api/check-in', () => {
  it('should succeed when within range', async () => {
    const request = new NextRequest('http://localhost/api/check-in', {
      method: 'POST',
      body: JSON.stringify({
        storeId: 'store-delhaize-kouter',
        location: { lat: 51.0543, lng: 3.7174 },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.pointsEarned).toBe(10);
  });
});
```

---

### [114] E2E Test for Rewards Redemption

**File**: `tests/e2e/rewards.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Rewards System', () => {
  test('should display rewards and allow redemption', async ({ page }) => {
    await page.goto('/');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container');

    // Click points badge (assuming user has points)
    await page.click('button:has-text("punten")');

    // Rewards screen should open
    await expect(page.locator('text=Bonussen')).toBeVisible();

    // Should see reward cards
    const rewardCards = page.locator('[class*="border rounded-lg"]');
    await expect(rewardCards.first()).toBeVisible();
  });
});
```

---

## Phase 8: Documentation

### [115] Update README with Check-in Instructions

Add section to `README.md`:

```markdown
## Check-in & Rewards

Users can check in at stores when physically present (within 100m) to earn points.

### Features

- GPS-validated check-ins (100m range)
- 10 points per check-in
- 4-hour cooldown per store
- Redeemable rewards catalog
- Points persistence in localStorage

### Testing

- Unit tests: `npm test storage/pointsStorage`
- Integration: `npm test api/check-in`
- E2E: `npm run test:e2e -- rewards.spec.ts`
```

---

## Success Criteria

Feature complete when:

- ✅ Check-in validates GPS location (100m range)
- ✅ Points awarded and persisted correctly
- ✅ Cooldown prevents duplicate check-ins
- ✅ Rewards catalog displays correctly
- ✅ Rewards can be redeemed with sufficient points
- ✅ Points badge shows in UI
- ✅ All tests pass

---

## Dependencies Tree

```
[101] Types
  ↓
[102] Points Storage
  ↓
[103] Rewards Storage ← [104] Mock Rewards
  ↓
[105] Check-in API ← [106] Rewards API
  ↓
[107] PointsBadge ← [108] CheckInButton ← [109] RewardsScreen
  ↓
[110] StoreMarker Integration ← [111] Layout Integration
  ↓
[112-114] Tests
  ↓
[115] Documentation
```
