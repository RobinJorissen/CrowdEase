'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { getSavedAddresses, saveAddress } from '@/lib/storage/addressStorage';

interface Props {
  onLocationFound: (lat: number, lng: number) => void;
  onExpandChange?: (isExpanded: boolean) => void;
}

interface Suggestion {
  displayName: string;
  lat: number;
  lng: number;
  type: 'recent' | 'nominatim';
}

export interface LocationInputRef {
  toggleExpand: () => void;
  close: () => void;
}

const LocationInputMinimal = forwardRef<LocationInputRef, Props>(
  ({ onLocationFound, onExpandChange }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsTimeoutRef = useRef<NodeJS.Timeout>();

    useImperativeHandle(ref, () => ({
      toggleExpand: () => {
        setIsExpanded((prev) => !prev);
      },
      close: () => {
        setIsExpanded(false);
        setAddress('');
        setSuggestions([]);
        setShowSuggestions(false);
      },
    }));

    useEffect(() => {
      onExpandChange?.(isExpanded);
    }, [isExpanded, onExpandChange]);

    // Handle Escape key to close panel
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isExpanded) {
          setIsExpanded(false);
          setAddress('');
          setSuggestions([]);
          setShowSuggestions(false);
        }
      };

      if (isExpanded) {
        document.addEventListener('keydown', handleEscape);
        // Load recent addresses when expanded
        loadRecentAddresses();
        return () => document.removeEventListener('keydown', handleEscape);
      }
    }, [isExpanded]);

    // Load recent addresses from localStorage
    const loadRecentAddresses = () => {
      const saved = getSavedAddresses();
      if (saved.length > 0 && !address) {
        // We don't have coordinates for saved addresses, so we'll skip this for now
        // In a real app, you'd geocode these or save coordinates
        setShowSuggestions(false);
      }
    };

    // Fetch suggestions from Nominatim as user types
    useEffect(() => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }

      if (address.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
          nominatimUrl.searchParams.set('q', address);
          nominatimUrl.searchParams.set('format', 'json');
          nominatimUrl.searchParams.set('limit', '5');
          nominatimUrl.searchParams.set('countrycodes', 'be');

          const response = await fetch(nominatimUrl.toString(), {
            headers: { 'User-Agent': 'CrowdEase/1.0' },
          });

          const data = await response.json();

          const newSuggestions: Suggestion[] = data.slice(0, 5).map((item: any) => ({
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            type: 'nominatim' as const,
          }));

          setSuggestions(newSuggestions);
          setShowSuggestions(newSuggestions.length > 0);
        } catch (error) {
          console.error('Autocomplete error:', error);
        }
      }, 300); // Debounce 300ms

      return () => {
        if (suggestionsTimeoutRef.current) {
          clearTimeout(suggestionsTimeoutRef.current);
        }
      };
    }, [address]);

    const handleSearch = async (suggestionLat?: number, suggestionLng?: number) => {
      if (!address.trim() && !suggestionLat) return;

      setIsLoading(true);
      try {
        let lat: number, lng: number;

        if (suggestionLat && suggestionLng) {
          // Use suggestion coordinates
          lat = suggestionLat;
          lng = suggestionLng;
        } else {
          // Geocode the address
          const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
          const data = await res.json();

          if (data.result?.lat && data.result?.lng) {
            lat = data.result.lat;
            lng = data.result.lng;
          } else if (data.error) {
            alert(data.message || 'Adres niet gevonden');
            setIsLoading(false);
            return;
          } else {
            setIsLoading(false);
            return;
          }
        }

        // Save to recent addresses (extract address parts from string)
        const addressParts = address.split(',');
        if (addressParts.length >= 2) {
          saveAddress({
            street: addressParts[0]?.trim() || '',
            city: addressParts[1]?.trim() || 'Gent',
            postalCode: '',
          });
        }

        onLocationFound(lat, lng);
        setAddress('');
        setSuggestions([]);
        setShowSuggestions(false);
        setIsExpanded(false);
      } catch (error) {
        console.error('Geocoding error:', error);
        alert('Kan adres niet opzoeken. Controleer je internetverbinding.');
      } finally {
        setIsLoading(false);
      }
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
      setAddress(suggestion.displayName);
      handleSearch(suggestion.lat, suggestion.lng);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const suggestion = suggestions[selectedIndex];
          setAddress(suggestion.displayName);
          handleSearch(suggestion.lat, suggestion.lng);
        } else {
          handleSearch();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Escape') {
        if (showSuggestions) {
          setSuggestions([]);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        } else {
          setIsExpanded(false);
        }
      }
    };

    if (!isExpanded) {
      return (
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute top-4 left-4 z-[1001] bg-white rounded-full shadow-lg p-3 hover:bg-gray-50 transition-all"
          aria-label="Zoek adres"
        >
          <svg
            className="w-5 h-5 text-gray-700"
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
        </button>
      );
    }

    return (
      <div className="absolute top-4 left-4 z-[1001]">
        <div className="bg-white rounded-full shadow-lg flex items-center px-4 py-2 gap-2">
          <svg
            className="w-5 h-5 text-gray-500"
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
            ref={inputRef}
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Zoek adres..."
            className="outline-none text-gray-900 w-64"
            autoFocus
          />
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent" />
          )}
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-2 bg-white rounded-lg shadow-lg max-h-64 overflow-y-auto w-full">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.lat}-${suggestion.lng}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-4 py-2.5 cursor-pointer border-b last:border-b-0 ${
                  selectedIndex === index
                    ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {suggestion.type === 'recent' ? (
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">{suggestion.displayName}</div>
                    {suggestion.type === 'recent' && (
                      <div className="text-xs text-gray-500">Recent gezocht</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

LocationInputMinimal.displayName = 'LocationInputMinimal';

export default LocationInputMinimal;
