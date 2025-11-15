import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const applyInitialTheme = () => {
  if (typeof window === 'undefined') return;

  const storedTheme = localStorage.getItem('guroosh_theme') || 'system';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const themeToApply = storedTheme === 'system' ? (prefersDark ? 'dark' : 'light') : storedTheme;

  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(themeToApply === 'dark' ? 'dark' : 'light');
};

applyInitialTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
