import { HistoricalPattern } from '@/types/crowd';

const STORAGE_KEY = 'historicalPatterns';

export function getHistoricalPatterns(): HistoricalPattern[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveHistoricalPatterns(patterns: HistoricalPattern[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
}
