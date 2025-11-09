import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';
import SelectMenu from '../Shared/SelectMenu';
import logo from '../../assets/images/logo.png';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, loading, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    status: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Fix white bar by setting body background directly
  useEffect(() => {
    const originalBodyMargin = document.body.style.margin;
    const originalBodyPadding = document.body.style.padding;
    const originalBodyBackground = document.body.style.background;
    const originalHtmlBackground = document.documentElement.style.background;
    
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = 'linear-gradient(to bottom right, #1e293b, #0f766e, #1e293b)';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.minHeight = '100vh';
    
    document.documentElement.style.background = 'linear-gradient(to bottom right, #1e293b, #0f766e, #1e293b)';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    
    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.padding = originalBodyPadding;
      document.body.style.background = originalBodyBackground;
      document.documentElement.style.background = originalHtmlBackground;
    };
  }, []);

  const statusOptions = [
    { value: '', label: 'Select status' },
    { value: 'employed', label: 'Employed' },
    { value: 'self-employed', label: 'Self-Employed' },
    { value: 'student', label: 'Student' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'retired', label: 'Retired' },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?\d{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Please select your status';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Use 8+ characters with a mix of letters & numbers';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and privacy policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // TODO: Replace with actual signup API call
    console.log('Signing up with:', formData);
    
    // Simulate signup (replace with actual logic)
    const result = await signup?.(formData);
    
    if (result?.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 overflow-auto">
      {/* Decorative animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
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
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-3 tracking-tight">Create Account</h1>
            <p className="text-gray-400 text-sm font-medium">Secure onboarding with modern finance standards</p>
          </div>

          {/* Signup Form */}
          <div className="relative group">
            {/* Glow effect on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-20 blur transition duration-500"></div>

            <div className="relative bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
              {/* Auth Error Message */}
              {authError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm animate-shake">
                  <p className="text-sm text-red-300 font-medium">{authError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-gray-200 text-sm font-semibold tracking-wide">
                    Full name
                  </label>
                <InputField
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Jane Doe"
                  error={errors.fullName}
                  disabled={loading}
                />
              </div>

                {/* Email */}
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

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block text-gray-200 text-sm font-semibold tracking-wide">
                    Phone number
                  </label>
                  <InputField
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1 555 123 4567"
                    error={errors.phoneNumber}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Include country code if outside your region
                  </p>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="block text-gray-200 text-sm font-semibold tracking-wide">
                    Address
                  </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street, City, State/Province, ZIP/Postal, Country"
                  disabled={loading}
                  rows="3"
                  className={`
                    w-full px-4 py-3 
                    bg-slate-700/50 
                    border ${errors.address ? 'border-red-500' : 'border-slate-600'} 
                    rounded-lg 
                    text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                    resize-none
                  `}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-400">{errors.address}</p>
                )}
              </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-gray-200 text-sm font-semibold tracking-wide">
                    Employment Status
                  </label>
                <SelectMenu
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  options={statusOptions}
                  error={errors.status}
                  disabled={loading}
                />
              </div>

                {/* Password Fields - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
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
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="block text-gray-200 text-sm font-semibold tracking-wide">
                      Confirm password
                    </label>
                    <InputField
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      error={errors.confirmPassword}
                      showPasswordToggle
                      showPassword={showConfirmPassword}
                      onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Requirements */}
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Use 8+ characters with a mix of letters & numbers
                </p>

                {/* Terms and Conditions Checkbox */}
                <div className="space-y-2">
                  <label className="flex items-start cursor-pointer group">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="mt-1 w-4 h-4 text-teal-500 bg-slate-700 border-slate-600 rounded focus:ring-teal-500 focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-gray-300">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/terms')}
                        className="text-teal-400 hover:text-teal-300 underline underline-offset-2 font-medium"
                      >
                        Terms
                      </button>
                      {' '}and{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/privacy')}
                        className="text-teal-400 hover:text-teal-300 underline underline-offset-2 font-medium"
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="ml-7 text-sm text-red-400">{errors.agreeToTerms}</p>
                  )}
                </div>

                {/* Create Account Button */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading}
                  className="!bg-gradient-to-r !from-yellow-500 !to-yellow-600 hover:!from-yellow-600 hover:!to-yellow-700 !text-slate-900 font-bold !shadow-lg hover:!shadow-yellow-500/20"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </>
                    )}
                  </span>
                </Button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700/50"></div>
                  </div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <span className="text-gray-400 text-sm">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-teal-400 hover:text-teal-300 transition-all duration-200 font-medium hover:underline underline-offset-4"
                      disabled={loading}
                    >
                      Log in
                    </button>
                  </span>
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

export default SignUpPage;