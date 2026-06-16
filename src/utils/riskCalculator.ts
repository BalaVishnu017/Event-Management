import type { WeatherData, EventType, DateRisk, RiskLevel } from '../types';

// ─── Event-type-specific risk weights ───────────────────────

interface RiskWeights {
  rain: number;
  wind: number;
  tempLow: number;
  tempHigh: number;
  humidity: number;
  cloud: number;
  uvHigh: number;
}

const WEIGHTS: Record<EventType, RiskWeights> = {
  outdoor:  { rain: 30, wind: 25, tempLow: 15, tempHigh: 20, humidity: 10, cloud: 5, uvHigh: 5 },
  wedding:  { rain: 35, wind: 25, tempLow: 10, tempHigh: 15, humidity: 5,  cloud: 10, uvHigh: 0 },
  sports:   { rain: 25, wind: 20, tempLow: 20, tempHigh: 25, humidity: 5,  cloud: 0, uvHigh: 5 },
  party:    { rain: 20, wind: 15, tempLow: 15, tempHigh: 10, humidity: 5,  cloud: 5, uvHigh: 0 },
  indoor:   { rain: 10, wind: 5,  tempLow: 10, tempHigh: 5,  humidity: 0,  cloud: 0, uvHigh: 0 },
  business: { rain: 15, wind: 10, tempLow: 10, tempHigh: 5,  humidity: 0,  cloud: 0, uvHigh: 0 },
  other:    { rain: 20, wind: 15, tempLow: 15, tempHigh: 15, humidity: 5,  cloud: 5, uvHigh: 0 },
};

// ─── Thresholds ─────────────────────────────────────────────

function rainScore(mm: number, weight: number): number {
  if (mm > 4)   return weight;
  if (mm > 2)   return weight * 0.7;
  if (mm > 0.5) return weight * 0.4;
  return 0;
}

function windScore(kph: number, weight: number): number {
  if (kph > 30) return weight;
  if (kph > 20) return weight * 0.7;
  if (kph > 12) return weight * 0.3;
  return 0;
}

function tempLowScore(c: number, weight: number): number {
  if (c < 5)  return weight;
  if (c < 12) return weight * 0.5;
  return 0;
}

function tempHighScore(c: number, weight: number): number {
  if (c > 38) return weight;
  if (c > 33) return weight * 0.7;
  if (c > 30) return weight * 0.3;
  return 0;
}

function humidityScore(h: number, weight: number): number {
  if (h > 90) return weight;
  if (h > 80) return weight * 0.6;
  if (h > 70) return weight * 0.2;
  return 0;
}

function cloudScore(c: number, weight: number): number {
  return c > 80 ? weight : c > 60 ? weight * 0.4 : 0;
}

function uvScore(uv: number, weight: number): number {
  return uv > 9 ? weight : uv > 7 ? weight * 0.5 : 0;
}

// ─── Main Calculator ────────────────────────────────────────

export function calculateRisk(weather: WeatherData, eventType: EventType): DateRisk {
  const w = WEIGHTS[eventType] || WEIGHTS.other;

  let score = 0;
  score += rainScore(weather.precip_mm, w.rain);
  score += windScore(weather.wind_kph, w.wind);
  score += tempLowScore(weather.temp_c, w.tempLow);
  score += tempHighScore(weather.temp_c, w.tempHigh);
  score += humidityScore(weather.humidity, w.humidity);
  score += cloudScore(weather.cloud, w.cloud);
  score += uvScore(weather.uv, w.uvHigh);

  // Clamp 0-100
  const riskScore = Math.min(100, Math.max(0, Math.round(score)));

  // Level
  let riskLevel: RiskLevel;
  if (riskScore < 30)      riskLevel = 'low';
  else if (riskScore < 60) riskLevel = 'moderate';
  else                     riskLevel = 'high';

  // Summary
  const summaryParts: string[] = [];
  if (riskLevel === 'low') {
    summaryParts.push(`Great conditions for your ${eventType} event!`);
    summaryParts.push(`${weather.condition.text}, ${weather.temp_c}°C.`);
  } else if (riskLevel === 'moderate') {
    summaryParts.push(`Some concerns for your ${eventType} event.`);
    if (weather.precip_mm > 0.5) summaryParts.push(`Possible rain (${weather.precip_mm}mm).`);
    if (weather.wind_kph > 12) summaryParts.push(`Wind ${weather.wind_kph} km/h.`);
  } else {
    summaryParts.push(`High risk for your ${eventType} event!`);
    if (weather.precip_mm > 2) summaryParts.push(`Heavy rain expected (${weather.precip_mm}mm).`);
    if (weather.wind_kph > 20) summaryParts.push(`Strong winds (${weather.wind_kph} km/h).`);
    if (weather.temp_c > 35) summaryParts.push(`Extreme heat (${weather.temp_c}°C).`);
  }

  // Suggestions
  const suggestions = generateSuggestions(weather, eventType, riskLevel);

  return {
    date: weather.date,
    riskScore,
    riskLevel,
    weatherData: weather,
    summary: summaryParts.join(' '),
    suggestions,
  };
}

// ─── Suggestion Generator ───────────────────────────────────

function generateSuggestions(
  weather: WeatherData,
  eventType: EventType,
  riskLevel: RiskLevel
): string[] {
  const suggestions: string[] = [];

  if (riskLevel === 'high' && (eventType === 'outdoor' || eventType === 'wedding' || eventType === 'sports')) {
    suggestions.push('Consider moving the event indoors or rescheduling.');
  }

  if (weather.precip_mm > 3) {
    suggestions.push('Arrange covered areas or tents for rain protection.');
    if (eventType === 'wedding') suggestions.push('Have an indoor backup venue ready.');
  } else if (weather.precip_mm > 1) {
    suggestions.push('Keep umbrellas and rain covers available.');
  }

  if (weather.wind_kph > 25) {
    suggestions.push('Avoid tall decorations and lightweight setups.');
    if (eventType === 'sports') suggestions.push('Wind may affect ball trajectory — adjust game plan.');
  }

  if (weather.temp_c > 33) {
    suggestions.push('Provide ample shade, hydration stations, and cooling fans.');
    suggestions.push('Consider shifting to evening hours (after 4 PM).');
  } else if (weather.temp_c < 10) {
    suggestions.push('Arrange heating, warm drinks, and blankets for guests.');
  }

  if (weather.humidity > 85) {
    suggestions.push('High humidity — ensure good ventilation and cool beverages.');
  }

  if (weather.uv > 8) {
    suggestions.push('High UV index — provide sunscreen and shaded seating.');
  }

  if (riskLevel === 'low') {
    suggestions.push('Perfect conditions — enjoy your event!');
  }

  return suggestions;
}

// ─── Find Best Time Slot ────────────────────────────────────

export function findBestTimeSlot(weather: WeatherData): string {
  if (!weather.hourly || weather.hourly.length === 0) return 'Morning (6 AM - 12 PM)';

  const slots = [
    { name: 'Early Morning (6 AM - 9 AM)',  start: 6,  end: 9 },
    { name: 'Morning (9 AM - 12 PM)',       start: 9,  end: 12 },
    { name: 'Afternoon (12 PM - 3 PM)',     start: 12, end: 15 },
    { name: 'Late Afternoon (3 PM - 6 PM)', start: 15, end: 18 },
    { name: 'Evening (6 PM - 9 PM)',        start: 18, end: 21 },
  ];

  let bestSlot = slots[0];
  let bestScore = Infinity;

  for (const slot of slots) {
    const slotHours = weather.hourly.filter(h => {
      const hour = parseInt(h.time.split(':')[0]);
      return hour >= slot.start && hour < slot.end;
    });

    if (slotHours.length === 0) continue;

    const avgRain = slotHours.reduce((s, h) => s + h.chance_of_rain, 0) / slotHours.length;
    const avgWind = slotHours.reduce((s, h) => s + h.wind_kph, 0) / slotHours.length;
    const avgTemp = slotHours.reduce((s, h) => s + h.temp_c, 0) / slotHours.length;

    // Prefer moderate temps (20-28°C), low rain, low wind
    const tempPenalty = Math.abs(avgTemp - 24) * 2;
    const score = avgRain * 0.5 + avgWind * 0.3 + tempPenalty;

    if (score < bestScore) {
      bestScore = score;
      bestSlot = slot;
    }
  }

  return bestSlot.name;
}

// ─── Rank Dates for Recommendations ─────────────────────────

export function rankDates(
  weatherData: WeatherData[],
  eventType: EventType
): DateRisk[] {
  const risks = weatherData.map(w => calculateRisk(w, eventType));
  return risks.sort((a, b) => a.riskScore - b.riskScore);
}