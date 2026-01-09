import { StoreType } from './store';

export interface MapState {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  selectedStoreId: string | null;
  activeFilters: StoreType[];
}
