import axios from 'axios';
import { format, addDays, parseISO, differenceInDays } from 'date-fns';
import type {
  WeatherData,
  HourlyForecast,
  WeatherCondition,
  HistoricalWeather,
} from '../types';

// ─── Configuration ──────────────────────────────────────────

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';
const API_BASE = 'https://api.weatherapi.com/v1';

// If no API key, auto-use mock data
const USE_MOCK = !API_KEY || API_KEY === 'your_weatherapi_com_key';

// ─── Condition Presets ──────────────────────────────────────

const CONDITIONS: WeatherCondition[] = [
  { text: 'Sunny',          icon: '☀️', code: 1000 },
  { text: 'Partly Cloudy',  icon: '⛅', code: 1003 },
  { text: 'Cloudy',         icon: '☁️', code: 1006 },
  { text: 'Overcast',       icon: '🌥️', code: 1009 },
  { text: 'Light Rain',     icon: '🌦️', code: 1150 },
  { text: 'Moderate Rain',  icon: '🌧️', code: 1189 },
  { text: 'Heavy Rain',     icon: '⛈️', code: 1195 },
  { text: 'Thunderstorm',   icon: '🌩️', code: 1273 },
  { text: 'Light Snow',     icon: '🌨️', code: 1213 },
  { text: 'Fog',            icon: '🌫️', code: 1135 },
];

function pickCondition(rain: number, temp: number): WeatherCondition {
  if (rain > 5)  return CONDITIONS[6]; // Heavy Rain
  if (rain > 3)  return CONDITIONS[5]; // Moderate Rain
  if (rain > 1)  return CONDITIONS[4]; // Light Rain
  if (temp < 2)  return CONDITIONS[8]; // Light Snow
  if (Math.random() > 0.7) return CONDITIONS[2]; // Cloudy
  if (Math.random() > 0.5) return CONDITIONS[1]; // Partly Cloudy
  return CONDITIONS[0]; // Sunny
}

// ─── Generate Hourly Data ───────────────────────────────────

function generateHourly(
  dateStr: string,
  baseTempC: number,
  baseHumidity: number,
  dailyRainMm: number,
  baseWindKph: number
): HourlyForecast[] {
  const hours: HourlyForecast[] = [];

  for (let h = 0; h < 24; h++) {
    // Realistic temperature curve: cooler at night, warmer midday
    const hourOffset = Math.sin(((h - 6) / 24) * Math.PI * 2) * 4;
    const temp = Math.round((baseTempC + hourOffset + (Math.random() * 2 - 1)) * 10) / 10;
    const feelsLike = Math.round((temp - 1 - Math.random()) * 10) / 10;

    // Rain more likely in afternoon
    const rainChance = Math.min(100, Math.max(0,
      Math.round((dailyRainMm / 6) * 100 * (h >= 12 && h <= 18 ? 1.5 : 0.5) + (Math.random() * 20 - 10))
    ));
    const precip = Math.round((dailyRainMm / 24 * (h >= 12 && h <= 18 ? 2 : 0.5) + Math.random() * 0.3) * 100) / 100;

    const humidity = Math.min(100, Math.max(20,
      Math.round(baseHumidity + (h < 6 ? 10 : h > 18 ? 8 : -5) + (Math.random() * 10 - 5))
    ));

    const wind = Math.round((baseWindKph + (Math.random() * 8 - 4)) * 10) / 10;
    const cloud = Math.min(100, Math.max(0, Math.round(dailyRainMm * 15 + Math.random() * 20)));

    hours.push({
      time: `${String(h).padStart(2, '0')}:00`,
      temp_c: temp,
      feelslike_c: feelsLike,
      humidity,
      precip_mm: Math.max(0, precip),
      wind_kph: Math.max(0, wind),
      cloud,
      chance_of_rain: rainChance,
      condition: pickCondition(precip, temp),
      uv: h >= 6 && h <= 18 ? Math.round(Math.random() * 8 + 2) : 0,
    });
  }

  return hours;
}

// ─── Generate Mock Daily Data ───────────────────────────────

function generateMockForecast(
  location: string,
  startDate: string,
  endDate: string
): WeatherData[] {
  const days = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
  const clampedDays = Math.max(1, Math.min(days, 14));

  // Location-based temperature baseline (simple hash)
  const hash = location.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const baseTempOffset = (hash % 20) - 5; // -5 to +15

  return Array.from({ length: clampedDays }, (_, i) => {
    const dateStr = format(addDays(parseISO(startDate), i), 'yyyy-MM-dd');

    const baseTemp = 22 + baseTempOffset + Math.random() * 8;
    const minTemp = Math.round((baseTemp - 3 - Math.random() * 2) * 10) / 10;
    const maxTemp = Math.round((baseTemp + 3 + Math.random() * 2) * 10) / 10;
    const avgTemp = Math.round(((minTemp + maxTemp) / 2) * 10) / 10;
    const humidity = Math.round(40 + Math.random() * 45);
    const wind = Math.round((5 + Math.random() * 20) * 10) / 10;
    const rain = Math.round(Math.random() * 6 * 100) / 100;

    const condition = pickCondition(rain, avgTemp);
    const hourly = generateHourly(dateStr, avgTemp, humidity, rain, wind);

    return {
      date: dateStr,
      temp_c: avgTemp,
      temp_f: Math.round((avgTemp * 9 / 5 + 32) * 10) / 10,
      mintemp_c: minTemp,
      maxtemp_c: maxTemp,
      feelslike_c: Math.round((avgTemp - 1) * 10) / 10,
      condition,
      wind_kph: wind,
      wind_mph: Math.round(wind * 0.621 * 10) / 10,
      precip_mm: rain,
      precip_in: Math.round(rain * 0.0394 * 100) / 100,
      humidity,
      cloud: Math.min(100, Math.round(rain * 15 + Math.random() * 20)),
      uv: Math.round(Math.random() * 8 + 2),
      sunrise: '06:15 AM',
      sunset: '06:45 PM',
      hourly,
    };
  });
}

// ─── Generate Historical (last year) Mock Data ──────────────

export function generateHistoricalData(
  location: string,
  startDate: string,
  endDate: string
): HistoricalWeather[] {
  const days = Math.max(1, differenceInDays(parseISO(endDate), parseISO(startDate)) + 1);
  const clampedDays = Math.min(days, 14);
  const hash = location.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const baseTempOffset = (hash % 18) - 4;

  return Array.from({ length: clampedDays }, (_, i) => {
    const origDate = addDays(parseISO(startDate), i);
    const lastYearDate = new Date(origDate);
    lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);

    const temp = Math.round((20 + baseTempOffset + Math.random() * 10) * 10) / 10;
    const rain = Math.round(Math.random() * 5 * 100) / 100;

    return {
      date: format(lastYearDate, 'yyyy-MM-dd'),
      temp_c: temp,
      humidity: Math.round(35 + Math.random() * 50),
      precip_mm: rain,
      wind_kph: Math.round((4 + Math.random() * 18) * 10) / 10,
      condition: pickCondition(rain, temp).text,
    };
  });
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Fetch weather forecast for a location and date range.
 * Uses mock data when no API key is configured.
 */
export async function getWeatherForecast(
  location: string,
  startDate: string,
  endDate: string
): Promise<WeatherData[]> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    return generateMockForecast(location, startDate, endDate);
  }

  try {
    const days = Math.min(
      differenceInDays(parseISO(endDate), parseISO(startDate)) + 1,
      10
    );

    const response = await axios.get(`${API_BASE}/forecast.json`, {
      params: { key: API_KEY, q: location, days, dt: startDate },
    });

    return response.data.forecast.forecastday.map((day: any) => ({
      date: day.date,
      temp_c: day.day.avgtemp_c,
      temp_f: day.day.avgtemp_f,
      mintemp_c: day.day.mintemp_c,
      maxtemp_c: day.day.maxtemp_c,
      feelslike_c: day.day.avgtemp_c - 1,
      condition: day.day.condition,
      wind_kph: day.day.maxwind_kph,
      wind_mph: day.day.maxwind_mph,
      precip_mm: day.day.totalprecip_mm,
      precip_in: day.day.totalprecip_in,
      humidity: day.day.avghumidity,
      cloud: 50,
      uv: day.day.uv,
      sunrise: day.astro?.sunrise || '06:00 AM',
      sunset: day.astro?.sunset || '06:00 PM',
      hourly: (day.hour || []).map((h: any) => ({
        time: format(new Date(h.time), 'HH:mm'),
        temp_c: h.temp_c,
        feelslike_c: h.feelslike_c,
        humidity: h.humidity,
        precip_mm: h.precip_mm,
        wind_kph: h.wind_kph,
        cloud: h.cloud,
        chance_of_rain: h.chance_of_rain,
        condition: h.condition,
        uv: h.uv,
      })),
    }));
  } catch (error) {
    console.error('Weather API error, falling back to mock data:', error);
    return generateMockForecast(location, startDate, endDate);
  }
}