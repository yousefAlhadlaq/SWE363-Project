import React from 'react';

const Card = ({ children, title, className = '' }) => {
  const baseClasses = 'rounded-2xl p-6 border shadow-lg backdrop-blur-sm transition-colors bg-white/95 text-slate-900 border-slate-200/70 dark:bg-slate-800/95 dark:text-white dark:border-slate-700/50';

  return (
    <div className={`${baseClasses} ${className}`}>
      {title && (
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
