import { SavedAddress } from '@/types/location';

const STORAGE_KEY = 'savedAddresses';

export function getSavedAddresses(): SavedAddress[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAddress(address: SavedAddress): void {
  const addresses = getSavedAddresses();
  // Prevent duplicates
  const exists = addresses.some(
    (a) =>
      a.street === address.street && a.city === address.city && a.postalCode === address.postalCode
  );

  if (!exists) {
    addresses.unshift(address); // Add to beginning
    // Keep only last 5 addresses
    const trimmed = addresses.slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
}
