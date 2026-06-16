import React from 'react';
import { Link } from 'react-router-dom';
import { History, Calendar, MapPin, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useEvents } from '../context/EventContext';

const PastEvents: React.FC = () => {
  const { getPastEvents } = useEvents();
  const pastEvents = getPastEvents();

  const formatDate = (d: string) => {
    try { return format(parseISO(d), 'MMM d, yyyy'); } catch { return d; }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <History size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Past Events</h1>
          <p className="text-sm text-surface-400">Review your completed events and their weather outcomes</p>
        </div>
      </div>

      {pastEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-surface-800/60 mx-auto mb-6 flex items-center justify-center">
            <Calendar size={36} className="text-surface-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No past events</h2>
          <p className="text-sm text-surface-400 mb-6 max-w-sm mx-auto">
            Your completed events will appear here with weather analytics and outcomes.
          </p>
          <Link to="/create" className="btn-primary inline-flex items-center gap-2">
            Plan an event
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {pastEvents.map((event, i) => {
            const bestRisk = event.recommendations?.[0];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/events/${event.id}`}
                  className="glass-card hover:border-brand-500/30 transition-all duration-300 block"
                >
                  <div className="flex items-stretch">
                    {/* Status stripe */}
                    <div className="w-1.5 bg-gradient-to-b from-violet-500 to-purple-600 rounded-l-2xl flex-shrink-0" />

                    <div className="flex-1 p-5">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        {/* Event Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CheckCircle size={16} className="text-violet-400" />
                            <h3 className="text-base font-semibold text-white">{event.name}</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20 uppercase tracking-wider font-bold">
                              {event.type}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-surface-400 mt-2">
                            <span className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-brand-400" />
                              {event.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-accent-teal" />
                              {formatDate(event.startDateRange)} — {formatDate(event.endDateRange)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} className="text-accent-amber" />
                              {event.duration}h
                            </span>
                          </div>
                        </div>

                        {/* Weather Outcome */}
                        <div className="flex items-center gap-4 sm:border-l sm:border-surface-700/40 sm:pl-5">
                          {bestRisk ? (
                            <div className="text-center">
                              <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Risk Score</p>
                              <p className={`text-2xl font-black ${
                                bestRisk.riskLevel === 'low' ? 'text-risk-low' :
                                bestRisk.riskLevel === 'moderate' ? 'text-risk-moderate' : 'text-risk-high'
                              }`}>
                                {bestRisk.riskScore}
                              </p>
                              <span className={`text-[9px] font-bold uppercase ${
                                bestRisk.riskLevel === 'low' ? 'text-risk-low' :
                                bestRisk.riskLevel === 'moderate' ? 'text-risk-moderate' : 'text-risk-high'
                              }`}>
                                {bestRisk.riskLevel}
                              </span>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-xs text-surface-500">No analysis</p>
                            </div>
                          )}

                          {bestRisk?.weatherData && (
                            <div className="space-y-1 text-[10px] text-surface-400">
                              <p>🌡️ {bestRisk.weatherData.temp_c}°C</p>
                              <p>🌧️ {bestRisk.weatherData.precip_mm}mm</p>
                              <p>💨 {bestRisk.weatherData.wind_kph}km/h</p>
                            </div>
                          )}

                          <ArrowRight size={16} className="text-surface-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PastEvents;
