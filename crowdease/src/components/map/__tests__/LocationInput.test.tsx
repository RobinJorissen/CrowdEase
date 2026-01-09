import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LocationInputMinimal from '../LocationInputMinimal';

describe('LocationInputMinimal', () => {
  it('should toggle between collapsed and expanded states', () => {
    render(<LocationInputMinimal onLocationFound={() => {}} />);

    // Initially collapsed - only icon visible
    expect(screen.getByLabelText('Zoek adres')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/zoek adres/i)).not.toBeInTheDocument();

    // Expand
    fireEvent.click(screen.getByLabelText('Zoek adres'));
    expect(screen.getByPlaceholderText(/zoek adres/i)).toBeInTheDocument();

    // Close button should be visible
    const closeButton = screen.getByText('✕');
    expect(closeButton).toBeInTheDocument();

    // Collapse
    fireEvent.click(closeButton);
    expect(screen.queryByPlaceholderText(/zoek adres/i)).not.toBeInTheDocument();
  });

  it('should render search input with correct placeholder', () => {
    render(<LocationInputMinimal onLocationFound={() => {}} />);

    fireEvent.click(screen.getByLabelText('Zoek adres'));

    const input = screen.getByPlaceholderText('Zoek adres...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should allow typing in search input', () => {
    render(<LocationInputMinimal onLocationFound={() => {}} />);

    fireEvent.click(screen.getByLabelText('Zoek adres'));

    const input = screen.getByPlaceholderText('Zoek adres...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Gent' } });

    expect(input.value).toBe('Gent');
  });
});
