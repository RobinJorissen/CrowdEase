'use client';

import { useState } from 'react';
import { MapPin, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistance } from '@/lib/utils/distance';
import { getTodayHours, isStoreOpen } from '@/lib/utils/openingHours';
import type { OpeningHours } from '@/lib/utils/openingHours';
import CheckInButton from '@/components/checkin/CheckInButton';
import ConfirmationModal from '@/components/crowd/ConfirmationModal';
import { canReportCrowd } from '@/lib/storage/crowdStorage';

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
  openingHours?: OpeningHours;
}

interface StoreListItemProps {
  store: StoreData;
  distance: number;
  onClick: () => void;
  onRefresh?: () => void;
}

const crowdLabels = {
  gesloten: {
    label: 'Gesloten',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-gray-100 to-white',
  },
  rustig: {
    label: 'Rustig',
    color: 'text-green-600',
    bg: 'bg-green-50',
    gradient: 'bg-gradient-to-br from-green-100 to-white',
  },
  matig: {
    label: 'Matig',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    gradient: 'bg-gradient-to-br from-yellow-100 to-white',
  },
  druk: {
    label: 'Druk',
    color: 'text-red-600',
    bg: 'bg-red-50',
    gradient: 'bg-gradient-to-br from-red-100 to-white',
  },
  zeer_druk: {
    label: 'Zeer druk',
    color: 'text-red-700',
    bg: 'bg-red-100',
    gradient: 'bg-gradient-to-br from-red-200 to-red-50',
  },
};

export default function StoreListItem({ store, distance, onClick, onRefresh }: StoreListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pendingReport, setPendingReport] = useState<'rustig' | 'matig' | 'druk' | null>(null);

  // Check if store is open
  const storeIsOpen = isStoreOpen(store.openingHours);

  // Normalize crowd level from either crowdData.level or currentCrowd
  // If store is closed, override to 'gesloten'
  const crowdLevel = !storeIsOpen
    ? 'gesloten'
    : ((store.crowdData?.level || store.currentCrowd || 'rustig') as
        | 'rustig'
        | 'matig'
        | 'druk'
        | 'zeer_druk');
  const recommended = crowdLevel === 'rustig' || crowdLevel === 'matig';
  const crowdInfo = crowdLabels[crowdLevel as keyof typeof crowdLabels];

  // Format address - handle both string and object formats
  const address =
    typeof store.address === 'string'
      ? store.address
      : store.address
      ? `${store.address.street}, ${store.address.city}`
      : 'Geen adres beschikbaar';

  const todayHours = getTodayHours(store.openingHours);

  const handleCrowdReport = async (level: 'rustig' | 'matig' | 'druk') => {
    if (!canReportCrowd(store.id)) {
      alert('Je hebt hier recent al een melding gedaan. Probeer over een uur opnieuw.');
      return;
    }
    setPendingReport(level);
  };

  const handleConfirmReport = async () => {
    if (!pendingReport) return;

    try {
      const response = await fetch('/api/crowd-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          level: pendingReport,
          location: store.coordinates,
        }),
      });

      if (!response.ok) {
        alert('Er ging iets mis bij het versturen');
        return;
      }

      const { saveCrowdReport, recordCrowdReport } = await import('@/lib/storage/crowdStorage');
      const { updatePoints } = await import('@/lib/storage/pointsStorage');
      const result = await response.json();

      if (result.report) {
        saveCrowdReport(result.report);
        recordCrowdReport(store.id);
        updatePoints(2);
        window.dispatchEvent(new Event('pointsUpdated'));
      }

      setPendingReport(null);
      alert('Drukte gemeld! Je hebt 2 punten verdiend.');

      // Refresh the list to show updated crowd data
      onRefresh?.();
    } catch (error) {
      console.error('Error:', error);
      alert('Er ging iets mis');
    }
  };

  return (
    <>
      <div
        className={`w-full border-b border-gray-200 ${crowdInfo.gradient}`}
        data-testid={`store-list-item-${store.id}`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
          data-testid={`store-item-expand-${store.id}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">{store.name}</h3>
                {recommended && (
                  <span className="flex-shrink-0">
                    <Star size={16} className="text-emerald-600 fill-emerald-600" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin size={14} className="flex-shrink-0" />
                {address && <span className="truncate">{address}</span>}
              </div>

              {/* Opening Hours */}
              <div className="text-xs mb-2">
                <span
                  className={
                    storeIsOpen ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'
                  }
                >
                  {storeIsOpen ? '🟢 Open' : '🔴 Gesloten'}
                </span>
                <span className="text-gray-500 ml-2">{todayHours}</span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${crowdInfo.bg} ${crowdInfo.color}`}
                >
                  {crowdInfo.label}
                </span>
                <span className="text-xs text-gray-500">{formatDistance(distance)}</span>
              </div>
            </div>

            {isExpanded ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t bg-gray-50">
            {/* Check-in Button */}
            <div className="pt-3">
              <CheckInButton storeId={store.id} storeName={store.name} />
            </div>

            {/* Crowd Report Buttons */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Hoe druk is het? (+2 punten)</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleCrowdReport('rustig')}
                  className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
                  disabled={!canReportCrowd(store.id)}
                >
                  😊 Rustig
                </button>
                <button
                  onClick={() => handleCrowdReport('matig')}
                  className="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm font-medium transition-colors"
                  disabled={!canReportCrowd(store.id)}
                >
                  😐 Matig
                </button>
                <button
                  onClick={() => handleCrowdReport('druk')}
                  className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors"
                  disabled={!canReportCrowd(store.id)}
                >
                  😰 Druk
                </button>
              </div>
            </div>

            {/* Go to Map Button */}
            <button
              onClick={onClick}
              className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              📍 Ga naar locatie op kaart
            </button>
          </div>
        )}
      </div>

      {pendingReport && (
        <ConfirmationModal
          level={pendingReport}
          onConfirm={handleConfirmReport}
          onCancel={() => setPendingReport(null)}
        />
      )}
    </>
  );
}
