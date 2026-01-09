'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, User, Star, Award, TrendingUp, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUserPoints, updatePoints } from '@/lib/storage/pointsStorage';
import { getRedeemedRewards } from '@/lib/storage/rewardsStorage';
import { MOCK_REWARDS } from '@/lib/rewards/mockRewards';
import type { UserPoints, RedeemedReward } from '@/types/points';

export default function ProfielPage() {
  const router = useRouter();
  const [userPoints, setUserPoints] = useState<UserPoints>({
    userId: 'temp-user',
    points: 0,
    totalEarned: 0,
    totalSpent: 0,
    lastUpdated: Date.now(),
  });
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [codeMessage, setCodeMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    // Load user data
    setUserPoints(getUserPoints());
    setRedeemedRewards(getRedeemedRewards());
  }, []);

  const handleRedeemCode = () => {
    if (!promoCode.trim()) {
      setCodeMessage({ type: 'error', text: 'Voer een code in' });
      return;
    }

    // Check for rosebud cheat code
    if (promoCode.toLowerCase().trim() === 'rosebud') {
      updatePoints(1000);
      setUserPoints(getUserPoints());
      window.dispatchEvent(new Event('pointsUpdated'));
      setCodeMessage({ type: 'success', text: '🎉 Rosebud code geactiveerd! +1000 punten!' });
      setPromoCode('');

      // Clear message after 5 seconds
      setTimeout(() => setCodeMessage(null), 5000);
      return;
    }

    // Invalid code
    setCodeMessage({ type: 'error', text: 'Ongeldige code' });
    setTimeout(() => setCodeMessage(null), 3000);
  };

  const activeRewards = redeemedRewards.filter((r) => !r.used);
  const usedRewards = redeemedRewards.filter((r) => r.used);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 py-6">
        <button
          onClick={() => router.push('/')}
          className="mb-4 flex items-center gap-2 text-white/90 hover:text-white"
        >
          <ArrowLeft size={20} />
          <span>Terug naar kaart</span>
        </button>

        <div className="flex items-center mb-1 gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden mb-1">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=anna"
              alt="Profiel foto"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Anna Van Der Meer</h1>
            <p className="text-emerald-100">CrowdEase gebruiker</p>
          </div>
        </div>
      </div>

      {/* Points Summary */}
      <div className="bg-white mx-4 -mt-6 rounded-lg shadow-md p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Mijn Punten</h2>
          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full">
            <Star size={20} className="fill-emerald-600" />
            <span className="font-bold text-xl">{userPoints.points}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <TrendingUp size={16} />
              <span className="text-sm">Verdiend</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{userPoints.totalEarned}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Award size={16} />
              <span className="text-sm">Besteed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{userPoints.totalSpent}</p>
          </div>
        </div>
      </div>

      {/* Active Rewards */}
      {activeRewards.length > 0 && (
        <div className="bg-white mx-4 mb-4 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actieve Beloningen</h2>
          <div className="space-y-3">
            {activeRewards.map((reward) => {
              const rewardDetails = MOCK_REWARDS.find((r) => r.id === reward.rewardId);
              if (!rewardDetails) return null;

              const expiryDate = reward.expiresAt ? new Date(reward.expiresAt) : null;
              const isExpiringSoon = expiryDate
                ? expiryDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                : false;

              return (
                <div
                  key={reward.id}
                  className="border border-emerald-200 bg-emerald-50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{rewardDetails.title}</h3>
                    <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">
                      Actief
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rewardDetails.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono font-bold text-emerald-700">{reward.code}</span>
                    <span className={`${isExpiringSoon ? 'text-orange-600' : 'text-gray-500'}`}>
                      {expiryDate
                        ? `Geldig tot ${expiryDate.toLocaleDateString('nl-NL')}`
                        : 'Geldig'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Used Rewards */}
      {usedRewards.length > 0 && (
        <div className="bg-white mx-4 mb-4 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gebruikte Beloningen</h2>
          <div className="space-y-2">
            {usedRewards.map((reward) => {
              const rewardDetails = MOCK_REWARDS.find((r) => r.id === reward.rewardId);
              if (!rewardDetails) return null;

              return (
                <div key={reward.id} className="border border-gray-200 rounded-lg p-4 opacity-60">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{rewardDetails.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">Code: {reward.code}</p>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      Gebruikt
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Rewards Preview */}
      <div className="bg-white mx-4 mb-4 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Beschikbare Beloningen</h2>
        <div className="space-y-3">
          {MOCK_REWARDS.slice(0, 3).map((reward) => {
            const canAfford = userPoints.points >= reward.cost;

            return (
              <div
                key={reward.id}
                className={`border rounded-lg p-4 ${
                  canAfford ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{reward.title}</h3>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <Star size={16} className="fill-emerald-600" />
                    <span className="font-bold">{reward.cost}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{reward.description}</p>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => router.push('/beloningen')}
          className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium"
        >
          Bekijk alle beloningen
        </button>
      </div>

      {/* Statistics */}
      <div className="bg-white mx-4 mb-4 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistieken</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Totaal check-ins</span>
            <span className="font-bold text-gray-900">
              {Math.floor((userPoints.totalEarned || 0) / 5)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Beloningen ingewisseld</span>
            <span className="font-bold text-gray-900">{redeemedRewards.length}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Account sinds</span>
            <span className="font-bold text-gray-900">Januari 2026</span>
          </div>
        </div>
      </div>

      {/* Promo Code */}
      <div className="bg-white mx-4 mb-20 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="text-emerald-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Promotiecode</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Heb je een promotiecode ontvangen van een winkel? Voer deze hier in om punten te
          verdienen! Bonustip: hoe kon je snel 1000 simoleons verdienen in The Sims? Juist, met de
          code.
        </p>
        <div className="flex gap-2 items-stretch">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRedeemCode()}
            placeholder="Voer code in"
            className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
          />
          <button
            onClick={handleRedeemCode}
            className="px-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex-shrink-0"
          >
            OK
          </button>
        </div>
        {codeMessage && (
          <div
            className={`mt-3 p-3 rounded-lg text-sm ${
              codeMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {codeMessage.text}
          </div>
        )}
      </div>
    </div>
  );
}
