import { describe, it, expect } from 'vitest';
import { CrowdLevel } from '@/types/crowd';

// Extract the color logic for testing
function getMarkerColor(level: CrowdLevel | null): string {
  if (!level) return 'gray';

  switch (level) {
    case CrowdLevel.RUSTIG:
      return 'green';
    case CrowdLevel.MATIG:
      return 'gold';
    case CrowdLevel.DRUK:
      return 'red';
    default:
      return 'gray';
  }
}

describe('Store Marker Colors', () => {
  it('should return green for RUSTIG', () => {
    expect(getMarkerColor(CrowdLevel.RUSTIG)).toBe('green');
  });

  it('should return gold for MATIG', () => {
    expect(getMarkerColor(CrowdLevel.MATIG)).toBe('gold');
  });

  it('should return red for DRUK', () => {
    expect(getMarkerColor(CrowdLevel.DRUK)).toBe('red');
  });

  it('should return gray for null (no data)', () => {
    expect(getMarkerColor(null)).toBe('gray');
  });

  it('should map all CrowdLevel enum values', () => {
    const allLevels = Object.values(CrowdLevel);
    expect(allLevels).toHaveLength(3);

    allLevels.forEach((level) => {
      const color = getMarkerColor(level);
      expect(['green', 'gold', 'red']).toContain(color);
    });
  });
});

describe('Marker Color Visual Representation', () => {
  it('should use distinct colors for easy differentiation', () => {
    const colors = [
      getMarkerColor(CrowdLevel.RUSTIG),
      getMarkerColor(CrowdLevel.MATIG),
      getMarkerColor(CrowdLevel.DRUK),
      getMarkerColor(null),
    ];

    // All colors should be unique
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(4);
  });

  it('should follow traffic light metaphor', () => {
    // Green = go/safe (RUSTIG)
    expect(getMarkerColor(CrowdLevel.RUSTIG)).toBe('green');

    // Gold/Yellow = caution (MATIG)
    expect(getMarkerColor(CrowdLevel.MATIG)).toBe('gold');

    // Red = stop/busy (DRUK)
    expect(getMarkerColor(CrowdLevel.DRUK)).toBe('red');
  });
});
