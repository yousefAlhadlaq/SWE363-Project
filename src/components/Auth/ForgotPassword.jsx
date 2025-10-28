import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success - replace with actual API
      console.log('Sending reset code to:', email);
      
      setSuccess(true);
      
      // Navigate to reset password page after 2 seconds
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-800 via-teal-900 to-slate-800 overflow-auto">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Forgot your password?</h1>
            <p className="text-gray-300 text-sm">
              We'll send a 6-digit code to your email to reset it securely.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-sm text-green-400 text-center">
                  ✓ Reset code sent! Redirecting...
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && !success && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email
                </label>
                <InputField
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="name@domain.com"
                  error={error}
                  disabled={loading || success}
                />
                <p className="text-xs text-gray-400 mt-2">
                  Use the email associated with your Guroosh account.
                </p>
              </div>

              {/* Send Reset Code Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading || success}
                className="!bg-yellow-500 hover:!bg-yellow-600 !text-slate-900 font-semibold mb-4"
              >
                {loading ? 'Sending...' : success ? 'Code Sent!' : 'Send Reset Code'}
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
                  onClick={() => navigate('/support')}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  No access to email? <span className="text-teal-400">Contact support</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;