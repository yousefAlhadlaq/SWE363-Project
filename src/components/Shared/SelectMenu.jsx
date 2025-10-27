import React from 'react';

const SelectMenu = ({ 
  name,
  value,
  onChange,
  options = [],
  error,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full px-4 py-3 
          bg-slate-700/50 
          border ${error ? 'border-red-500' : 'border-slate-600'} 
          rounded-lg 
          text-white
          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          appearance-none
          cursor-pointer
          ${!value ? 'text-gray-400' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map((option, index) => (
          <option 
            key={index} 
            value={option.value}
            disabled={option.value === ''}
            className="bg-slate-700 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Custom Dropdown Arrow */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg 
          className="w-5 h-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectMenu;