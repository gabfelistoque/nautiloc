import { NextResponse } from 'next/server';
import { getWeatherData } from '@/lib/services/weatherService';

export async function GET() {
  try {
    const data = await getWeatherData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in weather API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

// Cache por 30 minutos
export const revalidate = 1800;
