import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/crowd-reports/route';
import { CrowdLevel } from '@/types/crowd';

describe('/api/crowd-reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST - Submit Crowd Report', () => {
    it('should accept valid crowd report', async () => {
      const reportData = {
        storeId: 'store-1',
        level: CrowdLevel.MATIG,
        location: {
          lat: 51.0543,
          lng: 3.7174,
        },
      };

      const request = new NextRequest('http://localhost:3000/api/crowd-reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.report).toBeDefined();
      expect(data.report.id).toBeDefined();
    });

    it('should reject report without storeId', async () => {
      const reportData = {
        level: CrowdLevel.RUSTIG,
        location: {
          lat: 51.0543,
          lng: 3.7174,
        },
      };

      const request = new NextRequest('http://localhost:3000/api/crowd-reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should reject report without crowd level', async () => {
      const reportData = {
        storeId: 'store-1',
        location: {
          lat: 51.0543,
          lng: 3.7174,
        },
      };

      const request = new NextRequest('http://localhost:3000/api/crowd-reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('level');
    });

    it('should reject report without user location', async () => {
      const reportData = {
        storeId: 'store-1',
        level: CrowdLevel.DRUK,
      };

      const request = new NextRequest('http://localhost:3000/api/crowd-reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('location');
    });

    it('should accept all valid crowd levels', async () => {
      const levels = [CrowdLevel.RUSTIG, CrowdLevel.MATIG, CrowdLevel.DRUK];

      for (const level of levels) {
        const reportData = {
          storeId: `store-${level}`,
          level,
          location: {
            lat: 51.0543,
            lng: 3.7174,
          },
        };

        const request = new NextRequest('http://localhost:3000/api/crowd-reports', {
          method: 'POST',
          body: JSON.stringify(reportData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      }
    });

    it('should handle invalid JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/crowd-reports', {
        method: 'POST',
        body: 'invalid json{',
      });

      const response = await POST(request);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject invalid crowd level', async () => {
      const reportData = {
        storeId: 'store-1',
        level: 'zeer-druk', // Invalid level
        location: {
          lat: 51.0543,
          lng: 3.7174,
        },
      };

      const request = new NextRequest('http://localhost:3000/api/crowd-reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid crowd level');
    });

    it('should reject invalid coordinates', async () => {
      const invalidCoords = [
        { lat: 91, lng: 3.7174 }, // lat > 90
        { lat: -91, lng: 3.7174 }, // lat < -90
        { lat: 51.0543, lng: 181 }, // lng > 180
        { lat: 51.0543, lng: -181 }, // lng < -180
        { lat: 'invalid', lng: 3.7174 }, // non-number
      ];

      for (const coords of invalidCoords) {
        const reportData = {
          storeId: 'store-1',
          level: CrowdLevel.MATIG,
          location: coords,
        };

        const request = new NextRequest('http://localhost:3000/api/crowd-reports', {
          method: 'POST',
          body: JSON.stringify(reportData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Invalid coordinates');
      }
    });
  });
});
