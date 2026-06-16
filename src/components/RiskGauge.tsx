import React from 'react';
import { motion } from 'framer-motion';
import type { RiskLevel } from '../types';

interface RiskGaugeProps {
  score: number;        // 0-100
  level: RiskLevel;
  size?: number;        // SVG size
  label?: string;
}

const levelColors: Record<RiskLevel, { stroke: string; text: string; glow: string }> = {
  low:      { stroke: '#22c55e', text: 'text-risk-low',      glow: '0 0 20px rgba(34,197,94,0.3)' },
  moderate: { stroke: '#f59e0b', text: 'text-risk-moderate', glow: '0 0 20px rgba(245,158,11,0.3)' },
  high:     { stroke: '#ef4444', text: 'text-risk-high',     glow: '0 0 20px rgba(239,68,68,0.3)' },
};

const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  level,
  size = 180,
  label = 'Risk Score',
}) => {
  const colors = levelColors[level];
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - 24) / 2;
  const strokeWidth = 10;

  // Semi-circle: arc from 180° to 360° (π to 2π)
  const circumference = Math.PI * radius; // half circle
  const fillLength = (score / 100) * circumference;
  const dashOffset = circumference - fillLength;

  // Arc path (semi-circle, bottom half)
  const arcStartX = cx - radius;
  const arcStartY = cy;
  const arcEndX = cx + radius;
  const arcEndY = cy;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <svg
          width={size}
          height={size / 2 + 20}
          viewBox={`0 0 ${size} ${size / 2 + 20}`}
        >
          {/* Track */}
          <path
            d={`M ${arcStartX} ${cy} A ${radius} ${radius} 0 0 1 ${arcEndX} ${cy}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Fill */}
          <motion.path
            d={`M ${arcStartX} ${cy} A ${radius} ${radius} 0 0 1 ${arcEndX} ${cy}`}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(${colors.glow})` }}
          />
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = Math.PI + (tick / 100) * Math.PI;
            const x1 = cx + (radius - 18) * Math.cos(angle);
            const y1 = cy + (radius - 18) * Math.sin(angle);
            const x2 = cx + (radius - 12) * Math.cos(angle);
            const y2 = cy + (radius - 12) * Math.sin(angle);
            return (
              <line
                key={tick}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#475569"
                strokeWidth={1.5}
              />
            );
          })}
        </svg>

        {/* Center Score */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <motion.span
            className={`text-3xl font-black ${colors.text}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-surface-500 uppercase tracking-widest font-semibold mt-0.5">
            {label}
          </span>
        </div>
      </div>

      {/* Level Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className={`mt-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
          level === 'low'
            ? 'bg-risk-low/15 text-risk-low border-risk-low/30'
            : level === 'moderate'
            ? 'bg-risk-moderate/15 text-risk-moderate border-risk-moderate/30'
            : 'bg-risk-high/15 text-risk-high border-risk-high/30'
        }`}
      >
        {level} risk
      </motion.div>
    </div>
  );
};

export default RiskGauge;
