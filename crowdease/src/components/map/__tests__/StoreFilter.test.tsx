import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StoreFilterMinimal from '../StoreFilterMinimal';
import { StoreType } from '@/types/store';

describe('StoreFilterMinimal', () => {
  const mockOnFilterChange = vi.fn();
  const mockOnShowClosedChange = vi.fn();
  const mockAvailableTypes = [
    { type: StoreType.SUPERMARKT, count: 5 },
    { type: StoreType.APOTHEEK, count: 3 },
    { type: StoreType.DROGISTERIJ, count: 2 },
    { type: StoreType.BAKKERIJ, count: 4 },
    { type: StoreType.SLAGERIJ, count: 1 },
  ];

  it('should render collapsed filter icon with count badge', () => {
    render(
      <StoreFilterMinimal
        availableTypes={mockAvailableTypes}
        selectedTypes={[StoreType.SUPERMARKT, StoreType.APOTHEEK]}
        onFilterChange={mockOnFilterChange}
        showClosed={false}
        onShowClosedChange={mockOnShowClosedChange}
      />
    );

    // Should show badge with count
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should expand filter panel when icon is clicked', () => {
    render(
      <StoreFilterMinimal
        availableTypes={mockAvailableTypes}
        selectedTypes={[]}
        onFilterChange={mockOnFilterChange}
        showClosed={false}
        onShowClosedChange={mockOnShowClosedChange}
      />
    );

    const filterButton = screen.getByLabelText('Filters');
    fireEvent.click(filterButton);

    // Should show all store type options
    expect(screen.getByText(/Supermarkten/i)).toBeInTheDocument();
    expect(screen.getByText(/Apotheken/i)).toBeInTheDocument();
    expect(screen.getByText(/Drogisterijen/i)).toBeInTheDocument();
    expect(screen.getByText(/Bakkerijen/i)).toBeInTheDocument();
    expect(screen.getByText(/Slagerijen/i)).toBeInTheDocument();
  });

  it('should toggle filter selection', () => {
    const { rerender } = render(
      <StoreFilterMinimal
        availableTypes={mockAvailableTypes}
        selectedTypes={[]}
        onFilterChange={mockOnFilterChange}
        showClosed={false}
        onShowClosedChange={mockOnShowClosedChange}
      />
    );

    // Expand panel
    fireEvent.click(screen.getByLabelText('Filters'));

    // Click Supermarkt button
    const supermarktButton = screen.getByRole('button', { name: /Supermarkten/i });
    fireEvent.click(supermarktButton);

    // Should call callback with SUPERMARKT added
    expect(mockOnFilterChange).toHaveBeenCalledWith([StoreType.SUPERMARKT]);

    // Rerender with updated state
    rerender(
      <StoreFilterMinimal
        availableTypes={mockAvailableTypes}
        selectedTypes={[StoreType.SUPERMARKT]}
        onFilterChange={mockOnFilterChange}
        showClosed={false}
        onShowClosedChange={mockOnShowClosedChange}
      />
    );

    // Click again to deselect
    fireEvent.click(supermarktButton);
    expect(mockOnFilterChange).toHaveBeenCalledWith([]);
  });

  it('should select multiple filters', () => {
    render(
      <StoreFilterMinimal
        availableTypes={mockAvailableTypes}
        selectedTypes={[]}
        onFilterChange={mockOnFilterChange}
        showClosed={false}
        onShowClosedChange={mockOnShowClosedChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Filters'));

    // Click Supermarkt
    const supermarktButton = screen.getByRole('button', { name: /Supermarkten/i });
    fireEvent.click(supermarktButton);
    expect(mockOnFilterChange).toHaveBeenLastCalledWith([StoreType.SUPERMARKT]);

    // Click Apotheek
    const apotheekButton = screen.getByRole('button', { name: /Apotheken/i });
    fireEvent.click(apotheekButton);
    expect(mockOnFilterChange).toHaveBeenLastCalledWith([StoreType.APOTHEEK]);
  });

  it('should clear all filters', () => {
    render(
      <StoreFilterMinimal
        availableTypes={mockAvailableTypes}
        selectedTypes={[StoreType.SUPERMARKT, StoreType.APOTHEEK]}
        onFilterChange={mockOnFilterChange}
        showClosed={false}
        onShowClosedChange={mockOnShowClosedChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Filters'));

    const clearButton = screen.getByText('Wis filters');
    fireEvent.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith([]);
  });

  it('should show close button when panel is open', () => {
    render(
      <StoreFilterMinimal
        availableTypes={mockAvailableTypes}
        selectedTypes={[]}
        onFilterChange={mockOnFilterChange}
        showClosed={false}
        onShowClosedChange={mockOnShowClosedChange}
      />
    );

    // Expand panel
    fireEvent.click(screen.getByLabelText('Filters'));
    expect(screen.getByText(/Supermarkten/i)).toBeInTheDocument();

    // Close button should be visible
    const closeButton = screen.getByText('✕');
    expect(closeButton).toBeInTheDocument();

    // Click close button
    fireEvent.click(closeButton);

    // Panel should be closed
    expect(screen.queryByText(/Supermarkten/i)).not.toBeInTheDocument();
  });

  it('should show emoji icons for each store type', () => {
    render(
      <StoreFilterMinimal
        availableTypes={mockAvailableTypes}
        selectedTypes={[]}
        onFilterChange={mockOnFilterChange}
        showClosed={false}
        onShowClosedChange={mockOnShowClosedChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Filters'));

    // Check for emoji in labels
    expect(screen.getByText(/🛒/)).toBeInTheDocument(); // Supermarkt
    expect(screen.getByText(/⚕️/)).toBeInTheDocument(); // Apotheek
    expect(screen.getByText(/💊/)).toBeInTheDocument(); // Drogisterij
    expect(screen.getByText(/🥖/)).toBeInTheDocument(); // Bakkerij
    expect(screen.getByText(/🥩/)).toBeInTheDocument(); // Slagerij
  });

  it('should not show badge when no filters selected', () => {
    render(
      <StoreFilterMinimal
        availableTypes={mockAvailableTypes}
        selectedTypes={[]}
        onFilterChange={mockOnFilterChange}
        showClosed={false}
        onShowClosedChange={mockOnShowClosedChange}
      />
    );

    // Badge should not be visible
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should update badge count when filters change', () => {
    const { rerender } = render(
      <StoreFilterMinimal
        availableTypes={mockAvailableTypes}
        selectedTypes={[StoreType.SUPERMARKT]}
        onFilterChange={mockOnFilterChange}
        showClosed={false}
        onShowClosedChange={mockOnShowClosedChange}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();

    rerender(
      <StoreFilterMinimal
        availableTypes={mockAvailableTypes}
        selectedTypes={[StoreType.SUPERMARKT, StoreType.APOTHEEK, StoreType.BAKKERIJ]}
        onFilterChange={mockOnFilterChange}
        showClosed={false}
        onShowClosedChange={mockOnShowClosedChange}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
