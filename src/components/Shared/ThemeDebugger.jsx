import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Theme Debugger Component
 * Add this temporarily to any page to debug theme switching
 * Shows: current theme, effective theme, HTML class, localStorage value
 */
const ThemeDebugger = () => {
  const { theme, effectiveTheme } = useTheme();
  const [htmlClass, setHtmlClass] = useState('');
  const [storageValue, setStorageValue] = useState('');

  useEffect(() => {
    // Check HTML class
    const rootClasses = document.documentElement.className;
    setHtmlClass(rootClasses || 'none');

    // Check localStorage
    const stored = localStorage.getItem('guroosh_theme') || 'not set';
    setStorageValue(stored);
  }, [theme]);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg shadow-2xl border border-white/20 text-xs font-mono max-w-xs z-50">
      <div className="font-bold mb-2 text-teal-400">🎨 Theme Debug Info</div>

      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Selected Theme:</span>
          <span className="ml-2 text-yellow-300">{theme}</span>
        </div>

        <div>
          <span className="text-gray-400">Effective Theme:</span>
          <span className="ml-2 text-green-300">{effectiveTheme}</span>
        </div>

        <div>
          <span className="text-gray-400">HTML Classes:</span>
          <span className="ml-2 text-purple-300">{htmlClass}</span>
        </div>

        <div>
          <span className="text-gray-400">localStorage:</span>
          <span className="ml-2 text-blue-300">{storageValue}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/20">
        <div className="text-gray-400 mb-1">Visual Test:</div>
        <div className="h-8 bg-white dark:bg-slate-900 rounded border-2 border-teal-500 flex items-center justify-center">
          <span className="text-black dark:text-white text-xs">
            {effectiveTheme === 'dark' ? 'DARK MODE ✓' : 'LIGHT MODE ✓'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ThemeDebugger;
