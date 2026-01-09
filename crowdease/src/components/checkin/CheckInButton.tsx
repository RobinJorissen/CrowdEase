'use client';

import { useState } from 'react';
import { getCurrentLocation } from '@/lib/location/geolocation';
import { canCheckIn, recordCheckIn, updatePoints } from '@/lib/storage/pointsStorage';

interface CheckInButtonProps {
  storeId: string;
  storeName: string;
  onSuccess?: () => void;
}

export default function CheckInButton({ storeId, storeName, onSuccess }: CheckInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Check cooldown
      if (!canCheckIn(storeId)) {
        setMessage('Je hebt hier recent al ingecheckt. Probeer later opnieuw.');
        setLoading(false);
        return;
      }

      // Get current location
      const location = await getCurrentLocation();
      if (!location) {
        setMessage(
          'Je kan niet inchecken zonder locatie toestemming. Wil je toch 5 punten verdienen? Zet je locatie aan en probeer het opnieuw.'
        );
        setLoading(false);
        return;
      }

      // Call API
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          location: {
            lat: location.lat,
            lng: location.lng,
            accuracy: location.accuracy,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.error || 'Check-in mislukt');
        setLoading(false);
        return;
      }

      // Update local storage
      recordCheckIn(storeId);
      updatePoints(data.pointsEarned);

      // Trigger points update event
      window.dispatchEvent(new Event('pointsUpdated'));

      setMessage(data.message);
      onSuccess?.();
    } catch (error) {
      console.error('Check-in error:', error);
      setMessage('Er ging iets mis bij het inchecken');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckIn}
        disabled={loading || !canCheckIn(storeId)}
        className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
        data-testid="check-in-button"
      >
        {loading ? 'Inchecken...' : 'Check-in (+5 punten)'}
      </button>

      {message && (
        <p
          className={`text-sm ${
            message.includes('succesvol') ? 'text-emerald-700' : 'text-red-600'
          }`}
          data-testid="check-in-message"
        >
          {message}
        </p>
      )}
    </div>
  );
}
