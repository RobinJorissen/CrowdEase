'use client';

import { useState } from 'react';
import { X, MapPin, Navigation } from 'lucide-react';

interface LocationModalProps {
  onClose: () => void;
  onLocationFound: (lat: number, lng: number, address?: string) => void;
  onEnableLiveTracking?: () => void;
}

export default function LocationModal({
  onClose,
  onLocationFound,
  onEnableLiveTracking,
}: LocationModalProps) {
  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!address.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        onLocationFound(parseFloat(lat), parseFloat(lon), display_name);
        onClose();
      } else {
        alert('Adres niet gevonden. Probeer een ander adres.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Er ging iets mis bij het zoeken.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationFound(position.coords.latitude, position.coords.longitude);
          onEnableLiveTracking?.();
          onClose();
        },
        (error) => {
          console.error('Location error:', error);
          alert('Kon locatie niet ophalen.');
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[1003] flex items-end">
      <div className="bg-white w-full rounded-t-2xl shadow-xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Zoek locatie</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current Location Button */}
          <button
            onClick={handleCurrentLocation}
            className="w-full flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <Navigation size={20} className="text-emerald-600" />
            <span className="font-medium text-emerald-700">Gebruik huidige locatie</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-sm text-gray-500">of</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label htmlFor="address-input" className="block text-sm font-medium text-gray-700">
              Zoek een adres
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="address-input"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Bijv. Korenmarkt, Gent"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !address.trim()}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
              >
                {isSearching ? 'Zoeken...' : 'Zoek'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-4" />
      </div>
    </div>
  );
}
