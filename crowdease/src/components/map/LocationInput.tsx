'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  onLocationFound: (lat: number, lng: number) => void;
}

export default function LocationInput({ onLocationFound }: Props) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeocode = async () => {
    if (!address.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const data = await res.json();

      if (data.success) {
        onLocationFound(data.result.lat, data.result.lng);
      } else {
        setError(data.message || 'Adres niet gevonden');
      }
    } catch (err) {
      setError('Fout bij zoeken van adres');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-4 left-16 z-[1001] bg-white p-4 rounded-lg shadow-lg max-w-md">
      <Input
        type="text"
        placeholder="Voer je adres in (bijv. Veldstraat 10, Gent)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleGeocode()}
        className="mb-2 text-gray-900 placeholder:text-gray-500"
      />
      <Button
        onClick={handleGeocode}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {loading ? 'Zoeken...' : 'Zoek'}
      </Button>
      {error && <p className="text-red-600 text-sm mt-2 font-medium">{error}</p>}
    </div>
  );
}
