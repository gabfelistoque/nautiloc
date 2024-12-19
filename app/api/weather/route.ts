import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat') || '-23.8168'; // Default: Ilhabela
  const lon = searchParams.get('lon') || '-45.3742';

  try {
    // OpenWeather API
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`
    );
    const weatherData = await weatherResponse.json();

    // OpenMeteo API for wave height
    const meteoResponse = await fetch(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height`
    );
    const meteoData = await meteoResponse.json();

    // Get current wave height
    const currentHour = new Date().getHours();
    const waveHeight = meteoData.hourly.wave_height[currentHour];

    return NextResponse.json({
      temperature: weatherData.main.temp,
      windSpeed: weatherData.wind.speed * 3.6, // Convert m/s to km/h
      waveHeight,
      weatherCondition: weatherData.weather[0].main,
      windDirection: weatherData.wind.deg,
      humidity: weatherData.main.humidity,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

// Cache por 30 minutos
export const revalidate = 1800;
