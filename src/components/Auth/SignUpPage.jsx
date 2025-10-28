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
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create your Guroosh account</h1>
            <p className="text-gray-300 text-sm">Secure onboarding with modern finance standards</p>
          </div>

          {/* Signup Form */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            {/* Auth Error Message */}
            {authError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
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
              <div className="mb-4">
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

              {/* Phone Number */}
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
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
                <p className="text-xs text-gray-400 mt-1">Include country code if outside your region.</p>
              </div>

              {/* Address */}
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
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
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Status
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Password */}
                <div>
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
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
              <p className="text-xs text-gray-400 mb-4">
                Use 8+ characters with a mix of letters & numbers
              </p>

              {/* Terms and Conditions Checkbox */}
              <div className="mb-6">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="mt-1 w-4 h-4 text-teal-500 bg-slate-700 border-slate-600 rounded focus:ring-teal-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-300">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/terms')}
                      className="text-teal-400 hover:text-teal-300 underline"
                    >
                      Terms
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/privacy')}
                      className="text-teal-400 hover:text-teal-300 underline"
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-400">{errors.agreeToTerms}</p>
                )}
              </div>

              {/* Create Account Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className="!bg-yellow-500 hover:!bg-yellow-600 !text-slate-900 font-semibold"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Login Link */}
              <div className="mt-4 text-center">
                <span className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-teal-400 hover:text-teal-300 transition-colors"
                    disabled={loading}
                  >
                    Log in
                  </button>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;