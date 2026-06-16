import React from 'react';
import { Droplets, Wind, Thermometer, Eye, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import type { WeatherData, RiskLevel } from '../types';

interface WeatherDayCardProps {
  weather: WeatherData;
  riskLevel?: RiskLevel;
  riskScore?: number;
  isBestDay?: boolean;
  onClick?: () => void;
  index?: number;
}

const riskColors: Record<RiskLevel, string> = {
  low: 'border-risk-low/30 bg-risk-low/5',
  moderate: 'border-risk-moderate/30 bg-risk-moderate/5',
  high: 'border-risk-high/30 bg-risk-high/5',
};

const riskGlows: Record<RiskLevel, string> = {
  low: 'shadow-[0_0_15px_rgba(34,197,94,0.1)]',
  moderate: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]',
  high: 'shadow-[0_0_15px_rgba(239,68,68,0.1)]',
};

const WeatherDayCard: React.FC<WeatherDayCardProps> = ({
  weather,
  riskLevel = 'low',
  riskScore = 0,
  isBestDay = false,
  onClick,
  index = 0,
}) => {
  const dayName = new Date(weather.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`relative glass-card-sm p-4 cursor-pointer transition-all duration-300
        hover:border-brand-500/30 hover:shadow-glow-brand
        ${riskColors[riskLevel]} ${riskGlows[riskLevel]}
        ${isBestDay ? 'ring-2 ring-risk-low/50' : ''}`}
    >
      {/* Best Day Badge */}
      {isBestDay && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-risk-low text-white shadow-lg">
          ⭐ BEST
        </div>
      )}

      {/* Date & Condition */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-semibold text-white">{dayName}</p>
          <p className="text-xs text-surface-400 mt-0.5">{weather.condition.text}</p>
        </div>
        <span className="text-2xl">{weather.condition.icon}</span>
      </div>

      {/* Temperature */}
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-bold text-white">{weather.temp_c}°</span>
        <span className="text-xs text-surface-500">
          {weather.mintemp_c}° / {weather.maxtemp_c}°
        </span>
      </div>

      {/* Weather Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-surface-400">
          <Droplets size={12} className="text-blue-400" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-surface-400">
          <Wind size={12} className="text-teal-400" />
          <span>{weather.wind_kph} km/h</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-surface-400">
          <Thermometer size={12} className="text-red-400" />
          <span>Feels {weather.feelslike_c}°</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-surface-400">
          <Eye size={12} className="text-amber-400" />
          <span>{weather.precip_mm} mm</span>
        </div>
      </div>

      {/* Risk bar */}
      <div className="mt-3 pt-3 border-t border-surface-700/30">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">Risk</span>
          <span className={`text-[10px] font-bold uppercase ${
            riskLevel === 'low' ? 'text-risk-low' : riskLevel === 'moderate' ? 'text-risk-moderate' : 'text-risk-high'
          }`}>
            {riskLevel} ({riskScore})
          </span>
        </div>
        <div className="w-full h-1.5 bg-surface-700/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${riskScore}%` }}
            transition={{ duration: 0.8, delay: index * 0.05 + 0.3 }}
            className={`h-full rounded-full ${
              riskLevel === 'low' ? 'bg-risk-low' : riskLevel === 'moderate' ? 'bg-risk-moderate' : 'bg-risk-high'
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherDayCard;
