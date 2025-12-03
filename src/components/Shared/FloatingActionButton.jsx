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
        fixed bottom-8 right-8 
        w-16 h-16 
        bg-amber-400 hover:bg-amber-300 
        text-slate-900 
        rounded-full 
        shadow-[0_20px_45px_rgba(251,191,36,0.35)] 
        flex items-center justify-center 
        transition-all duration-200 
        hover:scale-110
        focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 
        z-50 group
        ${className}
      `}
      aria-label="Add new item"
    >
      <PlusIcon className="w-8 h-8 text-slate-900 group-hover:rotate-90 transition-transform duration-300" />
    </button>
  );
};

export default FloatingActionButton;
