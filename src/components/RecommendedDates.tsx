import React from 'react';
import { Trophy, Star, Calendar, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DateRisk } from '../types';
import { findBestTimeSlot } from '../utils/riskCalculator';

interface RecommendedDatesProps {
  dateRisks: DateRisk[];
}

const RecommendedDates: React.FC<RecommendedDatesProps> = ({ dateRisks }) => {
  if (!dateRisks || dateRisks.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Info size={32} className="mx-auto mb-3 text-surface-500" />
        <p className="text-surface-400">No date analysis available yet.</p>
      </div>
    );
  }

  // Already sorted by risk score (lowest first)
  const ranked = dateRisks;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Trophy size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Recommended Dates</h3>
          <p className="text-xs text-surface-400">Ranked by lowest weather risk</p>
        </div>
      </div>

      {/* Ranked List */}
      {ranked.map((dateRisk, index) => {
        const dayLabel = new Date(dateRisk.date + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
        const bestTimeSlot = findBestTimeSlot(dateRisk.weatherData);
        const isTop = index === 0;
        const isTopThree = index < 3;

        return (
          <motion.div
            key={dateRisk.date}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`glass-card-sm overflow-hidden transition-all duration-300 ${
              isTop
                ? 'ring-2 ring-risk-low/40 border-risk-low/30'
                : 'hover:border-surface-600/60'
            }`}
          >
            <div className="flex items-stretch">
              {/* Rank Badge */}
              <div
                className={`w-16 flex flex-col items-center justify-center flex-shrink-0 border-r border-surface-700/40 ${
                  isTop
                    ? 'bg-gradient-to-b from-risk-low/20 to-transparent'
                    : isTopThree
                    ? 'bg-surface-800/40'
                    : 'bg-surface-800/20'
                }`}
              >
                {isTop ? (
                  <Star size={20} className="text-amber-400 mb-1" />
                ) : (
                  <span className="text-xl font-black text-surface-500">#{index + 1}</span>
                )}
                {isTop && (
                  <span className="text-[9px] font-bold text-risk-low uppercase tracking-widest">Best</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-brand-400" />
                      <h4 className="text-sm font-semibold text-white">{dayLabel}</h4>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-accent-teal" />
                      <span className="text-xs text-surface-400">Best time: {bestTimeSlot}</span>
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div className="text-right">
                    <span
                      className={`text-lg font-black ${
                        dateRisk.riskLevel === 'low'
                          ? 'text-risk-low'
                          : dateRisk.riskLevel === 'moderate'
                          ? 'text-risk-moderate'
                          : 'text-risk-high'
                      }`}
                    >
                      {dateRisk.riskScore}
                    </span>
                    <p className="text-[10px] text-surface-500 uppercase tracking-wider">risk</p>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs text-surface-400 mb-3">{dateRisk.summary}</p>

                {/* Weather highlights */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-700/50 text-surface-300">
                    🌡️ {dateRisk.weatherData.temp_c}°C
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-700/50 text-surface-300">
                    💧 {dateRisk.weatherData.humidity}%
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-700/50 text-surface-300">
                    🌧️ {dateRisk.weatherData.precip_mm}mm
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-700/50 text-surface-300">
                    💨 {dateRisk.weatherData.wind_kph}km/h
                  </span>
                </div>

                {/* Suggestions */}
                {dateRisk.suggestions && dateRisk.suggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-surface-700/30 space-y-1">
                    {dateRisk.suggestions.slice(0, 2).map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        {dateRisk.riskLevel === 'low' ? (
                          <CheckCircle size={11} className="text-risk-low flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle size={11} className="text-risk-moderate flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-[11px] text-surface-400">{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default RecommendedDates;
