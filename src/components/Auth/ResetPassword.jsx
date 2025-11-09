import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';
import logo from '../../assets/images/logo.png';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [formData, setFormData] = useState({
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Limit verification code to 6 digits
    if (name === 'verificationCode') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.verificationCode) {
      newErrors.verificationCode = 'Verification code is required';
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = 'Code must be 6 digits';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Use at least 8 characters with a mix of letters & numbers';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Resetting password with code:', formData.verificationCode);
      
      // Success - navigate to login
      navigate('/login', { 
        state: { 
          message: 'Password reset successful! Please login with your new password.' 
        } 
      });
      
    } catch (err) {
      setErrors({ 
        verificationCode: err.message || 'Invalid code or password reset failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Resending code to:', emailFromState);
      setResendSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setResendSuccess(false), 3000);
      
    } catch (err) {
      setErrors({ 
        verificationCode: 'Failed to resend code. Please try again.' 
      });
    } finally {
      setResendLoading(false);
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-3 tracking-tight">
              Reset Password
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              Enter the code sent to your email and choose a new password
            </p>
          </div>

          {/* Form Card */}
          <div className="relative group">
            {/* Glow effect on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-20 blur transition duration-500"></div>

            <div className="relative bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
              {/* Resend Success Message */}
              {resendSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl backdrop-blur-sm animate-fade-in">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-green-300 font-medium">Code resent successfully!</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Verification Code */}
                <div className="space-y-2">
                  <label className="block text-gray-200 text-sm font-semibold tracking-wide">
                    Verification Code
                  </label>
                  <InputField
                    type="text"
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleInputChange}
                    placeholder="000000"
                    error={errors.verificationCode}
                    disabled={loading}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Check your inbox for the 6-digit code we sent
                  </p>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="block text-gray-200 text-sm font-semibold tracking-wide">
                    New Password
                  </label>
                  <InputField
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    error={errors.newPassword}
                    showPasswordToggle
                    showPassword={showNewPassword}
                    onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Use at least 8 characters with a mix of letters & numbers
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-gray-200 text-sm font-semibold tracking-wide">
                    Confirm Password
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

                {/* Reset Password Button */}
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
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </>
                    )}
                  </span>
                </Button>

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
                    onClick={() => navigate('/login')}
                    className="group text-teal-400 hover:text-teal-300 transition-all duration-200 font-medium flex items-center gap-1"
                    disabled={loading}
                  >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to login
                  </button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="group text-teal-400 hover:text-teal-300 transition-all duration-200 font-medium flex items-center gap-1"
                    disabled={loading || resendLoading}
                  >
                    <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {resendLoading ? 'Sending...' : 'Resend code'}
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

export default ResetPasswordPage;