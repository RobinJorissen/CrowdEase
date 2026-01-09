import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/stores/route';

describe('/api/stores', () => {
  describe('GET - Nearby Stores', () => {
    it('should return stores near Gent centrum', async () => {
      const url = new URL('http://localhost:3000/api/stores?lat=51.0543&lng=3.7174&radius=3');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stores).toBeDefined();
      expect(Array.isArray(data.stores)).toBe(true);
      expect(data.stores.length).toBeGreaterThan(0);
    });

    it('should include crowd data for each store', async () => {
      const url = new URL('http://localhost:3000/api/stores?lat=51.0543&lng=3.7174&radius=5');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      const storeWithCrowd = data.stores.find((s: any) => s.crowdData);
      expect(storeWithCrowd).toBeDefined();
      expect(storeWithCrowd.crowdData).toHaveProperty('level');
      expect(storeWithCrowd.crowdData).toHaveProperty('message');
      expect(storeWithCrowd.crowdData).toHaveProperty('lastUpdated');
    });

    it('should filter stores by radius', async () => {
      const smallRadius = new URL(
        'http://localhost:3000/api/stores?lat=51.0543&lng=3.7174&radius=0.5'
      );
      const largeRadius = new URL(
        'http://localhost:3000/api/stores?lat=51.0543&lng=3.7174&radius=5'
      );

      const smallResponse = await GET(new NextRequest(smallRadius));
      const largeResponse = await GET(new NextRequest(largeRadius));

      const smallData = await smallResponse.json();
      const largeData = await largeResponse.json();

      expect(smallData.stores.length).toBeLessThanOrEqual(largeData.stores.length);
    });

    it('should require latitude parameter', async () => {
      const url = new URL('http://localhost:3000/api/stores?lng=3.7174&radius=3');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid coordinates');
    });

    it('should require longitude parameter', async () => {
      const url = new URL('http://localhost:3000/api/stores?lat=51.0543&radius=3');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid coordinates');
    });

    it('should use default radius if not provided', async () => {
      const url = new URL('http://localhost:3000/api/stores?lat=51.0543&lng=3.7174');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stores).toBeDefined();
    });

    it('should include store type in response', async () => {
      const url = new URL('http://localhost:3000/api/stores?lat=51.0543&lng=3.7174&radius=5');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      if (data.stores.length > 0) {
        expect(data.stores[0]).toHaveProperty('type');
        expect(typeof data.stores[0].type).toBe('string');
      }
    });

    it('should return stores sorted by distance', async () => {
      const url = new URL('http://localhost:3000/api/stores?lat=51.0543&lng=3.7174&radius=5');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      if (data.stores.length > 1) {
        for (let i = 1; i < data.stores.length; i++) {
          expect(data.stores[i].distance).toBeGreaterThanOrEqual(data.stores[i - 1].distance);
        }
      }
    });
  });
});
