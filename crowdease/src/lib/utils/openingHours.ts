export interface OpeningHours {
  monday: { open: string; close: string } | null;
  tuesday: { open: string; close: string } | null;
  wednesday: { open: string; close: string } | null;
  thursday: { open: string; close: string } | null;
  friday: { open: string; close: string } | null;
  saturday: { open: string; close: string } | null;
  sunday: { open: string; close: string } | null;
}

const DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

/**
 * Check if a store is currently open based on opening hours
 * Supports overnight hours (e.g., 18:00 - 04:00 for night shops)
 */
export function isStoreOpen(openingHours?: any): boolean {
  if (!openingHours) return true; // If no hours specified, assume open

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = currentHours * 60 + currentMinutes; // Convert to minutes since midnight

  // Convert numeric day to string key
  const dayKey = DAYS[dayOfWeek] as keyof OpeningHours;
  const todayHours = openingHours[dayKey];

  if (todayHours) {
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    // Normal hours (e.g., 09:00 - 18:00)
    if (openTime < closeTime) {
      if (currentTime >= openTime && currentTime <= closeTime) {
        return true;
      }
    }
    // Overnight hours (e.g., 18:00 - 04:00)
    else {
      if (currentTime >= openTime || currentTime <= closeTime) {
        return true;
      }
    }
  }

  // Check if we're in the early morning hours of a shop that closed after midnight
  if (currentHours < 12) {
    const yesterdayIndex = (dayOfWeek - 1 + 7) % 7;
    const yesterdayKey = DAYS[yesterdayIndex] as keyof OpeningHours;
    const yesterdayHours = openingHours[yesterdayKey];

    if (yesterdayHours) {
      const [openHour, openMin] = yesterdayHours.open.split(':').map(Number);
      const [closeHour, closeMin] = yesterdayHours.close.split(':').map(Number);
      const openTime = openHour * 60 + openMin;
      const closeTime = closeHour * 60 + closeMin;

      // If yesterday's closing time is after midnight (close < open)
      if (closeTime < openTime && currentTime <= closeTime) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get formatted opening hours for today
 */
export function getTodayHours(openingHours?: any): string {
  if (!openingHours) return 'Openingstijden onbekend';

  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayKey = DAYS[dayOfWeek] as keyof OpeningHours;
  const dayHours = openingHours[dayKey];

  if (!dayHours) return 'Vandaag gesloten';

  return `${dayHours.open} - ${dayHours.close}`;
}

/**
 * Generate mock opening hours for stores
 */
export function generateMockOpeningHours(storeType: string): OpeningHours {
  // Supermarkets: 8:00 - 20:00, 7 days
  if (storeType === 'Supermarkt') {
    return {
      monday: { open: '08:00', close: '20:00' },
      tuesday: { open: '08:00', close: '20:00' },
      wednesday: { open: '08:00', close: '20:00' },
      thursday: { open: '08:00', close: '20:00' },
      friday: { open: '08:00', close: '20:00' },
      saturday: { open: '08:00', close: '20:00' },
      sunday: { open: '09:00', close: '18:00' },
    };
  }

  // Bakkerij: 7:00 - 18:00, closed Sunday
  if (storeType === 'Bakkerij') {
    return {
      monday: { open: '07:00', close: '18:00' },
      tuesday: { open: '07:00', close: '18:00' },
      wednesday: { open: '07:00', close: '18:00' },
      thursday: { open: '07:00', close: '18:00' },
      friday: { open: '07:00', close: '18:00' },
      saturday: { open: '07:00', close: '17:00' },
      sunday: null,
    };
  }

  // Default: 9:00 - 18:00, closed Sunday
  return {
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '09:00', close: '17:00' },
    sunday: null,
  };
}
