'use client';

import { Star, MapPin, Clock } from 'lucide-react';
import { getTodayHours, isStoreOpen } from '@/lib/utils/openingHours';

interface Store {
  id: string;
  name: string;
  address?: string | { street: string; city: string; postalCode: string };
  type?: string;
  openingHours?: any;
  crowdData?: {
    level: 'rustig' | 'matig' | 'druk' | 'zeer_druk' | null;
  };
}

interface RecommendedCardProps {
  store: Store;
  distance: number;
  onClick: () => void;
}

export default function RecommendedCard({ store, distance, onClick }: RecommendedCardProps) {
  const addressStr =
    typeof store.address === 'string'
      ? store.address
      : store.address
      ? `${store.address.street}, ${store.address.city}`
      : 'Adres onbekend';

  const isOpen = isStoreOpen(store.openingHours);
  const hours = getTodayHours(store.openingHours);

  return (
    <div
      onClick={onClick}
      className="mx-4 mt-4 mb-2 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all"
      data-testid="recommended-store-card"
    >
      <div className="p-4">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            <Star size={14} className="fill-white" />
            <span>Aanbevolen voor jou</span>
          </div>
        </div>

        {/* Store Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">{store.name}</h3>

        {/* Type */}
        {store.type && <p className="text-sm text-emerald-700 font-medium mb-2">{store.type}</p>}

        {/* Info Grid */}
        <div className="space-y-2">
          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <MapPin size={16} className="mt-0.5 flex-shrink-0 text-emerald-600" />
            <span>{addressStr}</span>
          </div>

          {/* Distance & Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-700">
              <span className="font-semibold">{distance.toFixed(1)} km</span>
            </div>

            {/* Opening hours */}
            <div className="flex items-center gap-1 text-sm">
              {isOpen ? (
                <>
                  <span className="text-green-600">🟢 Open</span>
                  <span className="text-gray-600">• {hours}</span>
                </>
              ) : (
                <>
                  <span className="text-red-600">🔴 Gesloten</span>
                  <span className="text-gray-600">• {hours}</span>
                </>
              )}
            </div>
          </div>

          {/* Crowd level */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-200">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-900">Rustig</span>
              <span className="text-gray-600">- Ideaal om nu te bezoeken</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
