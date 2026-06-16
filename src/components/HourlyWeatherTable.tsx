import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WeatherData } from '../types';

interface HourlyWeatherTableProps {
  weather: WeatherData;
}

const HourlyWeatherTable: React.FC<HourlyWeatherTableProps> = ({ weather }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!weather.hourly || weather.hourly.length === 0) {
    return (
      <div className="glass-card-sm p-4 text-center text-surface-500 text-sm">
        No hourly data available for {weather.date}
      </div>
    );
  }

  const dayLabel = new Date(weather.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Show key hours when collapsed
  const keyHours = weather.hourly.filter((h) => {
    const hr = parseInt(h.time.split(':')[0]);
    return [6, 9, 12, 15, 18, 21].includes(hr);
  });

  const displayHours = isExpanded ? weather.hourly : keyHours;

  return (
    <div className="glass-card-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center px-5 py-3.5 hover:bg-surface-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{weather.condition.icon}</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">{dayLabel}</p>
            <p className="text-xs text-surface-400">
              {weather.temp_c}°C · {weather.condition.text}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-surface-400">
          <span className="text-xs">{isExpanded ? '24 hours' : '6 key hours'}</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Table */}
      <AnimatePresence>
        <motion.div
          layout
          className="overflow-x-auto"
        >
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface-800/60 text-surface-400 uppercase tracking-wider">
                <th className="px-4 py-2.5 text-left font-semibold">Time</th>
                <th className="px-4 py-2.5 text-center font-semibold">Temp</th>
                <th className="px-4 py-2.5 text-center font-semibold">Feels</th>
                <th className="px-4 py-2.5 text-center font-semibold">Humidity</th>
                <th className="px-4 py-2.5 text-center font-semibold">Rain</th>
                <th className="px-4 py-2.5 text-center font-semibold">Rain %</th>
                <th className="px-4 py-2.5 text-center font-semibold">Wind</th>
                <th className="px-4 py-2.5 text-center font-semibold">Cloud</th>
                <th className="px-4 py-2.5 text-left font-semibold">Cond.</th>
              </tr>
            </thead>
            <tbody>
              {displayHours.map((hour, i) => {
                const rainHighlight = hour.chance_of_rain > 60;
                const tempColor = hour.temp_c > 35 ? 'text-red-400' : hour.temp_c < 10 ? 'text-blue-400' : 'text-surface-200';

                return (
                  <tr
                    key={hour.time}
                    className={`border-t border-surface-700/30 hover:bg-surface-700/20 transition-colors ${
                      i % 2 === 0 ? 'bg-surface-800/20' : ''
                    }`}
                  >
                    <td className="px-4 py-2.5 text-surface-300 font-medium">{hour.time}</td>
                    <td className={`px-4 py-2.5 text-center font-semibold ${tempColor}`}>
                      {hour.temp_c}°C
                    </td>
                    <td className="px-4 py-2.5 text-center text-surface-400">
                      {hour.feelslike_c}°C
                    </td>
                    <td className="px-4 py-2.5 text-center text-blue-400">
                      {hour.humidity}%
                    </td>
                    <td className={`px-4 py-2.5 text-center ${rainHighlight ? 'text-blue-300 font-semibold' : 'text-surface-400'}`}>
                      {hour.precip_mm} mm
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        hour.chance_of_rain > 70 ? 'bg-blue-500/20 text-blue-300' :
                        hour.chance_of_rain > 40 ? 'bg-amber-500/20 text-amber-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {hour.chance_of_rain}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-teal-400">
                      {hour.wind_kph} km/h
                    </td>
                    <td className="px-4 py-2.5 text-center text-surface-400">
                      {hour.cloud}%
                    </td>
                    <td className="px-4 py-2.5 text-surface-300">
                      <span className="flex items-center gap-1">
                        <span>{hour.condition.icon}</span>
                        <span className="hidden sm:inline">{hour.condition.text}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default HourlyWeatherTable;
