import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Missing address', message: 'Address parameter is required' },
      { status: 400 }
    );
  }

  try {
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
    nominatimUrl.searchParams.set('q', address);
    nominatimUrl.searchParams.set('format', 'json');
    nominatimUrl.searchParams.set('limit', '1');
    nominatimUrl.searchParams.set('countrycodes', 'be');

    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'CrowdEase/1.0',
      },
    });

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error: 'Address not found',
          message: 'Adres niet gevonden. Probeer een ander adres of postcode.',
        },
        { status: 404 }
      );
    }

    const result = data[0];

    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400));

    return NextResponse.json({
      success: true,
      result: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
        confidence: parseFloat(result.importance ?? 0.5),
      },
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      {
        error: 'Geocoding service unavailable',
        message: 'Kan adres momenteel niet opzoeken. Probeer later opnieuw.',
      },
      { status: 503 }
    );
  }
}
