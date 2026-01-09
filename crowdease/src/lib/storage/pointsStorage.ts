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
