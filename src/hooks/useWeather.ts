import { useState, useEffect, useCallback } from 'react';
import { getWeatherForecast, generateHistoricalData } from '../services/weatherService';
import { rankDates } from '../utils/riskCalculator';
import type { WeatherData, DateRisk, HistoricalWeather, EventType } from '../types';

interface UseWeatherResult {
  forecast: WeatherData[];
  dateRisks: DateRisk[];
  historical: HistoricalWeather[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWeather(
  location: string,
  startDate: string,
  endDate: string,
  eventType: EventType
): UseWeatherResult {
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [dateRisks, setDateRisks] = useState<DateRisk[]>([]);
  const [historical, setHistorical] = useState<HistoricalWeather[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!location || !startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch forecast
      const weatherData = await getWeatherForecast(location, startDate, endDate);
      setForecast(weatherData);

      // Calculate risk rankings
      const ranked = rankDates(weatherData, eventType);
      setDateRisks(ranked);

      // Generate historical comparison
      const hist = generateHistoricalData(location, startDate, endDate);
      setHistorical(hist);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [location, startDate, endDate, eventType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { forecast, dateRisks, historical, loading, error, refetch: fetchData };
}
