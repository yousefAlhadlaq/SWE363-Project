import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Shared/Navbar';
import LoadingScreen from './components/Shared/LoadingScreen';
import { useAuth } from './context/AuthContext';
import './styles/globals.css';

function AppContent() {
  const location = useLocation();
  const { loading: authLoading } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Define routes where Navbar should NOT appear
  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const shouldShowNavbar = !authRoutes.includes(location.pathname);
  const shouldShowLoader = authLoading || isPageLoading;

  return (
    <div className="min-h-screen bg-page">
      {shouldShowNavbar && <Navbar />}
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
