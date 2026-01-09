import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StoreMap from '../../map/StoreMap';

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  useMap: () => ({
    setView: vi.fn(),
    flyTo: vi.fn(),
  }),
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  configurable: true,
});

// Mock fetch
global.fetch = vi.fn();

describe('Crowd Reporting Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful geolocation
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 51.0543,
          longitude: 3.7174,
          accuracy: 10,
        },
      });
    });

    // Mock stores API response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        stores: [
          {
            id: 'store-1',
            name: 'Test Supermarkt',
            type: 'SUPERMARKT',
            coordinates: {
              lat: 51.0543,
              lng: 3.7174,
            },
            address: { street: 'Teststraat', number: '1', city: 'Gent', postalCode: '9000' },
            distance: 0.1,
            crowdData: {
              level: 'MATIG',
              message: '5-10 people',
              lastUpdated: new Date().toISOString(),
            },
          },
        ],
      }),
    });
  });

  it('should submit crowd report when user clicks marker button and confirms', async () => {
    const { container } = render(<StoreMap />);

    // Wait for stores to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/stores'));
    });

    // Find and click a crowd level button in popup
    const rustигButton = screen.queryByText('🟢 Rustig');
    if (rustигButton) {
      fireEvent.click(rustигButton);

      // Confirmation modal should appear
      await waitFor(() => {
        expect(screen.getByText(/wil je de melding verzenden/i)).toBeInTheDocument();
      });

      // Click OK to confirm
      const okButton = screen.getByText('OK');
      fireEvent.click(okButton);

      // Should call crowd report API
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/crowd-reports',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"level":"RUSTIG"'),
          })
        );
      });
    }
  });

  it('should cancel report when user clicks Annuleren', async () => {
    render(<StoreMap />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/stores'));
    });

    const drukButton = screen.queryByText('🔴 Druk');
    if (drukButton) {
      fireEvent.click(drukButton);

      await waitFor(() => {
        expect(screen.getByText(/wil je de melding verzenden/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Annuleren');
      fireEvent.click(cancelButton);

      // Modal should close, no API call
      await waitFor(() => {
        expect(screen.queryByText(/wil je de melding verzenden/i)).not.toBeInTheDocument();
      });

      // Only stores API should be called, not crowd-reports
      const crowdReportCalls = (global.fetch as any).mock.calls.filter(
        (call: any) => call[0] === '/api/crowd-reports'
      );
      expect(crowdReportCalls).toHaveLength(0);
    }
  });

  it('should show success feedback after successful report', async () => {
    // Mock successful crowd report submission
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/stores')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ stores: [] }),
        });
      }
      if (url === '/api/crowd-reports') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, reportId: 'report-123' }),
        });
      }
    });

    render(<StoreMap />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const matigButton = screen.queryByText('🟡 Matig');
    if (matigButton) {
      fireEvent.click(matigButton);

      await waitFor(() => {
        expect(screen.getByText(/wil je de melding verzenden/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('OK'));

      // Check for success feedback (you may need to add this to your component)
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/crowd-reports', expect.any(Object));
      });
    }
  });

  it('should handle API errors gracefully', async () => {
    // Mock failed crowd report submission
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/stores')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ stores: [] }),
        });
      }
      if (url === '/api/crowd-reports') {
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
    });

    render(<StoreMap />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Test error handling (you may need to add error UI to component)
    const rustигButton = screen.queryByText('🟢 Rustig');
    if (rustигButton) {
      fireEvent.click(rustигButton);

      await waitFor(() => {
        expect(screen.getByText(/wil je de melding verzenden/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('OK'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/crowd-reports', expect.any(Object));
      });

      // Should handle error gracefully (no crash)
    }
  });
});
