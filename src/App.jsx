import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import LoadingScreen from './components/Shared/LoadingScreen';
import { useAuth } from './context/AuthContext';
import './styles/globals.css';

function AppContent() {
  const { authLoading } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const shouldShowLoader = authLoading || isPageLoading;

  return (
    <div className="min-h-screen bg-page">
      {shouldShowLoader && <LoadingScreen />}
      <AppRoutes />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
