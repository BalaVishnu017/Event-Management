// ─── Event Types ────────────────────────────────────────────

export type EventType =
  | 'outdoor'
  | 'indoor'
  | 'wedding'
  | 'party'
  | 'sports'
  | 'business'
  | 'other';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type RiskLevel = 'low' | 'moderate' | 'high';

// ─── User ───────────────────────────────────────────────────

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

// ─── Weather ────────────────────────────────────────────────

export interface HourlyForecast {
  time: string;          // "00:00", "01:00" … "23:00"
  temp_c: number;
  feelslike_c: number;
  humidity: number;
  precip_mm: number;
  wind_kph: number;
  cloud: number;
  chance_of_rain: number;  // 0-100
  condition: WeatherCondition;
  uv: number;
}

export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface WeatherData {
  date: string;            // "YYYY-MM-DD"
  temp_c: number;
  temp_f: number;
  mintemp_c: number;
  maxtemp_c: number;
  feelslike_c: number;
  condition: WeatherCondition;
  wind_kph: number;
  wind_mph: number;
  precip_mm: number;
  precip_in: number;
  humidity: number;
  cloud: number;
  uv: number;
  sunrise: string;
  sunset: string;
  hourly: HourlyForecast[];
}

export interface HistoricalWeather {
  date: string;
  temp_c: number;
  humidity: number;
  precip_mm: number;
  wind_kph: number;
  condition: string;
}

// ─── Risk & Recommendations ────────────────────────────────

export interface DateRisk {
  date: string;
  riskScore: number;       // 0-100
  riskLevel: RiskLevel;
  weatherData: WeatherData;
  summary: string;
  suggestions: string[];
}

export interface Recommendation {
  date: string;
  rank: number;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  bestTimeSlot: string;      // "Morning (6 AM - 12 PM)"
  weatherHighlights: string[];
}

// ─── Event ──────────────────────────────────────────────────

export interface Event {
  id: string;
  userId?: string;
  name: string;
  type: EventType;
  location: string;
  startDateRange: string;   // "YYYY-MM-DD"
  endDateRange: string;
  duration: number;          // hours
  description?: string;
  expectedAttendees?: number;
  preferIndoor?: boolean;
  status: EventStatus;
  createdAt: string;
  weatherData?: WeatherData[];
  recommendations?: DateRisk[];
  historicalData?: HistoricalWeather[];
}

// ─── Chart Data ─────────────────────────────────────────────

export type ChartTab = 'temperature' | 'humidity' | 'rainfall' | 'risk';

// ─── API Response Shapes ────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}