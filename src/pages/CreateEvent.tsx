import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import EventForm from '../components/EventForm';

const CreateEvent: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Sparkles size={24} className="text-brand-400" />
          Create New Event
        </h1>
        <p className="text-sm text-surface-400 mt-1">
          Enter your event details and we'll analyze weather conditions for the best planning
        </p>
      </motion.div>
      <EventForm />
    </div>
  );
};

export default CreateEvent;