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
