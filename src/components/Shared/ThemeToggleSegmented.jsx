import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Monitor, Sun, Moon } from 'lucide-react';

/**
 * Segmented pill-style theme toggle component
 * Styled to match the navbar filter pills (Day/Week/Month etc.)
 * Used across both User Settings and Advisor Settings pages
 */
const ThemeToggleSegmented = () => {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const options = [
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  const handleThemeClick = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className="space-y-3">
      {/* Pill-style segmented control - matching navbar filter style */}
      <div className="inline-flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = theme === option.value;
          const Icon = option.icon;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleThemeClick(option.value)}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold 
                border transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 
                focus:ring-offset-slate-900 dark:focus:ring-offset-slate-900
                ${isActive
                  ? 'bg-teal-500/20 text-teal-300 border-teal-400/40 shadow-[0_0_20px_rgba(94,234,212,0.25)] dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-400/40'
                  : 'text-slate-500 dark:text-gray-400 border-slate-300 dark:border-slate-700/70 hover:text-slate-700 dark:hover:text-white hover:border-teal-400/50 dark:hover:border-teal-500/40 bg-slate-100/50 dark:bg-transparent'
                }
              `}
              aria-pressed={isActive}
              aria-label={`Select ${option.label} theme`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : ''}`} />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Helper text with current state */}
      <p className="text-xs text-slate-500 dark:text-gray-400">
        Your theme preference is saved on this device.
        {effectiveTheme && (
          <span className="ml-2 text-teal-500 dark:text-teal-400 font-medium">
            (Currently: {effectiveTheme.charAt(0).toUpperCase() + effectiveTheme.slice(1)})
          </span>
        )}
      </p>
    </div>
  );
};

export default ThemeToggleSegmented;

