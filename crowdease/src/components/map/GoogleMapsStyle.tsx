'use client';

import { useState } from 'react';
import { StoreType } from '@/types/store';

interface Props {
  onLocationFound: (lat: number, lng: number) => void;
  availableTypes: { type: StoreType; count: number }[];
  selectedTypes: StoreType[];
  onFilterChange: (types: StoreType[]) => void;
}

const typeIcons: Record<StoreType, string> = {
  [StoreType.SUPERMARKT]: '🛒',
  [StoreType.APOTHEEK]: '⚕️',
  [StoreType.DROGISTERIJ]: '💊',
  [StoreType.BAKKERIJ]: '🥖',
  [StoreType.SLAGERIJ]: '🥩',
  [StoreType.NACHTWINKEL]: '🌙',
};

const typeLabels: Record<StoreType, string> = {
  [StoreType.SUPERMARKT]: 'Supermarkten',
  [StoreType.APOTHEEK]: 'Apotheken',
  [StoreType.DROGISTERIJ]: 'Drogisterijen',
  [StoreType.BAKKERIJ]: 'Bakkerijen',
  [StoreType.SLAGERIJ]: 'Slagerijen',
  [StoreType.NACHTWINKEL]: 'Nachtwinkel',
};

export default function GoogleMapsStyle({
  onLocationFound,
  availableTypes,
  selectedTypes,
  onFilterChange,
}: Props) {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!address.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const data = await res.json();

      if (data.lat && data.lng) {
        onLocationFound(data.lat, data.lng);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleType = (type: StoreType) => {
    if (selectedTypes.includes(type)) {
      onFilterChange(selectedTypes.filter((t) => t !== type));
    } else {
      onFilterChange([...selectedTypes, type]);
    }
  };

  const allSelected = selectedTypes.length === 0;

  return (
    <>
      {/* Centered search bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] w-full max-w-xl px-4">
        <div className="bg-white rounded-full shadow-lg flex items-center px-4 py-3">
          <svg
            className="w-5 h-5 text-gray-500 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Zoek naar een adres of locatie"
            className="flex-1 outline-none text-gray-900"
          />
          {isLoading && (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent ml-2" />
          )}
        </div>
      </div>

      {/* Filter chips below search */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1001] w-full max-w-xl px-4">
        <div className="flex items-center gap-2 justify-center flex-wrap">
          {availableTypes.map(({ type, count }) => {
            const isSelected = allSelected || selectedTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium shadow-md transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {typeIcons[type]} {typeLabels[type]} ({count})
              </button>
            );
          })}
          {selectedTypes.length > 0 && (
            <button
              onClick={() => onFilterChange([])}
              className="px-4 py-2 rounded-full text-sm bg-white text-gray-600 shadow-md hover:bg-gray-50"
            >
              Alle winkels
            </button>
          )}
        </div>
      </div>
    </>
  );
}
