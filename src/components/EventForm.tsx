import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Tag, Clock, Users, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Event, EventType } from '../types';
import { useEvents } from '../context/EventContext';

interface EventFormProps {
  initialValues?: Partial<Event>;
  isEditing?: boolean;
}

const eventTypes: { value: EventType; label: string; emoji: string }[] = [
  { value: 'outdoor',  label: 'Outdoor Event',  emoji: '🏕️' },
  { value: 'indoor',   label: 'Indoor Event',   emoji: '🏢' },
  { value: 'wedding',  label: 'Wedding',        emoji: '💒' },
  { value: 'party',    label: 'Party',          emoji: '🎉' },
  { value: 'sports',   label: 'Sports Event',   emoji: '⚽' },
  { value: 'business', label: 'Business Event', emoji: '💼' },
  { value: 'other',    label: 'Other',          emoji: '📋' },
];

const EventForm: React.FC<EventFormProps> = ({ initialValues, isEditing = false }) => {
  const navigate = useNavigate();
  const { addEvent, updateEvent } = useEvents();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [formData, setFormData] = useState<Partial<Event>>({
    name: '',
    type: 'outdoor',
    location: '',
    startDateRange: today,
    endDateRange: today,
    duration: 4,
    description: '',
    expectedAttendees: 50,
    ...initialValues,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name?.trim()) errs.name = 'Event name is required';
    if (!formData.location?.trim()) errs.location = 'Location is required';
    if (!formData.startDateRange) errs.startDateRange = 'Start date is required';
    if (!formData.endDateRange) errs.endDateRange = 'End date is required';
    if (formData.startDateRange && formData.endDateRange && formData.startDateRange > formData.endDateRange) {
      errs.dateRange = 'End date must be after start date';
    }
    if (!formData.duration || formData.duration < 1) errs.duration = 'Duration must be at least 1 hour';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => { const u = { ...prev }; delete u[name]; return u; });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { toast.error('Please fill in all required fields'); return; }

    try {
      if (isEditing && initialValues?.id) {
        await updateEvent({ ...(formData as Event), id: initialValues.id });
        toast.success('Event updated successfully');
      } else {
        const created = await addEvent(formData as Omit<Event, 'id' | 'createdAt' | 'status'>);
        if (!created) return; // error already shown via toast
        toast.success('Event created! Analyzing weather...');
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-teal flex items-center justify-center">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Event' : 'Plan Your Event'}
          </h2>
          <p className="text-sm text-surface-400">Fill in details and we'll analyze the weather</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Name */}
        <div>
          <label htmlFor="name" className="input-label">
            <Calendar size={14} className="inline mr-1.5 text-brand-400" />
            Event Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className={`input-field ${errors.name ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
            placeholder="e.g. Summer Wedding Ceremony"
          />
          {errors.name && <p className="input-error">{errors.name}</p>}
        </div>

        {/* Event Type & Duration — 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="type" className="input-label">
              <Tag size={14} className="inline mr-1.5 text-accent-teal" />
              Event Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type || 'outdoor'}
              onChange={handleChange}
              className="input-field appearance-none cursor-pointer"
            >
              {eventTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.emoji} {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="duration" className="input-label">
              <Clock size={14} className="inline mr-1.5 text-accent-amber" />
              Duration (hours) *
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              min={1}
              max={72}
              value={formData.duration || 4}
              onChange={handleChange}
              className={`input-field ${errors.duration ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
            />
            {errors.duration && <p className="input-error">{errors.duration}</p>}
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="input-label">
            <MapPin size={14} className="inline mr-1.5 text-accent-rose" />
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            className={`input-field ${errors.location ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
            placeholder="e.g. Hyderabad, Mumbai, New York"
          />
          {errors.location && <p className="input-error">{errors.location}</p>}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="startDateRange" className="input-label">Start Date *</label>
            <input
              type="date"
              id="startDateRange"
              name="startDateRange"
              value={formData.startDateRange || ''}
              onChange={handleChange}
              min={today}
              className={`input-field ${errors.startDateRange || errors.dateRange ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
            />
            {errors.startDateRange && <p className="input-error">{errors.startDateRange}</p>}
          </div>
          <div>
            <label htmlFor="endDateRange" className="input-label">End Date *</label>
            <input
              type="date"
              id="endDateRange"
              name="endDateRange"
              value={formData.endDateRange || ''}
              onChange={handleChange}
              min={formData.startDateRange || today}
              className={`input-field ${errors.endDateRange || errors.dateRange ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
            />
            {errors.endDateRange && <p className="input-error">{errors.endDateRange}</p>}
          </div>
        </div>
        {errors.dateRange && <p className="input-error -mt-4">{errors.dateRange}</p>}

        {/* Expected Attendees */}
        <div>
          <label htmlFor="expectedAttendees" className="input-label">
            <Users size={14} className="inline mr-1.5 text-accent-violet" />
            Expected Attendees
          </label>
          <input
            type="number"
            id="expectedAttendees"
            name="expectedAttendees"
            min={1}
            value={formData.expectedAttendees || ''}
            onChange={handleChange}
            className="input-field"
            placeholder="50"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="input-label">
            <FileText size={14} className="inline mr-1.5 text-surface-400" />
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
            className="input-field resize-none"
            placeholder="Describe your event, special requirements..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/40">
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            Cancel
          </button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2"
          >
            {isEditing ? 'Update Event' : 'Create & Analyze'}
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default EventForm;