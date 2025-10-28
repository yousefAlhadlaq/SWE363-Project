import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';

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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-800 via-teal-900 to-slate-800 overflow-auto">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Reset your password</h1>
            <p className="text-gray-300 text-sm">
              Enter the code sent to your email and choose a new password.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            {/* Resend Success Message */}
            {resendSuccess && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-sm text-green-400 text-center">
                  ✓ Code resent successfully!
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Verification Code */}
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Verification Code
                </label>
                <InputField
                  type="text"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit code"
                  error={errors.verificationCode}
                  disabled={loading}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Check your inbox for the code we sent.
                </p>
              </div>

              {/* New Password */}
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
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
                <p className="text-xs text-gray-400 mt-2">
                  Use at least 8 characters with a mix of letters & numbers.
                </p>
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
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
                className="!bg-yellow-500 hover:!bg-yellow-600 !text-slate-900 font-semibold mb-4"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>

              {/* Footer Links */}
              <div className="flex justify-between items-center text-sm">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-teal-400 hover:text-teal-300 transition-colors"
                  disabled={loading}
                >
                  Back to login
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-teal-400 hover:text-teal-300 transition-colors"
                  disabled={loading || resendLoading}
                >
                  {resendLoading ? 'Sending...' : 'Resend code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;