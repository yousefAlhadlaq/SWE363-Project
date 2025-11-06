import React from 'react';

const SelectMenu = ({ 
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}) => {
  // Ensure the placeholder is the first, disabled option if value is empty
  const formattedOptions = [
    { value: '', label: placeholder, disabled: true },
    ...options
  ];

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-400 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 
            bg-slate-700/50 
            border ${error ? 'border-red-500' : 'border-slate-600'} 
            rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            appearance-none
            cursor-pointer
            ${!value ? 'text-gray-400' : 'text-white'} 
            ${className}
          `}
          {...props}
        >
          {formattedOptions.map((option, index) => (
            <option 
              key={index} 
              value={option.value}
              disabled={option.disabled}
              // Conditional styling for the placeholder option
              className={option.disabled ? 'text-gray-500' : 'text-white bg-slate-700'}
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
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectMenu;
