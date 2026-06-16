import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle, Search, SlidersHorizontal, X, Calendar,
  AlertTriangle, CheckCircle, TrendingUp, Cloud, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import type { EventType } from '../types';

const Dashboard: React.FC = () => {
  const { events, loading, getUpcomingEvents, getPastEvents, getHighRiskEvents } = useEvents();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const upcoming = getUpcomingEvents();
  const past = getPastEvents();
  const highRisk = getHighRiskEvents();

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeFilters: { value: EventType | 'all'; label: string; emoji: string; color: string }[] = [
    { value: 'all',      label: 'All',      emoji: '📋', color: 'brand' },
    { value: 'outdoor',  label: 'Outdoor',  emoji: '🏕️', color: 'emerald' },
    { value: 'indoor',   label: 'Indoor',   emoji: '🏢', color: 'blue' },
    { value: 'wedding',  label: 'Wedding',  emoji: '💒', color: 'purple' },
    { value: 'party',    label: 'Party',    emoji: '🎉', color: 'pink' },
    { value: 'sports',   label: 'Sports',   emoji: '⚽', color: 'orange' },
    { value: 'business', label: 'Business', emoji: '💼', color: 'slate' },
    { value: 'other',    label: 'Other',    emoji: '📌', color: 'gray' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-gradient">{user?.displayName || 'Planner'}</span> 👋
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Manage your events and monitor weather conditions
          </p>
        </div>
        <Link to="/create" className="btn-primary flex items-center gap-2">
          <PlusCircle size={18} />
          New Event
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="stat-icon bg-gradient-to-br from-brand-500 to-brand-600">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{events.length}</p>
            <p className="text-xs text-surface-400">Total Events</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="stat-card">
          <div className="stat-icon bg-gradient-to-br from-teal-500 to-emerald-500">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{upcoming.length}</p>
            <p className="text-xs text-surface-400">Upcoming</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="stat-icon bg-gradient-to-br from-violet-500 to-purple-500">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{past.length}</p>
            <p className="text-xs text-surface-400">Completed</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="stat-card">
          <div className="stat-icon bg-gradient-to-br from-red-500 to-rose-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{highRisk.length}</p>
            <p className="text-xs text-surface-400">High Risk</p>
          </div>
        </motion.div>
      </div>

      {/* High Risk Alert */}
      {highRisk.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border-risk-high/30 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <Zap size={20} className="text-risk-high" />
            </div>
            <div>
              <p className="text-sm font-semibold text-risk-high">Weather Alert</p>
              <p className="text-xs text-surface-400">
                {highRisk.length} event{highRisk.length > 1 ? 's have' : ' has'} high weather risk. Consider rescheduling or switching to indoor venues.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search & Filters */}
      <div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search size={16} className="absolute left-3.5 top-3.5 text-surface-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events or locations..."
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 glass-card-sm p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-surface-300">Filter by type</h3>
                {(typeFilter !== 'all' || searchTerm) && (
                  <button
                    onClick={() => { setSearchTerm(''); setTypeFilter('all'); }}
                    className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <X size={14} />
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTypeFilter(f.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      typeFilter === f.value
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                        : 'bg-surface-800/40 text-surface-400 border border-surface-700/40 hover:text-surface-200'
                    }`}
                  >
                    {f.emoji} {f.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Event Grid */}
      {events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-surface-800/60 mx-auto mb-6 flex items-center justify-center">
            <Cloud size={36} className="text-surface-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No events yet</h2>
          <p className="text-sm text-surface-400 mb-6 max-w-sm mx-auto">
            Create your first event and let us analyze the weather for the perfect planning.
          </p>
          <Link to="/create" className="btn-primary inline-flex items-center gap-2">
            <PlusCircle size={18} />
            Create your first event
          </Link>
        </motion.div>
      ) : filteredEvents.length === 0 ? (
        <div className="glass-card p-6 flex items-center gap-4">
          <AlertTriangle size={24} className="text-amber-400 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-white">No matching events</h3>
            <p className="text-sm text-surface-400">Try adjusting your search or filters.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
