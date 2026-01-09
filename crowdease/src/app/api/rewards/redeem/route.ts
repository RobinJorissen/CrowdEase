import { NextRequest, NextResponse } from 'next/server';
import { MOCK_REWARDS } from '@/lib/rewards/mockRewards';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rewardId } = body;

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
