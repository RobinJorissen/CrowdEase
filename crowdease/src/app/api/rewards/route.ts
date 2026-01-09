import { NextResponse } from 'next/server';
import { MOCK_REWARDS } from '@/lib/rewards/mockRewards';

export async function GET() {
  return NextResponse.json({ rewards: MOCK_REWARDS });
}
