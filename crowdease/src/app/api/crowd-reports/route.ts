import { NextRequest, NextResponse } from 'next/server';
import { CrowdLevel } from '@/types/crowd';

interface CrowdReportRequest {
  storeId: string;
  level: CrowdLevel;
  location: {
    lat: number;
    lng: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: CrowdReportRequest = await req.json();

    // Validate required fields
    if (!body.storeId || !body.level || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields: storeId, level, location' },
        { status: 400 }
      );
    }

    // Validate level is a valid enum value
    const validLevels = [CrowdLevel.RUSTIG, CrowdLevel.MATIG, CrowdLevel.DRUK];
    if (!validLevels.includes(body.level)) {
      return NextResponse.json(
        { error: 'Invalid crowd level. Must be rustig, matig, or druk' },
        { status: 400 }
      );
    }

    // Validate coordinates
    const { lat, lng } = body.location;
    if (
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180' },
        { status: 400 }
      );
    }

    // Create crowd report
    const timestamp = Date.now();
    const report = {
      storeId: body.storeId,
      crowdLevel: body.level,
      timestamp,
      reportWeight: 1.0 as const,
      dayOfWeek: new Date(timestamp).getDay(),
      hourOfDay: new Date(timestamp).getHours(),
    };

    // In a real app, this would be saved to a database
    // For now, we return the report and client will save to localStorage
    // The report will be used for 30 minutes before falling back to historical patterns

    return NextResponse.json({
      success: true,
      report,
      message: 'Drukte succesvol gemeld',
    });
  } catch (error) {
    console.error('Error processing crowd report:', error);
    return NextResponse.json({ error: 'Failed to process crowd report' }, { status: 500 });
  }
}
