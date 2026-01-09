'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapControllerProps {
  center: { lat: number; lng: number };
  zoom?: number;
}

/**
 * Component to update map view when center or zoom changes
 * Must be used inside MapContainer
 */
export default function MapController({ center, zoom }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (zoom !== undefined) {
      map.setView([center.lat, center.lng], zoom, { animate: true });
    } else {
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
    }
  }, [center.lat, center.lng, zoom, map]);

  return null;
}
