const axios = require('axios');

const API_KEY = process.env.WEATHER_API_KEY || '';
const API_BASE = 'https://api.weatherapi.com/v1';
const USE_MOCK = !API_KEY || API_KEY === 'your_weatherapi_com_key';

// ─── Condition Presets ──────────────────────────────────────

const CONDITIONS = [
  { text: 'Sunny',          icon: '☀️', code: 1000 },
  { text: 'Partly Cloudy',  icon: '⛅', code: 1003 },
  { text: 'Cloudy',         icon: '☁️', code: 1006 },
  { text: 'Overcast',       icon: '🌥️', code: 1009 },
  { text: 'Light Rain',     icon: '🌦️', code: 1150 },
  { text: 'Moderate Rain',  icon: '🌧️', code: 1189 },
  { text: 'Heavy Rain',     icon: '⛈️', code: 1195 },
];

function pickCondition(rain, temp) {
  if (rain > 5)  return CONDITIONS[6];
  if (rain > 3)  return CONDITIONS[5];
  if (rain > 1)  return CONDITIONS[4];
  if (Math.random() > 0.7) return CONDITIONS[2];
  if (Math.random() > 0.5) return CONDITIONS[1];
  return CONDITIONS[0];
}

// ─── Mock Data Generators ───────────────────────────────────

function generateHourly(baseTempC, baseHumidity, dailyRainMm, baseWindKph) {
  const hours = [];
  for (let h = 0; h < 24; h++) {
    const hourOffset = Math.sin(((h - 6) / 24) * Math.PI * 2) * 4;
    const temp = Math.round((baseTempC + hourOffset + (Math.random() * 2 - 1)) * 10) / 10;
    const rainChance = Math.min(100, Math.max(0,
      Math.round((dailyRainMm / 6) * 100 * (h >= 12 && h <= 18 ? 1.5 : 0.5) + (Math.random() * 20 - 10))
    ));
    const precip = Math.round((dailyRainMm / 24 * (h >= 12 && h <= 18 ? 2 : 0.5) + Math.random() * 0.3) * 100) / 100;
    const humidity = Math.min(100, Math.max(20,
      Math.round(baseHumidity + (h < 6 ? 10 : h > 18 ? 8 : -5) + (Math.random() * 10 - 5))
    ));
    const wind = Math.round((baseWindKph + (Math.random() * 8 - 4)) * 10) / 10;

    hours.push({
      time: `${String(h).padStart(2, '0')}:00`,
      temp_c: temp,
      feelslike_c: Math.round((temp - 1 - Math.random()) * 10) / 10,
      humidity,
      precip_mm: Math.max(0, precip),
      wind_kph: Math.max(0, wind),
      cloud: Math.min(100, Math.max(0, Math.round(dailyRainMm * 15 + Math.random() * 20))),
      chance_of_rain: rainChance,
      condition: pickCondition(precip, temp),
      uv: h >= 6 && h <= 18 ? Math.round(Math.random() * 8 + 2) : 0,
    });
  }
  return hours;
}

function generateMockForecast(location, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(1, Math.min(Math.ceil((end - start) / 86400000) + 1, 14));

  const hash = location.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const baseTempOffset = (hash % 20) - 5;

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    const baseTemp = 22 + baseTempOffset + Math.random() * 8;
    const minTemp = Math.round((baseTemp - 3 - Math.random() * 2) * 10) / 10;
    const maxTemp = Math.round((baseTemp + 3 + Math.random() * 2) * 10) / 10;
    const avgTemp = Math.round(((minTemp + maxTemp) / 2) * 10) / 10;
    const humidity = Math.round(40 + Math.random() * 45);
    const wind = Math.round((5 + Math.random() * 20) * 10) / 10;
    const rain = Math.round(Math.random() * 6 * 100) / 100;

    return {
      date: dateStr,
      temp_c: avgTemp,
      temp_f: Math.round((avgTemp * 9 / 5 + 32) * 10) / 10,
      mintemp_c: minTemp,
      maxtemp_c: maxTemp,
      feelslike_c: Math.round((avgTemp - 1) * 10) / 10,
      condition: pickCondition(rain, avgTemp),
      wind_kph: wind,
      wind_mph: Math.round(wind * 0.621 * 10) / 10,
      precip_mm: rain,
      precip_in: Math.round(rain * 0.0394 * 100) / 100,
      humidity,
      cloud: Math.min(100, Math.round(rain * 15 + Math.random() * 20)),
      uv: Math.round(Math.random() * 8 + 2),
      sunrise: '06:15 AM',
      sunset: '06:45 PM',
      hourly: generateHourly(avgTemp, humidity, rain, wind),
    };
  });
}

function generateHistoricalData(location, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(1, Math.min(Math.ceil((end - start) / 86400000) + 1, 14));
  const hash = location.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const baseTempOffset = (hash % 18) - 4;

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    d.setFullYear(d.getFullYear() - 1);

    const temp = Math.round((20 + baseTempOffset + Math.random() * 10) * 10) / 10;
    const rain = Math.round(Math.random() * 5 * 100) / 100;

    return {
      date: d.toISOString().split('T')[0],
      temp_c: temp,
      humidity: Math.round(35 + Math.random() * 50),
      precip_mm: rain,
      wind_kph: Math.round((4 + Math.random() * 18) * 10) / 10,
      condition: pickCondition(rain, temp).text,
    };
  });
}

// ─── Risk Calculator (Server-Side) ──────────────────────────

const RISK_WEIGHTS = {
  outdoor:  { rain: 30, wind: 25, tempLow: 15, tempHigh: 20, humidity: 10 },
  wedding:  { rain: 35, wind: 25, tempLow: 10, tempHigh: 15, humidity: 5 },
  sports:   { rain: 25, wind: 20, tempLow: 20, tempHigh: 25, humidity: 5 },
  party:    { rain: 20, wind: 15, tempLow: 15, tempHigh: 10, humidity: 5 },
  indoor:   { rain: 10, wind: 5,  tempLow: 10, tempHigh: 5,  humidity: 0 },
  business: { rain: 15, wind: 10, tempLow: 10, tempHigh: 5,  humidity: 0 },
  other:    { rain: 20, wind: 15, tempLow: 15, tempHigh: 15, humidity: 5 },
};

function calculateRisk(weather, eventType) {
  const w = RISK_WEIGHTS[eventType] || RISK_WEIGHTS.other;
  let score = 0;

  // Rain
  if (weather.precip_mm > 4) score += w.rain;
  else if (weather.precip_mm > 2) score += w.rain * 0.7;
  else if (weather.precip_mm > 0.5) score += w.rain * 0.4;

  // Wind
  if (weather.wind_kph > 30) score += w.wind;
  else if (weather.wind_kph > 20) score += w.wind * 0.7;
  else if (weather.wind_kph > 12) score += w.wind * 0.3;

  // Temperature
  if (weather.temp_c < 5) score += w.tempLow;
  else if (weather.temp_c < 12) score += w.tempLow * 0.5;

  if (weather.temp_c > 38) score += w.tempHigh;
  else if (weather.temp_c > 33) score += w.tempHigh * 0.7;
  else if (weather.temp_c > 30) score += w.tempHigh * 0.3;

  // Humidity
  if (weather.humidity > 90) score += w.humidity;
  else if (weather.humidity > 80) score += w.humidity * 0.6;

  const riskScore = Math.min(100, Math.max(0, Math.round(score)));
  const riskLevel = riskScore < 30 ? 'low' : riskScore < 60 ? 'moderate' : 'high';

  let summary = '';
  if (riskLevel === 'low') summary = `Great conditions for ${eventType}! ${weather.condition.text}, ${weather.temp_c}°C.`;
  else if (riskLevel === 'moderate') summary = `Some concerns: ${weather.condition.text}, rain ${weather.precip_mm}mm, wind ${weather.wind_kph}km/h.`;
  else summary = `High risk! ${weather.condition.text}, heavy weather expected.`;

  const suggestions = [];
  if (weather.precip_mm > 3) suggestions.push('Arrange rain protection/tents');
  if (weather.wind_kph > 25) suggestions.push('Avoid tall decorations');
  if (weather.temp_c > 33) suggestions.push('Provide shade and hydration');
  if (weather.temp_c < 10) suggestions.push('Arrange heating');
  if (riskLevel === 'low') suggestions.push('Perfect conditions — enjoy!');

  return {
    date: weather.date,
    riskScore,
    riskLevel,
    summary,
    suggestions,
    weatherData: weather,
  };
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Analyze weather for an event and return enriched data
 */
exports.analyzeEventWeather = async (event) => {
  let weatherData;

  if (USE_MOCK) {
    weatherData = generateMockForecast(event.location, event.startDateRange, event.endDateRange);
  } else {
    try {
      const start = new Date(event.startDateRange);
      const end = new Date(event.endDateRange);
      const days = Math.min(Math.ceil((end - start) / 86400000) + 1, 10);

      const response = await axios.get(`${API_BASE}/forecast.json`, {
        params: {
          key: API_KEY,
          q: event.location,
          days,
          dt: event.startDateRange,
        },
      });

      weatherData = response.data.forecast.forecastday.map((day) => ({
        date: day.date,
        temp_c: day.day.avgtemp_c,
        temp_f: day.day.avgtemp_f,
        mintemp_c: day.day.mintemp_c,
        maxtemp_c: day.day.maxtemp_c,
        feelslike_c: day.hour && day.hour.length > 0
          ? Math.round((day.hour.reduce((s, h) => s + h.feelslike_c, 0) / day.hour.length) * 10) / 10
          : Math.round((day.day.avgtemp_c - 1) * 10) / 10,
        condition: day.day.condition,
        wind_kph: day.day.maxwind_kph,
        wind_mph: day.day.maxwind_mph,
        precip_mm: day.day.totalprecip_mm,
        precip_in: day.day.totalprecip_in,
        humidity: day.day.avghumidity,
        cloud: day.hour && day.hour.length > 0
          ? Math.round(day.hour.reduce((s, h) => s + h.cloud, 0) / day.hour.length)
          : 50,
        uv: day.day.uv,
        sunrise: day.astro?.sunrise || '06:00 AM',
        sunset: day.astro?.sunset || '06:00 PM',
        hourly: (day.hour || []).map((h) => ({
          time: new Date(h.time).toTimeString().slice(0, 5),
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
      console.error('Weather API error, using mock data:', error.message);
      weatherData = generateMockForecast(event.location, event.startDateRange, event.endDateRange);
    }
  }

  // Calculate risks for each date
  const recommendations = weatherData
    .map((w) => calculateRisk(w, event.type))
    .sort((a, b) => a.riskScore - b.riskScore);

  // Historical data
  const historicalData = generateHistoricalData(event.location, event.startDateRange, event.endDateRange);

  // Best date
  const best = recommendations[0];

  return {
    weatherData,
    recommendations,
    historicalData,
    bestDate: best?.date || '',
    overallRiskScore: best?.riskScore || 0,
    overallRiskLevel: best?.riskLevel || '',
  };
};

/**
 * Get forecast for a location (direct API)
 */
exports.getWeatherForecast = async (location, days = 5) => {
  if (USE_MOCK) {
    const today = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setDate(end.getDate() + days - 1);
    return generateMockForecast(location, today, end.toISOString().split('T')[0]);
  }

  const response = await axios.get(`${API_BASE}/forecast.json`, {
    params: { key: API_KEY, q: location, days },
  });

  return response.data.forecast.forecastday;
};
