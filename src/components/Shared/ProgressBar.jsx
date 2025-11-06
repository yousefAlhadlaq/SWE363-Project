import React from 'react';

const ProgressBar = ({ percentage, color = 'bg-teal-500', className = '' }) => {
  const cappedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className={`w-full bg-slate-700 rounded-full h-2.5 ${className}`}>
      <div 
        className={`h-2.5 rounded-full transition-all duration-500 ${color}`} 
        style={{ width: `${cappedPercentage}%` }}
        aria-valuenow={cappedPercentage}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  );
};

export default ProgressBar;
