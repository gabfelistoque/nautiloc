import { config } from '../config';

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  waveHeight: number;
  weatherCondition: string;
  windDirection: number;
  humidity: number;
  timestamp: number;
}

async function fetchOpenWeatherMap() {
  const { lat, lng } = config.defaultLocation;
  const url = `${config.openWeatherMap.baseUrl}/weather?lat=${lat}&lon=${lng}&appid=${config.openWeatherMap.apiKey}&units=metric`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenWeatherMap Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function fetchMarineData() {
  const { lat, lng } = config.defaultLocation;
  const url = `${config.openMeteo.baseUrl}?latitude=${lat}&longitude=${lng}&hourly=wave_height`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenMeteo Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function getWeatherData(): Promise<WeatherData> {
  const [weatherData, marineData] = await Promise.all([
    fetchOpenWeatherMap(),
    fetchMarineData()
  ]);

  // Pega a altura da onda atual (primeiro valor do array)
  const currentWaveHeight = marineData.hourly.wave_height[0];

  return {
    temperature: weatherData.main.temp,
    windSpeed: weatherData.wind.speed,
    waveHeight: currentWaveHeight,
    weatherCondition: weatherData.weather[0].main.toLowerCase(),
    windDirection: weatherData.wind.deg,
    humidity: weatherData.main.humidity,
    timestamp: Date.now(),
  };
}
