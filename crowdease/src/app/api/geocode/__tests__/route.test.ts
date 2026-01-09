import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/geocode/route';

// Mock fetch for Nominatim API
global.fetch = vi.fn();

describe('/api/geocode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET - Geocode Address', () => {
    it('should geocode valid Belgian address', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [
          {
            lat: '51.0543',
            lon: '3.7174',
            display_name: 'Korenmarkt, Gent, Oost-Vlaanderen, Vlaanderen, 9000, België',
          },
        ],
      });

      const url = new URL('http://localhost:3000/api/geocode?address=Korenmarkt, Gent');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.result.lat).toBe(51.0543);
      expect(data.result.lng).toBe(3.7174);
      expect(data.result.displayName).toContain('Gent');
    });

    it('should require address parameter', async () => {
      const url = new URL('http://localhost:3000/api/geocode');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('address');
    });

    it('should handle address not found', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const url = new URL('http://localhost:3000/api/geocode?address=NonexistentPlace12345');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });

    it('should handle Nominatim API errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const url = new URL('http://localhost:3000/api/geocode?address=Test Address');
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should add Belgium country code to query', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [
          {
            lat: '51.0543',
            lon: '3.7174',
            display_name: 'Gent, België',
          },
        ],
      });

      const url = new URL('http://localhost:3000/api/geocode?address=Gent');
      const request = new NextRequest(url);

      await GET(request);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('countrycodes=be'),
        expect.any(Object)
      );
    });

    it('should limit results to 1', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [
          {
            lat: '51.0543',
            lon: '3.7174',
            display_name: 'Result 1',
          },
        ],
      });

      const url = new URL('http://localhost:3000/api/geocode?address=Test');
      const request = new NextRequest(url);

      await GET(request);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=1'),
        expect.any(Object)
      );
    });
  });
});
