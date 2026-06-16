import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import type { Event } from '../types';
import { useAuth } from './AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── Demo Mode Detection ─────────────────────────────────────
const IS_DEMO =
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'your_firebase_api_key';

// ─── Context Shape ──────────────────────────────────────────

interface EventContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'status'>) => Promise<Event | null>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEvent: (id: string) => Event | undefined;
  getUpcomingEvents: () => Event[];
  getPastEvents: () => Event[];
  getHighRiskEvents: () => Event[];
  loading: boolean;
  refreshEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextType>({
  events: [],
  addEvent: async () => null,
  updateEvent: async () => {},
  deleteEvent: async () => {},
  getEvent: () => undefined,
  getUpcomingEvents: () => [],
  getPastEvents: () => [],
  getHighRiskEvents: () => [],
  loading: true,
  refreshEvents: async () => {},
});

export const useEvents = () => useContext(EventContext);

// ─── localStorage helpers (demo mode only) ──────────────────

const LS_KEY = 'skycal_events';

function lsLoad(): Event[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function lsSave(events: Event[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(events));
}

// ─── Provider ───────────────────────────────────────────────

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch events from backend (real mode) ──────────────────
  const fetchFromBackend = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      const fetched: Event[] = (res.data.data || []).map((e: any) => ({
        ...e,
        id: e.id || e._id,
      }));
      setEvents(fetched);
    } catch (err) {
      console.error('Failed to load events from backend:', err);
      toast.error('Could not load your events. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load events on mount / when user changes ───────────────
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    if (IS_DEMO) {
      // Demo mode: use localStorage
      setEvents(lsLoad());
      setLoading(false);
    } else {
      fetchFromBackend();
    }
  }, [user, fetchFromBackend]);

  // ── Persist to localStorage in demo mode ───────────────────
  useEffect(() => {
    if (IS_DEMO && !loading) {
      lsSave(events);
    }
  }, [events, loading]);

  // ── addEvent ──────────────────────────────────────────────
  const addEvent = async (
    eventData: Omit<Event, 'id' | 'createdAt' | 'status'>
  ): Promise<Event | null> => {
    if (IS_DEMO) {
      const newEvent: Event = {
        ...(eventData as any),
        id: crypto.randomUUID(),
        status: 'upcoming',
        createdAt: new Date().toISOString(),
      };
      setEvents((prev) => [newEvent, ...prev]);
      return newEvent;
    }

    try {
      const res = await api.post('/events', eventData);
      const created: Event = { ...res.data.data, id: res.data.data.id || res.data.data._id };
      setEvents((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to create event';
      toast.error(msg);
      return null;
    }
  };

  // ── updateEvent ──────────────────────────────────────────
  const updateEvent = async (updated: Event): Promise<void> => {
    // Optimistic local update first
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));

    if (IS_DEMO) return;

    try {
      const res = await api.put(`/events/${updated.id}`, updated);
      const saved: Event = { ...res.data.data, id: res.data.data.id || res.data.data._id };
      setEvents((prev) => prev.map((e) => (e.id === saved.id ? saved : e)));
    } catch (err: any) {
      console.error('Failed to update event on backend:', err);
      // Revert on failure
      await fetchFromBackend();
      toast.error('Failed to save event changes.');
    }
  };

  // ── deleteEvent ──────────────────────────────────────────
  const deleteEvent = async (id: string): Promise<void> => {
    // Optimistic local delete first
    setEvents((prev) => prev.filter((e) => e.id !== id));

    if (IS_DEMO) return;

    try {
      await api.delete(`/events/${id}`);
    } catch (err: any) {
      console.error('Failed to delete event on backend:', err);
      await fetchFromBackend();
      toast.error('Failed to delete event. Please try again.');
    }
  };

  // ── Derived getters ──────────────────────────────────────
  const getEvent = (id: string) => events.find((e) => e.id === id);

  const getUpcomingEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter(
      (e) => e.endDateRange >= today && e.status !== 'completed' && e.status !== 'cancelled'
    );
  };

  const getPastEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter((e) => e.endDateRange < today || e.status === 'completed');
  };

  const getHighRiskEvents = () =>
    events.filter((e) => e.recommendations && e.recommendations[0]?.riskLevel === 'high');

  const refreshEvents = async () => {
    if (IS_DEMO) {
      setEvents(lsLoad());
    } else {
      await fetchFromBackend();
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        getEvent,
        getUpcomingEvents,
        getPastEvents,
        getHighRiskEvents,
        loading,
        refreshEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};