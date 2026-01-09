'use client';

import { useEffect, useState } from 'react';
import { Reward } from '@/types/points';
import { getUserPoints, updatePoints } from '@/lib/storage/pointsStorage';
import { redeemReward } from '@/lib/storage/rewardsStorage';
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
