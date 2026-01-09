'use client';

import { Search, Filter, MapPin, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BottomBarProps {
  onSearchClick: () => void;
  onFilterClick: () => void;
  onLocationClick: () => void;
  isLiveTracking: boolean;
}

export default function BottomBar({
  onSearchClick,
  onFilterClick,
  onLocationClick,
  isLiveTracking,
}: BottomBarProps) {
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[1002]">
      <div className="flex items-center justify-around py-3 px-4">
        {/* Search/Address Button */}
        <button
          onClick={onSearchClick}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Zoek adres"
        >
          <Search size={24} className="text-gray-700" />
          <span className="text-xs text-gray-600">Zoeken</span>
        </button>

        {/* Location Button */}
        <button
          onClick={onLocationClick}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
            isLiveTracking ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100 text-gray-700'
          }`}
          aria-label={isLiveTracking ? 'Live locatie actief' : 'Live locatie inactief'}
        >
          <div className="relative">
            <MapPin size={24} className={isLiveTracking ? 'fill-emerald-600' : ''} />
            {isLiveTracking && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
            )}
          </div>
          <span className="text-xs">Locatie</span>
        </button>

        {/* Filter Button */}
        <button
          onClick={onFilterClick}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Filter winkels"
        >
          <Filter size={24} className="text-gray-700" />
          <span className="text-xs text-gray-600">Filter</span>
        </button>

        {/* Profile Button */}
        <button
          onClick={() => router.push('/profiel')}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Mijn profiel"
        >
          <User size={24} className="text-gray-700" />
          <span className="text-xs text-gray-600">Profiel</span>
        </button>
      </div>
    </div>
  );
}
