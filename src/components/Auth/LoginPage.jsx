import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';
import SelectMenu from '../Shared/SelectMenu';
import { PASSWORD_REQUIREMENTS, isPasswordStrong } from '../../utils/passwordRules';


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
    document.body.style.background = 'linear-gradient(to bottom right, #0f172a, rgba(15, 23, 42, 0.7), #0f172a)';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.minHeight = '100vh';

    // Also fix html element
    document.documentElement.style.background = 'linear-gradient(to bottom right, #0f172a, rgba(15, 23, 42, 0.7), #0f172a)';
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
    } else if (!isPasswordStrong(formData.password)) {
      newErrors.password = PASSWORD_REQUIREMENTS;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(formData.email, formData.password, formData.accountHolder);

      if (result.success) {
        // Use the role from the login result
        const userRole = result.role;

        switch(userRole) {
          case 'advisor':
            navigate('/financial-advisor');
            break;
          case 'admin':
            navigate('/admin');
            break;
          default:
            // Client role - redirect to home/dashboard
            navigate('/home');
        }
      } else {
        setErrors({ submit: result.error || 'Login failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-900/70 to-slate-900 overflow-auto">
      {/* Decorative animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="mb-6 relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
              <img
                src={logo}
                alt="Guroosh Logo"
                className="relative w-24 h-24 mx-auto rounded-3xl shadow-2xl object-cover ring-4 ring-white/10 hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  console.error('Logo failed to load. Check the path!');
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-3 tracking-tight">
              Guroosh
            </h1>
            <p className="text-gray-400 text-sm font-medium">Secure access to your financial hub</p>
          </div>

          {/* Login Form */}
          <div className="relative group">
            {/* Glow effect on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-20 blur transition duration-500"></div>

            <div className="relative bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
              {/* Auth Error Message */}
              {(authError || errors.submit) && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm animate-shake">
                  <p className="text-sm text-red-300 font-medium">{authError || errors.submit}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Account Holder Dropdown */}
                <div className="space-y-2">
                  <label className="block text-gray-200 text-sm font-semibold tracking-wide">
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
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Choose which profile to access
                  </p>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-gray-200 text-sm font-semibold tracking-wide">
                    Email Address
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
                <div className="space-y-2">
                  <label className="block text-gray-200 text-sm font-semibold tracking-wide">
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
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {PASSWORD_REQUIREMENTS}.
                  </p>
                </div>

                {/* Login Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={loading}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Logging in...
                        </>
                      ) : (
                        <>
                          Log In
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </span>
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700/50"></div>
                  </div>
                </div>

                {/* Footer Links */}
                <div className="flex justify-between items-center text-sm">
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="group text-teal-400 hover:text-teal-300 transition-all duration-200 disabled:opacity-50 font-medium flex items-center gap-1"
                    disabled={loading}
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create account
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-gray-400 hover:text-white transition-all duration-200 font-medium hover:underline underline-offset-4"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/40 backdrop-blur-sm rounded-full border border-slate-700/30 text-xs text-gray-400">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secured with end-to-end encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
