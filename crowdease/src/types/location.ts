export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  source: LocationSource;
}

export enum LocationSource {
  GPS = 'gps',
  GEOCODED = 'geocoded',
}

export interface SavedAddress {
  street: string;
  city: string;
  postalCode: string;
}
