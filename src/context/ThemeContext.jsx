import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'system';
  return localStorage.getItem('guroosh_theme') || 'system';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getStoredTheme);

  // Function to detect system theme preference
  const getSystemTheme = useCallback(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const resolveTheme = useCallback((selectedTheme) => {
    return selectedTheme === 'system' ? getSystemTheme() : selectedTheme;
  }, [getSystemTheme]);

  const [effectiveTheme, setEffectiveTheme] = useState(() => resolveTheme(getStoredTheme()));

  // Apply theme to document
  const applyTheme = useCallback((themeToApply) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Remove both classes first to ensure clean state
    root.classList.remove('light', 'dark');

    // Add the appropriate class
    if (themeToApply === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
  }, []);

  // Update theme and save to localStorage
  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('guroosh_theme', newTheme);
  }, []);

  // Handle theme changes
  useEffect(() => {
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    setEffectiveTheme(resolved);

    // Listen for system theme changes when in system mode
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleSystemThemeChange = (e) => {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        applyTheme(newSystemTheme);
        setEffectiveTheme(newSystemTheme);
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleSystemThemeChange);
        return () => mediaQuery.removeListener(handleSystemThemeChange);
      }
    }
  }, [theme, resolveTheme, applyTheme]);

  const value = useMemo(() => ({
    theme,              // Current theme setting: 'system', 'light', or 'dark'
    setTheme,           // Function to change theme
    effectiveTheme,     // The actual theme being applied
  }), [theme, setTheme, effectiveTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
