/**
 * View mode types for the store map
 */

export type ViewMode = 'map' | 'list';

export interface ViewModePreference {
  mode: ViewMode;
  timestamp: number;
}
