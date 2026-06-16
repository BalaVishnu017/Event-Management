import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ChevronRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import type { Event } from '../types';

interface EventCardProps {
  event: Event;
}

const typeConfig: Record<string, { gradient: string; label: string; emoji: string }> = {
  outdoor:  { gradient: 'from-emerald-500/20 to-teal-500/20', label: 'Outdoor',  emoji: '🏕️' },
  indoor:   { gradient: 'from-blue-500/20 to-indigo-500/20',  label: 'Indoor',   emoji: '🏢' },
  wedding:  { gradient: 'from-purple-500/20 to-pink-500/20',  label: 'Wedding',  emoji: '💒' },
  party:    { gradient: 'from-pink-500/20 to-rose-500/20',    label: 'Party',    emoji: '🎉' },
  sports:   { gradient: 'from-orange-500/20 to-amber-500/20', label: 'Sports',   emoji: '⚽' },
  business: { gradient: 'from-slate-500/20 to-gray-500/20',   label: 'Business', emoji: '💼' },
  other:    { gradient: 'from-gray-500/20 to-slate-500/20',   label: 'Other',    emoji: '📋' },
};

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const config = typeConfig[event.type] || typeConfig.other;

  // Risk badge
  const getRiskBadge = () => {
    if (!event.recommendations || event.recommendations.length === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-700/60 text-surface-400 border border-surface-600/40">
          <Clock size={12} />
          Not analyzed
        </span>
      );
    }
    const best = event.recommendations[0];
    switch (best.riskLevel) {
      case 'low':
        return (
          <span className="risk-badge-low">
            <CheckCircle size={12} className="mr-1" />
            Low Risk
          </span>
        );
      case 'moderate':
        return (
          <span className="risk-badge-moderate">
            <AlertTriangle size={12} className="mr-1" />
            Moderate Risk
          </span>
        );
      case 'high':
        return (
          <span className="risk-badge-high">
            <AlertTriangle size={12} className="mr-1" />
            High Risk
          </span>
        );
      default:
        return null;
    }
  };

  const formatDateRange = () => {
    try {
      const start = format(parseISO(event.startDateRange), 'MMM d');
      const end = format(parseISO(event.endDateRange), 'MMM d, yyyy');
      return `${start} — ${end}`;
    } catch {
      return `${event.startDateRange} — ${event.endDateRange}`;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link
        to={`/events/${event.id}`}
        className={`block glass-card overflow-hidden hover:border-brand-500/30 transition-all duration-300`}
      >
        {/* Top gradient strip */}
        <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />

        <div className="p-5">
          {/* Header row */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.emoji}</span>
              <h3 className="text-base font-semibold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                {event.name}
              </h3>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-gradient-to-r ${config.gradient} text-surface-200 border border-surface-600/30`}>
              {config.label}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-surface-400">
              <MapPin size={14} className="text-brand-400 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-surface-400">
              <Calendar size={14} className="text-accent-teal flex-shrink-0" />
              <span>{formatDateRange()}</span>
            </div>
            {event.duration && (
              <div className="flex items-center gap-2 text-sm text-surface-400">
                <Clock size={14} className="text-accent-amber flex-shrink-0" />
                <span>{event.duration} hour{event.duration > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-3 border-t border-surface-700/40">
            {getRiskBadge()}
            <ChevronRight
              size={16}
              className="text-surface-600 group-hover:text-brand-400 group-hover:translate-x-1 transition-all duration-200"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EventCard;