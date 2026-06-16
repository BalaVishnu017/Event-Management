import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Clock, Users, Tag, Trash2,
  RefreshCw, Lightbulb, Info, Shield,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

import { useEvents } from '../context/EventContext';
import { useWeather } from '../hooks/useWeather';
import { getSmartSuggestion, calculateComfortIndex } from '../utils/suggestionEngine';
import { calculateRisk } from '../utils/riskCalculator';

import LoadingSpinner from '../components/LoadingSpinner';
import RiskGauge from '../components/RiskGauge';
import WeatherDayCard from '../components/WeatherDayCard';
import HourlyWeatherTable from '../components/HourlyWeatherTable';
import WeatherCharts from '../components/WeatherCharts';
import RecommendedDates from '../components/RecommendedDates';
import HistoricalComparison from '../components/HistoricalComparison';

import type { DateRisk } from '../types';

type TabKey = 'overview' | 'daily' | 'charts' | 'historical' | 'recommendations';

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'overview',        label: 'Overview',        emoji: '📊' },
  { key: 'daily',           label: 'Daily Forecast',  emoji: '📅' },
  { key: 'charts',          label: 'Charts',          emoji: '📈' },
  { key: 'historical',      label: 'Historical',      emoji: '📜' },
  { key: 'recommendations', label: 'Best Dates',      emoji: '⭐' },
];

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEvent, updateEvent, deleteEvent } = useEvents();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const event = getEvent(id || '');

  const {
    forecast,
    dateRisks,
    historical,
    loading: weatherLoading,
    error: weatherError,
    refetch,
  } = useWeather(
    event?.location || '',
    event?.startDateRange || '',
    event?.endDateRange || '',
    event?.type || 'outdoor'
  );

  // Guard: only persist weather data back to the event once per load
  const savedRef = useRef(false);

  // Save weather data + recommendations to event when loaded
  useEffect(() => {
    if (savedRef.current) return;          // already saved this session
    if (!event) return;
    if (dateRisks.length === 0) return;    // weather not yet loaded
    if (forecast.length === 0) return;

    savedRef.current = true;

    // Only call updateEvent if something actually changed
    const alreadySaved =
      event.weatherData?.length === forecast.length &&
      event.recommendations?.length === dateRisks.length;

    if (!alreadySaved) {
      const updated = {
        ...event,
        weatherData: forecast,
        recommendations: dateRisks,
        historicalData: historical,
      };
      updateEvent(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRisks.length, forecast.length]);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <Info size={48} className="text-surface-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-sm text-surface-400 mb-6">This event doesn't exist or was deleted.</p>
        <Link to="/" className="btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(event.id);
      toast.success('Event deleted');
      navigate('/');
    }
  };

  // Best date risk
  const bestRisk: DateRisk | null = dateRisks.length > 0 ? dateRisks[0] : null;
  const overallRiskScore = bestRisk?.riskScore ?? 0;
  const overallRiskLevel = bestRisk?.riskLevel ?? 'low';

  // Smart suggestion for best date
  const smartSuggestion = bestRisk
    ? getSmartSuggestion(bestRisk.weatherData, event.type, bestRisk.riskLevel)
    : null;

  const comfortIndex = bestRisk ? calculateComfortIndex(bestRisk.weatherData) : 0;

  // Calculate risks for ALL forecast days (preserve original order for the daily tab)
  const allDateRisks: DateRisk[] = forecast.map((w) => calculateRisk(w, event.type));

  const formatDate = (d: string) => {
    try { return format(parseISO(d), 'MMM d, yyyy'); } catch { return d; }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Back + Actions ── */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        <div className="flex gap-2">
          <button onClick={refetch} className="btn-secondary flex items-center gap-2 text-xs py-2 px-3">
            <RefreshCw size={14} />
            Refresh
          </button>
          <button onClick={handleDelete} className="btn-danger flex items-center gap-2 text-xs py-2 px-3">
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* ── Event Header ── */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* Left: event info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">
                {event.type === 'outdoor' ? '🏕️' : event.type === 'wedding' ? '💒' :
                 event.type === 'sports' ? '⚽' : event.type === 'party' ? '🎉' :
                 event.type === 'business' ? '💼' : event.type === 'indoor' ? '🏢' : '📋'}
              </span>
              <h1 className="text-2xl font-bold text-white">{event.name}</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-surface-400">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-brand-400" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-accent-teal" />
                <span>{formatDate(event.startDateRange)} — {formatDate(event.endDateRange)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-accent-amber" />
                <span>{event.duration} hour{event.duration > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-accent-violet" />
                <span className="capitalize">{event.type}</span>
              </div>
              {event.expectedAttendees && (
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-accent-rose" />
                  <span>{event.expectedAttendees} attendees</span>
                </div>
              )}
            </div>

            {event.description && (
              <p className="mt-3 text-sm text-surface-400 italic">"{event.description}"</p>
            )}
          </div>

          {/* Right: Risk Gauge */}
          <div className="flex flex-col items-center justify-center">
            {weatherLoading ? (
              <div className="w-[180px] h-[120px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : (
              <RiskGauge score={overallRiskScore} level={overallRiskLevel} label="Best Date Risk" />
            )}
          </div>
        </div>
      </div>

      {/* ── Smart Suggestion Banner ── */}
      {smartSuggestion && !weatherLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border-brand-500/20 p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
              <Lightbulb size={20} className="text-brand-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-semibold text-white">Smart Recommendation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-surface-400">
                <div>
                  <span className="text-surface-500 uppercase tracking-wider text-[10px]">Venue</span>
                  <p className="text-surface-200 font-medium mt-0.5 capitalize">
                    {smartSuggestion.venueType === 'covered-outdoor' ? '🏗️ Covered Outdoor' :
                     smartSuggestion.venueType === 'indoor' ? '🏢 Indoor' : '🌳 Outdoor'}
                  </p>
                </div>
                <div>
                  <span className="text-surface-500 uppercase tracking-wider text-[10px]">Best Time</span>
                  <p className="text-surface-200 font-medium mt-0.5">{smartSuggestion.timeOfDay}</p>
                </div>
                <div>
                  <span className="text-surface-500 uppercase tracking-wider text-[10px]">Comfort Index</span>
                  <p className="font-bold mt-0.5">
                    <span className={comfortIndex >= 70 ? 'text-risk-low' : comfortIndex >= 40 ? 'text-risk-moderate' : 'text-risk-high'}>
                      {comfortIndex}/100
                    </span>
                  </p>
                </div>
              </div>
              <p className="text-xs text-surface-400">{smartSuggestion.reasoning}</p>

              {/* Warnings */}
              {smartSuggestion.weatherWarnings.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {smartSuggestion.weatherWarnings.map((w, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">
                      ⚠️ {w}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Tab Navigation ── */}
      <div className="flex gap-1 p-1.5 glass-card-sm overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 ${activeTab === tab.key ? 'tab-btn-active' : 'tab-btn'}`}
          >
            <span className="mr-1.5">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {weatherLoading ? (
        <LoadingSpinner message="Analyzing weather patterns..." />
      ) : weatherError ? (
        <div className="glass-card p-8 text-center">
          <Shield size={32} className="mx-auto mb-3 text-red-400" />
          <p className="text-red-400 mb-2">{weatherError}</p>
          <button onClick={refetch} className="btn-secondary text-sm">Retry</button>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="glass-card-sm p-4 text-center">
                  <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Days Analyzed</p>
                  <p className="text-2xl font-bold text-white">{forecast.length}</p>
                </div>
                <div className="glass-card-sm p-4 text-center">
                  <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Avg Temp</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {forecast.length > 0
                      ? (forecast.reduce((s, f) => s + f.temp_c, 0) / forecast.length).toFixed(1)
                      : '-'}°C
                  </p>
                </div>
                <div className="glass-card-sm p-4 text-center">
                  <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Total Rain</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {forecast.reduce((s, f) => s + f.precip_mm, 0).toFixed(1)} mm
                  </p>
                </div>
                <div className="glass-card-sm p-4 text-center">
                  <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Low Risk Days</p>
                  <p className="text-2xl font-bold text-risk-low">
                    {allDateRisks.filter((r) => r.riskLevel === 'low').length}
                  </p>
                </div>
              </div>

              {/* Best date info */}
              {bestRisk && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    ⭐ Best Date Recommendation
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-risk-low">
                        {new Date(bestRisk.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-surface-400 mt-1">{bestRisk.summary}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-700/50 text-surface-300">
                          🌡️ {bestRisk.weatherData.temp_c}°C
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-700/50 text-surface-300">
                          💧 {bestRisk.weatherData.humidity}%
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-700/50 text-surface-300">
                          🌧️ {bestRisk.weatherData.precip_mm} mm
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-700/50 text-surface-300">
                          💨 {bestRisk.weatherData.wind_kph} km/h
                        </span>
                      </div>
                    </div>
                    {bestRisk.suggestions && bestRisk.suggestions.length > 0 && (
                      <div className="sm:w-64 space-y-1.5 sm:border-l sm:border-surface-700/40 sm:pl-4">
                        <p className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Tips</p>
                        {bestRisk.suggestions.slice(0, 3).map((s, i) => (
                          <p key={i} className="text-[11px] text-surface-400 flex items-start gap-1.5">
                            <span className="text-brand-400 mt-0.5">•</span>
                            {s}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mini chart preview */}
              {allDateRisks.length > 0 && <WeatherCharts dateRisks={allDateRisks} />}
            </div>
          )}

          {/* ── DAILY FORECAST TAB ── */}
          {activeTab === 'daily' && (
            <div className="space-y-6">
              {/* Day cards grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {forecast.map((w, i) => {
                  const risk = allDateRisks[i];
                  const isBest = bestRisk?.date === w.date;
                  return (
                    <WeatherDayCard
                      key={w.date}
                      weather={w}
                      riskLevel={risk?.riskLevel || 'low'}
                      riskScore={risk?.riskScore || 0}
                      isBestDay={isBest}
                      index={i}
                      onClick={() => setSelectedDayIndex(i)}
                    />
                  );
                })}
              </div>

              {/* Hourly breakdown for selected day */}
              {forecast[selectedDayIndex] && (
                <div>
                  <h3 className="text-sm font-semibold text-surface-300 mb-3">
                    Hourly Breakdown — {new Date(forecast[selectedDayIndex].date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <HourlyWeatherTable weather={forecast[selectedDayIndex]} />
                </div>
              )}

              {/* All days hourly */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-surface-300">All Days Hourly Data</h3>
                {forecast.map((w) => (
                  <HourlyWeatherTable key={w.date} weather={w} />
                ))}
              </div>
            </div>
          )}

          {/* ── CHARTS TAB ── */}
          {activeTab === 'charts' && allDateRisks.length > 0 && (
            <WeatherCharts dateRisks={allDateRisks} />
          )}

          {/* ── HISTORICAL TAB ── */}
          {activeTab === 'historical' && (
            <HistoricalComparison currentData={allDateRisks} historicalData={historical} />
          )}

          {/* ── RECOMMENDATIONS TAB ── */}
          {activeTab === 'recommendations' && (
            <RecommendedDates dateRisks={dateRisks} />
          )}
        </div>
      )}
    </div>
  );
};

export default EventDetails;