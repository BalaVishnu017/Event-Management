import React from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { History, TrendingUp } from 'lucide-react';
import type { DateRisk, HistoricalWeather } from '../types';

interface HistoricalComparisonProps {
  currentData: DateRisk[];
  historicalData: HistoricalWeather[];
}

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-surface-800 border border-surface-600/50 rounded-xl px-4 py-3 shadow-glass text-xs">
      <p className="text-surface-300 font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const HistoricalComparison: React.FC<HistoricalComparisonProps> = ({
  currentData,
  historicalData,
}) => {
  // Merge current and historical data by day index
  const maxLen = Math.max(currentData.length, historicalData.length);

  const tempData = Array.from({ length: maxLen }, (_, i) => ({
    label: i < currentData.length ? formatDate(currentData[i].date) : `Day ${i + 1}`,
    'This Year': i < currentData.length ? currentData[i].weatherData.temp_c : null,
    'Last Year': i < historicalData.length ? historicalData[i].temp_c : null,
  }));

  const rainData = Array.from({ length: maxLen }, (_, i) => ({
    label: i < currentData.length ? formatDate(currentData[i].date) : `Day ${i + 1}`,
    'This Year': i < currentData.length ? currentData[i].weatherData.precip_mm : null,
    'Last Year': i < historicalData.length ? historicalData[i].precip_mm : null,
  }));

  const humidityData = Array.from({ length: maxLen }, (_, i) => ({
    label: i < currentData.length ? formatDate(currentData[i].date) : `Day ${i + 1}`,
    'This Year': i < currentData.length ? currentData[i].weatherData.humidity : null,
    'Last Year': i < historicalData.length ? historicalData[i].humidity : null,
  }));

  // Summary stats
  const avgTempCurrent = currentData.length > 0
    ? (currentData.reduce((s, d) => s + d.weatherData.temp_c, 0) / currentData.length).toFixed(1)
    : '-';
  const avgTempHistorical = historicalData.length > 0
    ? (historicalData.reduce((s, d) => s + d.temp_c, 0) / historicalData.length).toFixed(1)
    : '-';
  const totalRainCurrent = currentData.reduce((s, d) => s + d.weatherData.precip_mm, 0).toFixed(1);
  const totalRainHistorical = historicalData.reduce((s, d) => s + d.precip_mm, 0).toFixed(1);

  const axisStyle = { fontSize: 11, fill: '#94a3b8' };
  const gridStyle = { strokeDasharray: '3 3', stroke: '#334155' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <History size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Historical Comparison</h3>
          <p className="text-xs text-surface-400">This year's forecast vs last year's data</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card-sm p-3 text-center">
          <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Avg Temp (Now)</p>
          <p className="text-xl font-bold text-amber-400">{avgTempCurrent}°C</p>
        </div>
        <div className="glass-card-sm p-3 text-center">
          <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Avg Temp (Last Year)</p>
          <p className="text-xl font-bold text-violet-400">{avgTempHistorical}°C</p>
        </div>
        <div className="glass-card-sm p-3 text-center">
          <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Total Rain (Now)</p>
          <p className="text-xl font-bold text-blue-400">{totalRainCurrent} mm</p>
        </div>
        <div className="glass-card-sm p-3 text-center">
          <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Total Rain (Last Year)</p>
          <p className="text-xl font-bold text-purple-400">{totalRainHistorical} mm</p>
        </div>
      </div>

      {/* Temperature Comparison Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-amber-400" />
          <h4 className="text-sm font-semibold text-white">Temperature Comparison</h4>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={tempData}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="label" tick={axisStyle} />
            <YAxis tick={axisStyle} unit="°C" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
            <Line type="monotone" dataKey="This Year" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Last Year" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rainfall Comparison Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🌧️</span>
          <h4 className="text-sm font-semibold text-white">Rainfall Comparison</h4>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rainData}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="label" tick={axisStyle} />
            <YAxis tick={axisStyle} unit=" mm" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
            <Bar dataKey="This Year" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Last Year" fill="#8b5cf6" radius={[4, 4, 0, 0]} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Humidity Comparison Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">💧</span>
          <h4 className="text-sm font-semibold text-white">Humidity Comparison</h4>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={humidityData}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="label" tick={axisStyle} />
            <YAxis tick={axisStyle} unit="%" domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
            <Bar dataKey="This Year" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Last Year" fill="#a855f7" radius={[4, 4, 0, 0]} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoricalComparison;
