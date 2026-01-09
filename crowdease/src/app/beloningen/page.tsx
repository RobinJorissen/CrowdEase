'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Reward } from '@/types/points';
import { getUserPoints, updatePoints } from '@/lib/storage/pointsStorage';
import { redeemReward } from '@/lib/storage/rewardsStorage';
import RewardCard from '@/components/rewards/RewardCard';

export default function BeloningenPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-gray-50" data-testid="rewards-page">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Terug"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Beloningen</h1>
        </div>
      </div>

      {/* Points Balance */}
      <div className="mx-4 mt-4 p-6 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg shadow-md text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm">Beschikbare punten</p>
            <div className="flex items-center gap-2 mt-1">
              <Star size={32} className="fill-white" />
              <span className="text-4xl font-bold">{userPoints}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards List */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
          </div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Geen beloningen beschikbaar</p>
          </div>
        ) : (
          <div className="grid gap-4 pb-8">
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
  );
}
