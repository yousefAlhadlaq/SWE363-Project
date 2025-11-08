import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';
import SelectMenu from '../Shared/SelectMenu';


import logo from '../../assets/images/logo.png';



const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    accountHolder: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Fix white bar by setting body background directly
  useEffect(() => {
    // Save original styles
    const originalBodyMargin = document.body.style.margin;
    const originalBodyPadding = document.body.style.padding;
    const originalBodyBackground = document.body.style.background;
    const originalHtmlBackground = document.documentElement.style.background;
    
    // Apply fix
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = 'linear-gradient(to bottom right, #1e293b, #073733ff, #1e293b)';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.minHeight = '100vh';
    
    // Also fix html element
    document.documentElement.style.background = 'linear-gradient(to bottom right, #1e293b, #0f766e, #1e293b)';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    
    // Cleanup function
    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.padding = originalBodyPadding;
      document.body.style.background = originalBodyBackground;
      document.documentElement.style.background = originalHtmlBackground;
    };
  }, []);

  const accountHolderOptions = [
    { value: '', label: 'Select name' },
    { value: 'user', label: 'Regular User' },
    { value: 'advisor', label: 'Financial Advisor' },
    { value: 'admin', label: 'Administrator' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.accountHolder) {
      newErrors.accountHolder = 'Please select an account holder';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e, userType = 'user') => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password, userType);
    
    if (result.success) {
      switch(userType) {
        case 'advisor':
          navigate('/advisor-dashboard');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/dashboard');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-800 via-teal-900 to-slate-800 overflow-auto">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <img 
                src={logo}
                alt="Guroosh Logo" 
                className="w-20 h-20 mx-auto rounded-2xl shadow-lg object-cover"
                onError={(e) => {
                  console.error('Logo failed to load. Check the path!');
                  // Hide image if it fails to load
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Guroosh</h1>
            <p className="text-gray-300 text-sm">Secure access to your financial hub</p>
          </div>

          {/* Login Form */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            {/* Auth Error Message */}
            {authError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{authError}</p>
              </div>
            )}

            <form onSubmit={(e) => handleLogin(e, formData.accountHolder || 'user')}>
              {/* Account Holder Dropdown */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Account Holder
                </label>
                <SelectMenu
                  name="accountHolder"
                  value={formData.accountHolder}
                  onChange={handleInputChange}
                  options={accountHolderOptions}
                  error={errors.accountHolder}
                  placeholder="Select name"
                />
                <p className="text-xs text-gray-400 mt-1">Choose which profile to access</p>
              </div>

              {/* Email Input */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email
                </label>
                <InputField
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@domain.com"
                  error={errors.email}
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Password
                </label>
                <InputField
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  error={errors.password}
                  showPasswordToggle
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  disabled={loading}
                />
              </div>

              {/* Login Buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </Button>
                
                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  onClick={(e) => handleLogin(e, 'advisor')}
                  disabled={loading}
                >
                  Log In as Financial Advisor
                </Button>
                
                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  onClick={(e) => handleLogin(e, 'admin')}
                  disabled={loading}
                >
                  Log In as Admin
                </Button>
              </div>

              {/* Footer Links */}
              <div className="flex justify-between items-center text-sm">
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-teal-400 hover:text-teal-300 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Create account
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;