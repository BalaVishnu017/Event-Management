import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
        <AlertTriangle size={36} className="text-amber-400" />
      </div>
      <h1 className="text-5xl font-black text-white mb-2">404</h1>
      <h2 className="text-xl font-semibold text-surface-300 mb-3">Page Not Found</h2>
      <p className="text-sm text-surface-400 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="btn-primary flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </motion.div>
  );
};

export default NotFound;