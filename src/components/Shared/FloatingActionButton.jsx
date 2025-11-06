import React from 'react';

const PlusIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m-8-8h16" />
  </svg>
);

const FloatingActionButton = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 
        w-14 h-14 
        bg-amber-400 hover:bg-amber-500 
        text-slate-900 
        rounded-full 
        shadow-2xl 
        flex items-center justify-center 
        transition-all duration-200 
        focus:outline-none focus:ring-4 focus:ring-amber-500/50 
        z-30
        ${className}
      `}
      aria-label="Add new item"
    >
      <PlusIcon />
    </button>
  );
};

export default FloatingActionButton;
