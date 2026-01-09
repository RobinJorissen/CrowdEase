'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getCurrentLocation } from '@/lib/location/geolocation';
import { haversineDistance } from '@/lib/location/distance';
import { isStoreOpen } from '@/lib/utils/openingHours';
import { CrowdLevel } from '@/types/crowd';
import { StoreType } from '@/types/store';
import type { ViewMode } from '@/types/view';
import LocationInputMinimal from './LocationInputMinimal';
import StoreMarker from './StoreMarker';
import StoreFilterMinimal from './StoreFilterMinimal';
import MapController from './MapController';
import ConfirmationModal from '@/components/crowd/ConfirmationModal';
import PointsBadge from '@/components/points/PointsBadge';
import RewardsScreen from '@/components/rewards/RewardsScreen';
import ViewToggleButton from '@/components/view/ViewToggleButton';
import StoreList from '@/components/view/StoreList';
import BottomBar from '@/components/view/BottomBar';
import LocationModal from '@/components/view/LocationModal';
import FilterModal from '@/components/view/FilterModal';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = { lat: 51.0543, lng: 3.7174 };
const DEFAULT_ZOOM = 18;
const LOCATION_FOUND_ZOOM = 20;

interface Store {
  id: string;
  name: string;
  type: StoreType;
  coordinates: { lat: number; lng: number };
  openingHours?: any;
  crowdData: {
    level: CrowdLevel | null;
    message: string;
  };
}

export default function StoreMap() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [hasLocation, setHasLocation] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<StoreType[]>([]);
  const [showClosed, setShowClosed] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [pendingReport, setPendingReport] = useState<{
    storeId: string;
    level: 'rustig' | 'matig' | 'druk';
  } | null>(null);

  const locationInputRef = useRef<{ toggleExpand: () => void; close: () => void } | null>(null);
  const filterRef = useRef<{ toggleExpand: () => void; close: () => void } | null>(null);

  useEffect(() => {
    getCurrentLocation().then((location) => {
      if (location) {
        setCenter({ lat: location.lat, lng: location.lng });
        setZoom(LOCATION_FOUND_ZOOM);
        setHasLocation(true);
      }
    });
  }, []);

  // Close address and filter panels when switching from map to list view
  useEffect(() => {
    if (viewMode === 'list') {
      if (locationInputRef.current && isAddressOpen) {
        locationInputRef.current.close();
        setIsAddressOpen(false);
      }
      if (filterRef.current && isFilterOpen) {
        filterRef.current.close();
        setIsFilterOpen(false);
      }
    }
  }, [viewMode]);

  // Live tracking: update location every 10 seconds
  useEffect(() => {
    if (!isLiveTracking) return;


    // Immediately get current location when live tracking is enabled
    const updateLocation = async () => {
      const location = await getCurrentLocation();
      if (location) {
        setCenter({ lat: location.lat, lng: location.lng });
        setZoom(LOCATION_FOUND_ZOOM);
      } else {
        setSuccessMessage('Kan je locatie niet bepalen. Live tracking gestopt.');
        setIsLiveTracking(false);
      }
    };

    // Update immediately
    updateLocation();

    // Then update every 10 seconds
    const interval = setInterval(updateLocation, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [isLiveTracking]);

  useEffect(() => {
    if (center) {
      fetchStores(center.lat, center.lng);
    }
  }, [center]);

  const fetchStores = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stores?lat=${lat}&lng=${lng}&radius=5`);
      if (!res.ok) {
        throw new Error('Kon winkels niet laden');
      }
      const data = await res.json();
      if (data.stores) {
        // Overlay recent user reports (< 30 min) on top of server data
        const { getRecentReportForStore } = await import('@/lib/storage/crowdStorage');
        const storesWithRecentReports = data.stores.map((store: Store) => {
          const recentReport = getRecentReportForStore(store.id, 30);

          if (recentReport) {
            const ageMinutes = Math.floor((Date.now() - recentReport.timestamp) / 60000);
            return {
              ...store,
              crowdData: {
                level: recentReport.crowdLevel,
                message: `${
                  recentReport.crowdLevel.charAt(0).toUpperCase() + recentReport.crowdLevel.slice(1)
                } - ${ageMinutes} ${
                  ageMinutes === 1 ? 'minuut' : 'minuten'
                } geleden (jouw melding)`,
              },
            };
          }

          return store;
        });

        setStores(storesWithRecentReports);
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      setError('Kon winkels niet laden. Probeer opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationFound = (lat: number, lng: number) => {
    setCenter({ lat, lng });
    setZoom(LOCATION_FOUND_ZOOM);
    setHasLocation(true);
  };

  const handleReportClick = (storeId: string, level: 'rustig' | 'matig' | 'druk') => {
    setPendingReport({ storeId, level });
  };

  const handleConfirmReport = async () => {
    if (!pendingReport) return;

    try {
      const { storeId, level } = pendingReport;

      // Map string level to CrowdLevel enum
      const crowdLevelMap: Record<string, CrowdLevel> = {
        rustig: CrowdLevel.RUSTIG,
        matig: CrowdLevel.MATIG,
        druk: CrowdLevel.DRUK,
      };

      // Submit crowd report to API
      const response = await fetch('/api/crowd-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId,
          level: crowdLevelMap[level],
          location: {
            lat: center.lat,
            lng: center.lng,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Er ging iets mis bij het versturen');
        return;
      }

      // Save report to localStorage
      const result = await response.json();
      if (result.report && typeof window !== 'undefined') {
        const { saveCrowdReport, recordCrowdReport } = await import('@/lib/storage/crowdStorage');
        const { updatePoints } = await import('@/lib/storage/pointsStorage');
        saveCrowdReport(result.report);
        recordCrowdReport(storeId);

        // Award 2 points for crowd report
        updatePoints(2);
        window.dispatchEvent(new Event('pointsUpdated'));
      }

      // Refresh stores to show updated crowd data
      await fetchStores(center.lat, center.lng);
      setPendingReport(null);

      // Show success message
      setSuccessMessage('Drukte succesvol gemeld! Bedankt voor je bijdrage.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error) {
      console.error('Error submitting crowd report:', error);
      alert('Er ging iets mis bij het versturen');
    }
  };

  const handleCancelReport = () => {
    setPendingReport(null);
  };

  // Calculate available types with counts
  const availableTypes = useMemo(() => {
    return stores.reduce((acc, store) => {
      const existing = acc.find((item) => item.type === store.type);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ type: store.type, count: 1 });
      }
      return acc;
    }, [] as { type: StoreType; count: number }[]);
  }, [stores]);

  // Filter stores by selected types and open status
  const filteredStores = useMemo(() => {
    let filtered = stores;

    // Filter by open status if showClosed is false
    if (!showClosed) {
      filtered = filtered.filter((store) => isStoreOpen(store.openingHours));
    }

    // Filter by selected types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((store) => selectedTypes.includes(store.type));
    }

    return filtered;
  }, [stores, selectedTypes, showClosed]);

  // Handle store selection from list view
  const handleStoreClick = (store: { coordinates: { lat: number; lng: number } }) => {
    setViewMode('map');
    setCenter(store.coordinates);
    setZoom(LOCATION_FOUND_ZOOM);
    // Panels will be closed by the useEffect watching viewMode
  };

  // Bottom bar handlers
  const handleSearchClick = () => {
    if (viewMode === 'list') {
      setShowLocationModal(true);
    } else if (locationInputRef.current) {
      locationInputRef.current.toggleExpand();
      setIsAddressOpen((prev) => !prev);
    }
  };

  const handleFilterClick = () => {
    if (viewMode === 'list') {
      setShowFilterModal(true);
    } else if (filterRef.current) {
      filterRef.current.toggleExpand();
      setIsFilterOpen((prev) => !prev);
    }
  };

  const handleLocationClick = () => {
    setIsLiveTracking(!isLiveTracking);
  };

  return (
    <div className="relative h-full w-full" data-testid="store-map-container">
      {showRewards && <RewardsScreen onClose={() => setShowRewards(false)} />}

      <ViewToggleButton currentView={viewMode} onViewChange={setViewMode} />

      {viewMode === 'list' && (
        <>
          <StoreList
            stores={filteredStores}
            onStoreClick={handleStoreClick}
            onRefresh={() => fetchStores(center.lat, center.lng)}
            userLocation={center}
          />
          <BottomBar
            onSearchClick={handleSearchClick}
            onFilterClick={handleFilterClick}
            onLocationClick={handleLocationClick}
            isLiveTracking={isLiveTracking}
          />
        </>
      )}

      {/* Map view controls */}
      {viewMode === 'map' && (
        <>
          <LocationInputMinimal
            ref={locationInputRef}
            onLocationFound={handleLocationFound}
            onExpandChange={setIsAddressOpen}
          />

          <StoreFilterMinimal
            ref={filterRef}
            availableTypes={availableTypes}
            selectedTypes={selectedTypes}
            onFilterChange={setSelectedTypes}
            onExpandChange={setIsFilterOpen}
            showClosed={showClosed}
            onShowClosedChange={setShowClosed}
          />

          {/* Live tracking button */}
          <button
            onClick={() => setIsLiveTracking(!isLiveTracking)}
            className={`absolute top-16 left-4 z-[1001] rounded-full shadow-lg p-3 transition-all ${
              isLiveTracking ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white hover:bg-gray-50'
            }`}
            aria-label={isLiveTracking ? 'Live locatie actief' : 'Live locatie inactief'}
            data-testid="live-tracking-toggle"
          >
            <svg
              className={`w-5 h-5 ${isLiveTracking ? 'text-white' : 'text-gray-700'}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            {isLiveTracking && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-emerald-600 animate-pulse" />
            )}
          </button>
        </>
      )}

      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1003] bg-white rounded-lg shadow-lg p-4" data-testid="loading-indicator">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent" />
            <span className="text-gray-700">Winkels laden...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-28 left-4 right-4 z-[1003] bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg md:left-auto md:right-4 md:w-96" data-testid="error-message">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => fetchStores(center.lat, center.lng)}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                data-testid="retry-button"
              >
                Opnieuw proberen
              </button>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600" data-testid="close-error-button">
              ✕
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="absolute top-28 left-4 right-4 z-[1003] bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-lg md:left-auto md:right-4 md:w-96" data-testid="success-message">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-emerald-800 flex-1">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-400 hover:text-emerald-600"
              data-testid="close-success-button"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {pendingReport && (
        <ConfirmationModal
          level={pendingReport.level}
          onConfirm={handleConfirmReport}
          onCancel={handleCancelReport}
        />
      )}

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        zoomControl={false}
        className="h-full w-full"
        data-testid="leaflet-map"
      >
        <MapController center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[center.lat, center.lng]}>
          <Popup>
            <div className="text-sm">
              <h3 className="font-bold">Jouw locatie</h3>
              <p className="mt-1">
                Lat: {center.lat.toFixed(4)}, Lng: {center.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        {filteredStores.map((store) => (
          <StoreMarker
            key={store.id}
            storeId={store.id}
            lat={store.coordinates.lat}
            lng={store.coordinates.lng}
            name={store.name}
            crowdLevel={store.crowdData.level}
            crowdMessage={store.crowdData.message}
            onReportCrowd={handleReportClick}
            isRecommended={store.crowdData.level === 'rustig' || store.crowdData.level === 'matig'}
          />
        ))}
      </MapContainer>

      {/* Modals for list view */}
      {showLocationModal && (
        <LocationModal
          onClose={() => setShowLocationModal(false)}
          onLocationFound={(lat, lng) => {
            setCenter({ lat, lng });
            setZoom(LOCATION_FOUND_ZOOM);
            fetchStores(lat, lng);
          }}
          onEnableLiveTracking={() => setIsLiveTracking(true)}
        />
      )}

      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          availableTypes={availableTypes.map((t) => t.type)}
          selectedTypes={selectedTypes}
          onFilterChange={(types) => setSelectedTypes(types as StoreType[])}
          showClosed={showClosed}
          onShowClosedChange={setShowClosed}
        />
      )}
    </div>
  );
}
