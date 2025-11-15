import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeSelector = ({ variant = 'default' }) => {
  const { theme, setTheme } = useTheme();

  // Enhanced advisor variant with modern card-style design
  if (variant === 'advisor') {
    return (
      <div className="space-y-3">
        <label className="block text-xs text-white/60 uppercase tracking-wide mb-3">Theme Preference</label>

        <div className="grid grid-cols-3 gap-3">
          {/* System Option */}
          <button
            onClick={() => setTheme('system')}
            className={`relative group rounded-xl p-4 transition-all duration-300 ${
              theme === 'system'
                ? 'bg-gradient-to-br from-teal-500/20 to-blue-500/20 border-2 border-teal-400 shadow-glow-teal'
                : 'bg-white/5 border-2 border-white/10 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            {/* Icon */}
            <div className={`mx-auto w-8 h-8 mb-2 transition-colors ${
              theme === 'system' ? 'text-teal-400' : 'text-white/60 group-hover:text-white/80'
            }`}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Label */}
            <p className={`text-sm font-medium transition-colors ${
              theme === 'system' ? 'text-white' : 'text-white/70 group-hover:text-white'
            }`}>
              System
            </p>

            {/* Selected indicator */}
            {theme === 'system' && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-400 shadow-glow-teal animate-pulse"></div>
            )}
          </button>

          {/* Light Option */}
          <button
            onClick={() => setTheme('light')}
            className={`relative group rounded-xl p-4 transition-all duration-300 ${
              theme === 'light'
                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400 shadow-glow-yellow'
                : 'bg-white/5 border-2 border-white/10 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            {/* Icon */}
            <div className={`mx-auto w-8 h-8 mb-2 transition-colors ${
              theme === 'light' ? 'text-yellow-400' : 'text-white/60 group-hover:text-white/80'
            }`}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>

            {/* Label */}
            <p className={`text-sm font-medium transition-colors ${
              theme === 'light' ? 'text-white' : 'text-white/70 group-hover:text-white'
            }`}>
              Light
            </p>

            {/* Selected indicator */}
            {theme === 'light' && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-400 shadow-glow-yellow animate-pulse"></div>
            )}
          </button>

          {/* Dark Option */}
          <button
            onClick={() => setTheme('dark')}
            className={`relative group rounded-xl p-4 transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-2 border-purple-400 shadow-lg shadow-purple-500/30'
                : 'bg-white/5 border-2 border-white/10 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            {/* Icon */}
            <div className={`mx-auto w-8 h-8 mb-2 transition-colors ${
              theme === 'dark' ? 'text-purple-400' : 'text-white/60 group-hover:text-white/80'
            }`}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>

            {/* Label */}
            <p className={`text-sm font-medium transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-white/70 group-hover:text-white'
            }`}>
              Dark
            </p>

            {/* Selected indicator */}
            {theme === 'dark' && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-500/50 animate-pulse"></div>
            )}
          </button>
        </div>

        <p className="text-xs text-white/50 mt-3">
          Synced across all pages. System follows your device preferences.
        </p>
      </div>
    );
  }

  // Default variant (simple buttons) - used for User Settings
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setTheme('system')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            theme === 'system'
              ? 'bg-slate-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          System
        </button>
        <button
          onClick={() => setTheme('light')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            theme === 'light'
              ? 'bg-slate-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            theme === 'dark'
              ? 'bg-slate-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Dark
        </button>
      </div>
      <p className="text-xs text-gray-400">
        Your theme preference is saved on this device.
      </p>
    </div>
  );
};

export default ThemeSelector;
