'use client';

import { useState, useEffect } from 'react';
import StoreListItem from './StoreListItem';
import RecommendedCard from './RecommendedCard';
import { calculateDistance } from '@/lib/utils/distance';
import { calculateRecommendation } from '@/lib/utils/recommendations';
import { isStoreOpen } from '@/lib/utils/openingHours';

interface StoreData {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  crowdData?: {
    level: 'rustig' | 'matig' | 'druk' | 'zeer_druk' | null;
    message?: string;
  };
  currentCrowd?: 'rustig' | 'matig' | 'druk' | 'zeer_druk';
  address?: string | { street: string; city: string; postalCode: string };
  type?: string;
  openingHours?: any;
}

interface StoreListProps {
  stores: StoreData[];
  onStoreClick: (store: StoreData) => void;
  onRefresh?: () => void;
  userLocation: { lat: number; lng: number };
}

interface StoreWithMetadata extends StoreData {
  distance: number;
  recommendationScore: number;
}

export default function StoreList({
  stores,
  onStoreClick,
  onRefresh,
  userLocation,
}: StoreListProps) {
  const [sortedStores, setSortedStores] = useState<StoreWithMetadata[]>([]);
  const [recommendedStore, setRecommendedStore] = useState<StoreWithMetadata | null>(null);

  useEffect(() => {
    // Add metadata to stores
    const storesWithMetadata: StoreWithMetadata[] = stores.map((store) => {
      // Normalize crowd level from either crowdData.level or currentCrowd
      const crowdLevel = store.crowdData?.level || store.currentCrowd || 'rustig';

      return {
        ...store,
        distance: calculateDistance(store, userLocation.lat, userLocation.lng),
        recommendationScore: calculateRecommendation({
          currentCrowd: crowdLevel as 'rustig' | 'matig' | 'druk' | 'zeer_druk',
        }),
      };
    });

    // Sort by distance only (closer is better)
    const sorted = storesWithMetadata.sort((a, b) => a.distance - b.distance);

    // Find the closest rustige winkel that is open as recommendation
    const recommended = sorted.find((store) => {
      const crowdLevel = store.crowdData?.level || store.currentCrowd;
      const open = isStoreOpen(store.openingHours);
      return crowdLevel === 'rustig' && open;
    });

    setRecommendedStore(recommended || null);
    setSortedStores(sorted);
  }, [stores, userLocation]);

  return (
    <div
      className="absolute inset-0 bg-white z-[1000] overflow-y-auto pb-20"
      data-testid="store-list-container"
    >
      <div
        className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10"
        data-testid="store-list-header"
      >
        <h2 className="text-lg font-semibold text-gray-900">Winkels ({sortedStores.length})</h2>
        <p className="text-sm text-gray-600 mt-1">Gesorteerd op afstand</p>
      </div>

      {/* Recommended Store Card */}
      {recommendedStore && (
        <RecommendedCard
          store={recommendedStore}
          distance={recommendedStore.distance}
          onClick={() => onStoreClick(recommendedStore)}
        />
      )}

      <div className="divide-y divide-gray-200">
        {sortedStores.map((store) => (
          <StoreListItem
            key={store.id}
            store={store}
            distance={store.distance}
            onClick={() => onStoreClick(store)}
            onRefresh={onRefresh}
          />
        ))}
      </div>

      {sortedStores.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Geen winkels gevonden</p>
        </div>
      )}
    </div>
  );
}
