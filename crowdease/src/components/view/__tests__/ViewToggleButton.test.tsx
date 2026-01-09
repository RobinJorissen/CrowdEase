import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewToggleButton from '../ViewToggleButton';

describe('ViewToggleButton', () => {
  it('should render both map and list buttons', () => {
    const mockOnViewChange = vi.fn();
    render(<ViewToggleButton currentView="map" onViewChange={mockOnViewChange} />);

    expect(screen.getByLabelText('Kaartweergave')).toBeInTheDocument();
    expect(screen.getByLabelText('Lijstweergave')).toBeInTheDocument();
  });

  it('should highlight map button when in map view', () => {
    const mockOnViewChange = vi.fn();
    render(<ViewToggleButton currentView="map" onViewChange={mockOnViewChange} />);

    const mapButton = screen.getByLabelText('Kaartweergave');
    expect(mapButton).toHaveAttribute('aria-pressed', 'true');
    expect(mapButton).toHaveClass('bg-emerald-600', 'text-white');
  });

  it('should highlight list button when in list view', () => {
    const mockOnViewChange = vi.fn();
    render(<ViewToggleButton currentView="list" onViewChange={mockOnViewChange} />);

    const listButton = screen.getByLabelText('Lijstweergave');
    expect(listButton).toHaveAttribute('aria-pressed', 'true');
    expect(listButton).toHaveClass('bg-emerald-600', 'text-white');
  });

  it('should call onViewChange with "map" when map button is clicked', () => {
    const mockOnViewChange = vi.fn();
    render(<ViewToggleButton currentView="list" onViewChange={mockOnViewChange} />);

    const mapButton = screen.getByLabelText('Kaartweergave');
    fireEvent.click(mapButton);

    expect(mockOnViewChange).toHaveBeenCalledWith('map');
  });

  it('should call onViewChange with "list" when list button is clicked', () => {
    const mockOnViewChange = vi.fn();
    render(<ViewToggleButton currentView="map" onViewChange={mockOnViewChange} />);

    const listButton = screen.getByLabelText('Lijstweergave');
    fireEvent.click(listButton);

    expect(mockOnViewChange).toHaveBeenCalledWith('list');
  });
});
