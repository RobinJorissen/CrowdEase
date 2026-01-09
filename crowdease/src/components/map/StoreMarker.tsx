'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { CrowdLevel } from '@/types/crowd';
import CheckInButton from '@/components/checkin/CheckInButton';
import { Star } from 'lucide-react';

interface Props {
  storeId: string;
  lat: number;
  lng: number;
  name: string;
  crowdLevel: CrowdLevel | null;
  crowdMessage: string;
  onReportCrowd: (storeId: string, level: 'rustig' | 'matig' | 'druk') => void;
  isRecommended?: boolean;
}

// Custom marker colors based on crowd level
const getMarkerColor = (level: CrowdLevel | null) => {
  if (level === CrowdLevel.RUSTIG) return 'green';
  if (level === CrowdLevel.MATIG) return 'gold';
  if (level === CrowdLevel.DRUK) return 'red';
  return 'grey';
};

export default function StoreMarker({
  storeId,
  lat,
  lng,
  name,
  crowdLevel,
  crowdMessage,
  onReportCrowd,
  isRecommended = false,
}: Props) {
  const color = getMarkerColor(crowdLevel);

  const icon = new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <Marker position={[lat, lng]} icon={icon}>
      <Popup>
        <div className="text-sm min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-gray-900">{name}</h3>
            {isRecommended && <Star size={16} className="text-emerald-600 fill-emerald-600" />}
          </div>

          {isRecommended && (
            <div className="mb-2 inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
              Aanbeveling
            </div>
          )}

          <p className="mt-1 text-gray-700 mb-3">{crowdMessage}</p>

          <div className="border-t pt-3 mb-3">
            <p className="text-xs text-gray-600 mb-2">Hoe druk is het nu?</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onReportCrowd(storeId, 'rustig')}
                className="px-2 py-1.5 text-xs font-medium rounded bg-green-600 hover:bg-green-700 text-white"
              >
                Rustig
              </button>
              <button
                onClick={() => onReportCrowd(storeId, 'matig')}
                className="px-2 py-1.5 text-xs font-medium rounded bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Matig
              </button>
              <button
                onClick={() => onReportCrowd(storeId, 'druk')}
                className="px-2 py-1.5 text-xs font-medium rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Druk
              </button>
            </div>
          </div>

          <div className="border-t pt-3">
            <CheckInButton storeId={storeId} storeName={name} />
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
