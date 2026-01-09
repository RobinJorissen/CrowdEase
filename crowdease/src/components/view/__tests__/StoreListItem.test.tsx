import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StoreListItem from '../StoreListItem';

describe('StoreListItem', () => {
  const mockStore = {
    id: '1',
    name: 'Test Store',
    address: { street: '123 Test Street', city: 'Gent', postalCode: '9000' },
    type: 'supermarkt',
    coordinates: { lat: 51.0543, lng: 3.7174 },
    currentCrowd: 'rustig' as const,
  };

  it('should render store name and address', () => {
    const mockOnClick = vi.fn();
    render(<StoreListItem store={mockStore} distance={0.5} onClick={mockOnClick} />);

    expect(screen.getByText('Test Store')).toBeInTheDocument();
    expect(screen.getByText('123 Test Street, Gent')).toBeInTheDocument();
  });

  it('should display formatted distance', () => {
    const mockOnClick = vi.fn();
    render(<StoreListItem store={mockStore} distance={0.5} onClick={mockOnClick} />);

    expect(screen.getByText('500 m')).toBeInTheDocument();
  });

  it('should show recommendation badge and star for recommended stores', () => {
    const mockOnClick = vi.fn();
    render(<StoreListItem store={mockStore} distance={0.5} onClick={mockOnClick} />);

    expect(screen.getByText('Aanbeveling')).toBeInTheDocument();
  });

  it('should not show recommendation badge for busy stores', () => {
    const busyStore = { ...mockStore, currentCrowd: 'druk' as const };
    const mockOnClick = vi.fn();
    render(<StoreListItem store={busyStore} distance={0.5} onClick={mockOnClick} />);

    expect(screen.queryByText('Aanbeveling')).not.toBeInTheDocument();
  });

  it('should display correct crowd level badge', () => {
    const mockOnClick = vi.fn();
    render(<StoreListItem store={mockStore} distance={0.5} onClick={mockOnClick} />);

    expect(screen.getByText('Rustig')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<StoreListItem store={mockStore} distance={0.5} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should display different crowd levels with correct styling', () => {
    const mockOnClick = vi.fn();

    const stores = [
      { ...mockStore, currentCrowd: 'rustig' as const },
      { ...mockStore, currentCrowd: 'matig' as const },
      { ...mockStore, currentCrowd: 'druk' as const },
      { ...mockStore, currentCrowd: 'zeer_druk' as const },
    ];

    stores.forEach((store) => {
      const { rerender } = render(
        <StoreListItem store={store} distance={0.5} onClick={mockOnClick} />
      );

      const labels = {
        rustig: 'Rustig',
        matig: 'Matig',
        druk: 'Druk',
        zeer_druk: 'Zeer druk',
      };

      expect(screen.getByText(labels[store.currentCrowd])).toBeInTheDocument();
      rerender(<div />);
    });
  });
});
