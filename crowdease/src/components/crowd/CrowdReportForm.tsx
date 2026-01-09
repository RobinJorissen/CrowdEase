'use client';

import { useState } from 'react';
import { CrowdLevel } from '@/types/crowd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Store {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
}

interface Props {
  stores: Store[];
  userLocation: { lat: number; lng: number } | null;
  onSubmit: (storeId: string, level: CrowdLevel) => Promise<void>;
  onClose: () => void;
}

export default function CrowdReportForm({ stores, userLocation, onSubmit, onClose }: Props) {
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<CrowdLevel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!selectedStore || !selectedLevel) {
      setError('Selecteer een winkel en drukte-niveau');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await onSubmit(selectedStore, selectedLevel);
      setSuccess(true);
      setTimeout(() => onClose(), 1500); // Close after showing success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute top-20 left-4 right-4 z-[1002] md:left-auto md:right-4 md:w-96">
      <Card className="p-4 shadow-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Drukte melden</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Sluiten"
          >
            ×
          </button>
        </div>

        {/* Store selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Welke winkel?</label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
          >
            <option value="">Kies een winkel...</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {/* Crowd level buttons */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Hoe druk is het?</label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => setSelectedLevel(CrowdLevel.RUSTIG)}
              variant={selectedLevel === CrowdLevel.RUSTIG ? 'default' : 'outline'}
              className={
                selectedLevel === CrowdLevel.RUSTIG
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'border-green-600 text-green-600 hover:bg-green-50'
              }
            >
              Rustig
            </Button>
            <Button
              onClick={() => setSelectedLevel(CrowdLevel.MATIG)}
              variant={selectedLevel === CrowdLevel.MATIG ? 'default' : 'outline'}
              className={
                selectedLevel === CrowdLevel.MATIG
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'border-yellow-600 text-yellow-600 hover:bg-yellow-50'
              }
            >
              Matig
            </Button>
            <Button
              onClick={() => setSelectedLevel(CrowdLevel.DRUK)}
              variant={selectedLevel === CrowdLevel.DRUK ? 'default' : 'outline'}
              className={
                selectedLevel === CrowdLevel.DRUK
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'border-red-600 text-red-600 hover:bg-red-50'
              }
            >
              Druk
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            {/* Success message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">✓ Drukte succesvol gemeld!</p>
              </div>
            )}{' '}
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedStore || !selectedLevel}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isSubmitting ? 'Versturen...' : 'Verstuur melding'}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Annuleer
          </Button>
        </div>

        {!userLocation && (
          <p className="mt-3 text-xs text-gray-500">
            Tip: Sta locatietoegang toe voor nauwkeurigere meldingen
          </p>
        )}
      </Card>
    </div>
  );
}
