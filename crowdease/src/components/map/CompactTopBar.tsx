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

export default function CompactTopBar({
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
    <div className="absolute top-4 left-4 right-4 z-[1001]">
      <div className="bg-white rounded-lg shadow-lg p-3 max-w-3xl mx-auto">
        {/* Search bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-3 py-2">
            <svg
              className="w-5 h-5 text-gray-500 mr-2"
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
              placeholder="Zoek adres..."
              className="flex-1 outline-none bg-transparent text-gray-900 text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:bg-gray-300"
          >
            {isLoading ? '...' : 'Zoek'}
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Filters:</span>
          {availableTypes.map(({ type, count }) => {
            const isSelected = allSelected || selectedTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {typeIcons[type]} {count}
              </button>
            );
          })}
          {selectedTypes.length > 0 && (
            <button
              onClick={() => onFilterChange([])}
              className="text-xs text-gray-500 hover:text-gray-700 underline whitespace-nowrap"
            >
              Wis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
