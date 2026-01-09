export interface Store {
  id: string;
  name: string;
  type: StoreType;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  openingHours: {
    [day: number]: {
      open: string;
      close: string;
    } | null;
  } | null;
}

export enum StoreType {
  SUPERMARKT = 'supermarkt',
  APOTHEEK = 'apotheek',
  DROGISTERIJ = 'drogisterij',
  BAKKERIJ = 'bakkerij',
  SLAGERIJ = 'slagerij',
  NACHTWINKEL = 'nachtwinkel',
}
