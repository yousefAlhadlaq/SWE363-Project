import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Shared/Navbar';
import './styles/globals.css';

function AppContent() {
  const location = useLocation();

  // Define routes where Navbar should NOT appear
  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const shouldShowNavbar = !authRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen">
      {shouldShowNavbar && <Navbar />}
      <main>
        <AppRoutes />
      </main>
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
