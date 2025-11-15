import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Segmented pill-style theme toggle component
 * Used across both User Settings and Advisor Settings pages
 */
const ThemeToggleSegmented = () => {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const options = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  const handleThemeClick = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className="space-y-3">
      {/* Segmented Control */}
      <div className="inline-flex bg-slate-800/60 backdrop-blur-sm rounded-xl p-1 border border-slate-700/50">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleThemeClick(option.value)}
            className={`
              relative px-6 py-2.5 rounded-lg font-medium text-sm
              transition-all duration-300 ease-in-out
              ${
                theme === option.value
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/50'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }
            `}
          >
            {option.label}

            {/* Active indicator line */}
            {theme === option.value && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full opacity-80"></div>
            )}
          </button>
        ))}
      </div>

      {/* Helper text with current state */}
      <p className="text-xs text-gray-400">
        Your theme preference is saved on this device.
        {effectiveTheme && (
          <span className="ml-2 text-teal-400">
            (Currently: {effectiveTheme})
          </span>
        )}
      </p>
    </div>
  );
};

export default ThemeToggleSegmented;
