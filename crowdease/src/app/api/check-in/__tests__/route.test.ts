import { describe, it, expect, vi } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock haversineDistance to return controlled values
vi.mock('@/lib/location/distance', () => ({
  haversineDistance: vi.fn((lat1, lng1, lat2, lng2) => {
    // Default: within range (50m)
    return 50;
  }),
}));

// Mock getStoreById
vi.mock('@/lib/stores/storeService', () => ({
  getStoreById: vi.fn((id: string) => {
    if (id === 'store-invalid') return undefined;
    return {
      id,
      name: 'Test Store',
      type: 'supermarkt',
      coordinates: { lat: 51.0543, lng: 3.7174 },
    };
  }),
}));

describe('POST /api/check-in', () => {
  it('should succeed when within range', async () => {
    const request = new NextRequest('http://localhost/api/check-in', {
      method: 'POST',
      body: JSON.stringify({
        storeId: 'store-delhaize-kouter',
        location: { lat: 51.0543, lng: 3.7174 },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.pointsEarned).toBe(10);
    expect(data.message).toContain('Check-in succesvol');
  });

  it('should fail when GPS location is missing', async () => {
    const request = new NextRequest('http://localhost/api/check-in', {
      method: 'POST',
      body: JSON.stringify({
        storeId: 'store-delhaize-kouter',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe('GPS_REQUIRED');
  });

  it('should fail when store not found', async () => {
    const request = new NextRequest('http://localhost/api/check-in', {
      method: 'POST',
      body: JSON.stringify({
        storeId: 'store-invalid',
        location: { lat: 51.0543, lng: 3.7174 },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe('STORE_NOT_FOUND');
  });

  it('should fail when out of range', async () => {
    const { haversineDistance } = await import('@/lib/location/distance');
    vi.mocked(haversineDistance).mockReturnValueOnce(200); // 200m > 100m

    const request = new NextRequest('http://localhost/api/check-in', {
      method: 'POST',
      body: JSON.stringify({
        storeId: 'store-delhaize-kouter',
        location: { lat: 51.0543, lng: 3.7174 },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe('OUT_OF_RANGE');
    expect(data.distance).toBe(200);
  });
});
