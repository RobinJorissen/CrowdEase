import { mockStores } from './mockStores';
import { Store } from '@/types/store';
import { haversineDistance } from '@/lib/location/distance';

export function getStoreById(id: string): Store | undefined {
  return mockStores.find((s) => s.id === id);
}

export function getNearbyStores(lat: number, lng: number, radiusKm: number = 5): Store[] {
  return mockStores
    .map((store) => ({
      store,
      distance: haversineDistance(lat, lng, store.coordinates.lat, store.coordinates.lng),
    }))
    .filter(({ distance }) => distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .map(({ store }) => store);
}
