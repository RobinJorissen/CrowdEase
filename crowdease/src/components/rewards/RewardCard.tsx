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
          <h3 className="font-semibold text-lg text-gray-900">{reward.title}</h3>
          <p className="text-gray-600 text-sm">{reward.description}</p>
        </div>
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold text-sm ml-2">
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
