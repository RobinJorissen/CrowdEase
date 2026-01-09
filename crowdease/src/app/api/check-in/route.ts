import { NextRequest, NextResponse } from 'next/server';
import { haversineDistance } from '@/lib/location/distance';
import { getStoreById } from '@/lib/stores/storeService';

const CHECK_IN_RANGE_METERS = 100;
const POINTS_PER_CHECKIN = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, location } = body;

    // Validate required fields
    if (!storeId || !location || !location.lat || !location.lng) {
      return NextResponse.json(
        {
          success: false,
          error: 'GPS-locatie is vereist voor check-in',
          errorCode: 'GPS_REQUIRED',
        },
        { status: 400 }
      );
    }

    // Get store coordinates
    const store = getStoreById(storeId);
    if (!store) {
      return NextResponse.json(
        {
          success: false,
          error: 'Winkel niet gevonden',
          errorCode: 'STORE_NOT_FOUND',
          storeId,
        },
        { status: 404 }
      );
    }

    // Calculate distance
    const distance = haversineDistance(
      location.lat,
      location.lng,
      store.coordinates.lat,
      store.coordinates.lng
    );

    // Check range
    if (distance > CHECK_IN_RANGE_METERS) {
      return NextResponse.json(
        {
          success: false,
          error: `Je bent te ver van de winkel (${Math.round(
            distance
          )}m). Kom dichterbij om in te checken.`,
          errorCode: 'OUT_OF_RANGE',
          distance: Math.round(distance),
          requiredRange: CHECK_IN_RANGE_METERS,
        },
        { status: 400 }
      );
    }

    // Return success with mock data
    // (Client handles cooldown and points via localStorage)
    const checkIn = {
      id: `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      storeId,
      timestamp: Date.now(),
      points: POINTS_PER_CHECKIN,
    };

    return NextResponse.json({
      success: true,
      pointsEarned: POINTS_PER_CHECKIN,
      message: `Check-in succesvol! +${POINTS_PER_CHECKIN} punten`,
      checkIn,
      userPoints: {
        total: 0, // Client will update from localStorage
        totalEarned: 0,
      },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Er ging iets mis bij het inchecken',
        errorCode: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
