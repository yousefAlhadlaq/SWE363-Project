import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('guroosh_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('guroosh_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock backend response - replace with actual API call
      // In real implementation, the backend will return the user's role
      // For demo purposes, we'll determine role based on email pattern:
      // - emails containing 'advisor' → role: 'advisor'
      // - emails containing 'admin' → role: 'admin'
      // - all others → role: 'user'
      let userRole = 'user';
      if (email.toLowerCase().includes('advisor')) {
        userRole = 'advisor';
      } else if (email.toLowerCase().includes('admin')) {
        userRole = 'admin';
      }

      // Mock user data - replace with actual API response
      const userData = {
        id: '1',
        email,
        role: userRole,
        name: 'User Name',
        createdAt: new Date().toISOString(),
      };

      setUser(userData);
      localStorage.setItem('guroosh_user', JSON.stringify(userData));

      return { success: true, user: userData, role: userRole };
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock validation - replace with actual API
      if (formData.email === 'test@existing.com') {
        throw new Error('This email is already registered');
      }

      // Determine user role from formData.userType
      // In real implementation, backend will validate and assign the role
      const userRole = formData.userType || 'user';

      // Mock user data - replace with actual API response
      const userData = {
        id: Date.now().toString(),
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        status: formData.status,
        role: userRole,
        createdAt: new Date().toISOString(),
      };

      setUser(userData);
      localStorage.setItem('guroosh_user', JSON.stringify(userData));

      return { success: true, user: userData, role: userRole };
    } catch (err) {
      const errorMessage = err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('guroosh_user');
    setError(null);
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('guroosh_user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated,
    hasRole,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;