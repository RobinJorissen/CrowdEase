import { describe, it, expect } from 'vitest';
import { getDayOfWeek, getHourOfDay, getDayName, timeAgo } from './dateTime';

describe('getDayOfWeek', () => {
  it('should return correct day of week', () => {
    // Tuesday, January 7, 2026 12:00:00 UTC
    const timestamp = new Date('2026-01-07T12:00:00Z').getTime();
    expect(getDayOfWeek(timestamp)).toBe(3); // Wednesday
  });
});

describe('getHourOfDay', () => {
  it('should return correct hour', () => {
    const timestamp = new Date('2026-01-07T14:30:00').getTime();
    expect(getHourOfDay(timestamp)).toBe(14);
  });
});

describe('getDayName', () => {
  it('should return Dutch day names', () => {
    expect(getDayName(0)).toBe('zondag');
    expect(getDayName(1)).toBe('maandag');
    expect(getDayName(6)).toBe('zaterdag');
  });
});

describe('timeAgo', () => {
  it('should format recent timestamps', () => {
    const now = Date.now();
    expect(timeAgo(now - 30000)).toContain('seconden');
    expect(timeAgo(now - 90000)).toContain('minuut');
  });
});
