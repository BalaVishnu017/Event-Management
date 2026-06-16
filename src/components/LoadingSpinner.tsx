import React from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      {/* Animated weather icon spinner */}
      <div className="relative w-20 h-20 mb-6">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-surface-700" />
        {/* Spinning arc */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-400 animate-spin" />
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl animate-pulse-soft">⛅</span>
        </div>
      </div>
      <p className="text-surface-400 text-sm font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
