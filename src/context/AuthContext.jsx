import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { getUser } from '../utils/api';

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
  const [loading, setLoading] = useState(false); // Operation loading (login, signup, etc.)
  const [authLoading, setAuthLoading] = useState(true); // Initial auth check loading
  const [error, setError] = useState(null);

  // Restore session on app startup - runs ONCE
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    console.log('🔄 Restoring session...');
    setAuthLoading(true);

    try {
      const token = localStorage.getItem('token');
      const storedUser = getUser();

      if (token && storedUser) {
        console.log('✅ Session found, restoring user:', storedUser.email);
        setUser(storedUser);

        // Optionally validate token by fetching current user
        try {
          await fetchCurrentUser();
        } catch (err) {
          console.warn('⚠️ Token validation failed, using cached user');
        }
      } else {
        console.log('❌ No session found');
      }
    } catch (err) {
      console.error('❌ Session restoration failed:', err);
      // Clear invalid session
      logout();
    } finally {
      setAuthLoading(false);
      console.log('✅ Auth initialization complete');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      // Token might be expired, logout
      throw err;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({
        email,
        password
      });

      if (response.success && response.user) {
        console.log('✅ Login successful:', response.user.email);
        setUser(response.user);
        return { success: true, user: response.user, role: response.user.role };
      } else {
        throw new Error(response.error || 'Login failed');
      }
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
      const response = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        employmentStatus: formData.status || formData.employmentStatus,
        userType: formData.userType,
      });

      if (response.success && response.user) {
        setUser(response.user);
        return {
          success: true,
          user: response.user,
          role: response.user.role,
          verificationCode: response.verificationCode // For development
        };
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email, code) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.verifyEmail(email, code);

      if (response.success) {
        // Update user email verification status
        if (user && user.email === email) {
          const updatedUser = { ...user, isEmailVerified: true };
          setUser(updatedUser);
        }
        return { success: true, message: response.message };
      } else {
        throw new Error(response.error || 'Verification failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Verification failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.resendVerificationCode(email);

      if (response.success) {
        return {
          success: true,
          message: response.message,
          verificationCode: response.verificationCode // For development
        };
      } else {
        throw new Error(response.error || 'Failed to resend code');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to resend code. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.forgotPassword(email);

      if (response.success) {
        return {
          success: true,
          message: response.message,
          resetCode: response.resetCode // For development
        };
      } else {
        throw new Error(response.error || 'Failed to send reset code');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to send reset code. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, verificationCode, newPassword) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.resetPassword(email, verificationCode, newPassword);

      if (response.success) {
        return { success: true, message: response.message };
      } else {
        throw new Error(response.error || 'Password reset failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Password reset failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    authService.logout();
    setUser(null);
    setError(null);
    setAuthLoading(false); // Ensure authLoading is false after logout
  };

  const updateProfile = async (updates) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.updateProfile(updates);

      if (response.success && response.user) {
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Profile update failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isAdvisor = () => {
    return user?.isAdvisor === true || user?.role === 'advisor';
  };

  const value = {
    user,
    loading,
    authLoading, // ✅ NEW: Authentication initialization state
    error,
    login,
    signup,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile,
    isAuthenticated,
    hasRole,
    isAdvisor,
    setError,
    restoreSession, // ✅ NEW: Manual session restore (if needed)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
