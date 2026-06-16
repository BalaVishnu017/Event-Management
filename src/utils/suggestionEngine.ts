import type { WeatherData, EventType, RiskLevel } from '../types';

// ─── Indoor vs Outdoor Decision Engine ──────────────────────

export interface EventSuggestion {
  venueType: 'indoor' | 'outdoor' | 'covered-outdoor';
  reasoning: string;
  timeOfDay: string;
  alternativeIdeas: string[];
  weatherWarnings: string[];
}

export function getSmartSuggestion(
  weather: WeatherData,
  eventType: EventType,
  riskLevel: RiskLevel
): EventSuggestion {
  const warnings: string[] = [];
  const alternatives: string[] = [];
  let venueType: 'indoor' | 'outdoor' | 'covered-outdoor' = 'outdoor';
  let reasoning = '';
  let timeOfDay = 'Any time';

  // ── Venue Decision ──
  if (riskLevel === 'high') {
    venueType = 'indoor';
    reasoning = 'Weather conditions are unfavorable. Indoor venue strongly recommended.';
  } else if (weather.precip_mm > 2 || weather.wind_kph > 20) {
    venueType = 'covered-outdoor';
    reasoning = 'Possible precipitation or strong wind — a covered outdoor setup is ideal.';
  } else {
    venueType = 'outdoor';
    reasoning = 'Weather looks great for an outdoor setting!';
  }

  // Indoor events always stay indoor
  if (eventType === 'indoor' || eventType === 'business') {
    venueType = 'indoor';
    reasoning = 'Indoor venue selected as per event type.';
  }

  // ── Time-of-Day ──
  if (weather.temp_c > 33) {
    timeOfDay = 'Evening (after 5 PM)';
  } else if (weather.temp_c > 30) {
    timeOfDay = 'Morning (before 11 AM) or Evening (after 5 PM)';
  } else if (weather.temp_c < 8) {
    timeOfDay = 'Midday (11 AM - 3 PM) for warmest conditions';
  } else {
    timeOfDay = 'Flexible — weather is comfortable throughout the day';
  }

  // ── Warnings ──
  if (weather.precip_mm > 5) warnings.push('Heavy rain expected — waterproof setups essential');
  if (weather.wind_kph > 30) warnings.push('Strong gales — avoid balloons, canopies, and tall structures');
  if (weather.temp_c > 38) warnings.push('Extreme heat alert — mandatory hydration stations');
  if (weather.temp_c < 3) warnings.push('Near-freezing temps — heating required');
  if (weather.humidity > 90) warnings.push('Very high humidity — ventilation critical');
  if (weather.uv > 8) warnings.push('UV index very high — shade and sunscreen mandatory');

  // ── Alternative Ideas ──
  if (eventType === 'outdoor' && riskLevel === 'high') {
    alternatives.push('Move to an indoor venue with large windows for natural light');
    alternatives.push('Use a covered pavilion or marquee tent');
    alternatives.push('Reschedule to a lower-risk date');
  }
  if (eventType === 'wedding' && weather.precip_mm > 1) {
    alternatives.push('Prepare indoor ceremony backup');
    alternatives.push('Rent a transparent rain canopy for outdoor setup');
  }
  if (eventType === 'sports' && weather.temp_c > 35) {
    alternatives.push('Move to an air-conditioned indoor stadium');
    alternatives.push('Shift game to early morning (6 AM start)');
  }
  if (riskLevel === 'low') {
    alternatives.push('All setups are viable — maximize outdoor features!');
  }

  return { venueType, reasoning, timeOfDay, alternativeIdeas: alternatives, weatherWarnings: warnings };
}

// ─── Comfort Index (0-100) ──────────────────────────────────

export function calculateComfortIndex(weather: WeatherData): number {
  let score = 100;

  // Temperature comfort (ideal: 20-26°C)
  const tempDiff = Math.abs(weather.temp_c - 23);
  score -= Math.min(40, tempDiff * 3);

  // Humidity (ideal: 40-60%)
  const humDiff = weather.humidity > 60 ? weather.humidity - 60 : weather.humidity < 40 ? 40 - weather.humidity : 0;
  score -= Math.min(20, humDiff);

  // Wind (ideal: < 10 kph)
  if (weather.wind_kph > 10) score -= Math.min(20, (weather.wind_kph - 10) * 1.5);

  // Rain penalty
  score -= Math.min(20, weather.precip_mm * 5);

  return Math.max(0, Math.min(100, Math.round(score)));
}