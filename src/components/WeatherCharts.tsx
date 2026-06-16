import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DateRisk, ChartTab } from '../types';

interface WeatherChartsProps {
  dateRisks: DateRisk[];
}

const tabs: { key: ChartTab; label: string; emoji: string }[] = [
  { key: 'temperature', label: 'Temperature', emoji: '🌡️' },
  { key: 'humidity',    label: 'Humidity',    emoji: '💧' },
  { key: 'rainfall',   label: 'Rainfall',    emoji: '🌧️' },
  { key: 'risk',       label: 'Risk Level',  emoji: '⚠️' },
];

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
        <p key={i} className="text-surface-200" style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const WeatherCharts: React.FC<WeatherChartsProps> = ({ dateRisks }) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('temperature');

  const chartData = dateRisks.map((r) => ({
    date: formatDate(r.date),
    temp: r.weatherData.temp_c,
    feelsLike: r.weatherData.feelslike_c,
    minTemp: r.weatherData.mintemp_c,
    maxTemp: r.weatherData.maxtemp_c,
    humidity: r.weatherData.humidity,
    rainfall: r.weatherData.precip_mm,
    wind: r.weatherData.wind_kph,
    risk: r.riskScore,
    cloud: r.weatherData.cloud,
  }));

  const axisStyle = { fontSize: 11, fill: '#94a3b8' };
  const gridStyle = { strokeDasharray: '3 3', stroke: '#334155' };

  const renderChart = () => {
    switch (activeTab) {
      case 'temperature':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="date" tick={axisStyle} />
              <YAxis tick={axisStyle} unit="°C" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Line type="monotone" dataKey="maxTemp" name="Max Temp °C" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="temp" name="Avg Temp °C" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="minTemp" name="Min Temp °C" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="feelsLike" name="Feels Like °C" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'humidity':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="date" tick={axisStyle} />
              <YAxis tick={axisStyle} unit="%" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Bar dataKey="humidity" name="Humidity %" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cloud" name="Cloud Cover %" fill="#6366f1" radius={[6, 6, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'rainfall':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="date" tick={axisStyle} />
              <YAxis tick={axisStyle} unit=" mm" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Bar dataKey="rainfall" name="Rainfall (mm)" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              <Bar dataKey="wind" name="Wind (km/h)" fill="#14b8a6" radius={[6, 6, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'risk':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="date" tick={axisStyle} />
              <YAxis tick={axisStyle} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Area
                type="monotone"
                dataKey="risk"
                name="Risk Score"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fill="url(#riskGradient)"
                dot={{ r: 5, fill: '#f59e0b', stroke: '#1e293b', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Tab Bar */}
      <div className="flex gap-1 p-2 bg-surface-800/40 border-b border-surface-700/40 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={activeTab === tab.key ? 'tab-btn-active' : 'tab-btn'}
          >
            <span className="mr-1.5">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="p-6">
        {renderChart()}
      </div>
    </div>
  );
};

export default WeatherCharts;
