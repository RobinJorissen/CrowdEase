import { UserLocation, LocationSource } from '@/types/location';

// Development fallback location (Gent Centrum)
const DEV_FALLBACK_LOCATION = {
  lat: 51.0543,
  lng: 3.7174,
  accuracy: 100,
  timestamp: Date.now(),
  source: LocationSource.GPS,
};

export async function getCurrentLocation(): Promise<UserLocation | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    console.error('❌ Geolocation not supported');
    return null;
  }

  return new Promise((resolve) => {
    // Try with lower accuracy first (faster)
    navigator.geolocation.getCurrentPosition(
      (position) => {

        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
          source: LocationSource.GPS,
        });
      },
      (error) => {
        console.error('❌ Geolocation error:', error.code, error.message);

        const isDevelopment =
          window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (error.code === 1) {
          console.error('Permission denied - gebruiker heeft locatie geweigerd');
          if (!isDevelopment) {
            alert('Geef toestemming voor locatietoegang in je browser instellingen');
          }
        } else if (error.code === 2) {
          console.error('Position unavailable - locatie niet beschikbaar');
        } else if (error.code === 3) {
          console.error('Timeout - probeer watchPosition als fallback');

          // In development, use fallback location immediately
          if (isDevelopment) {
            resolve(DEV_FALLBACK_LOCATION);
            return;
          }

          // Fallback to watchPosition which is sometimes more reliable
          const watchId = navigator.geolocation.watchPosition(
            (position) => {
              navigator.geolocation.clearWatch(watchId);

              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: Date.now(),
                source: LocationSource.GPS,
              });
            },
            () => {
              navigator.geolocation.clearWatch(watchId);
              console.error('❌ WatchPosition also failed');
              resolve(null);
            },
            { enableHighAccuracy: false, maximumAge: 60000 }
          );
          return;
        }

        // In development, always provide fallback
        if (isDevelopment) {
          resolve(DEV_FALLBACK_LOCATION);
        } else {
          resolve(null);
        }
      },
      { timeout: 5000, maximumAge: 60000, enableHighAccuracy: false }
    );
  });
}
