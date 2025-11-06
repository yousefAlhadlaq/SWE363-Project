import React from 'react';

const Card = ({ children, title, className = '' }) => {
  return (
    <div className={`bg-slate-800/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50 ${className}`}>
      {title && (
        <h3 className="text-xl font-semibold text-white mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
