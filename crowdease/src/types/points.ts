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
  category: 'discount' | 'freebie' | 'priority' | 'entertainment' | 'voucher' | 'parking' | 'food';
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
