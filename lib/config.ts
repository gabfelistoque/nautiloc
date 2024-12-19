export const config = {
  openWeatherMap: {
    apiKey: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  },
  openMeteo: {
    baseUrl: 'https://marine-api.open-meteo.com/v1/marine',
  },
  defaultLocation: {
    lat: -23.82, // Ilhabela
    lng: -45.42,
    city: 'Ilhabela',
  },
};
