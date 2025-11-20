import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Shared/Sidebar';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import InputField from '../Shared/InputField';
import ThemeToggleSegmented from '../Shared/ThemeToggleSegmented';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();

  const [settings, setSettings] = useState({
    notifications: {
      transactionAlerts: true,
      budgetReminders: true,
      investmentUpdates: true,
      marketingEmails: true,
    },
    currency: 'USD',
    language: 'English',
  });

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Edit profile form - UPDATED to include fullName
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Fix white bar
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = 'linear-gradient(to bottom right, #0f172a, rgba(15, 23, 42, 0.7), #0f172a)';
    document.body.style.backgroundAttachment = 'fixed';

    return () => {
      document.body.style.background = '';
    };
  }, []);

  // Load user data when edit modal opens - UPDATED to include fullName
  useEffect(() => {
    if (showEditModal && user) {
      setEditForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        password: '',
        address: user.address || '',
      });
    }
  }, [showEditModal, user]);

  const handleNotificationToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // UPDATED validation to include fullName
  const validateEditForm = () => {
    const errors = {};
    
    if (!editForm.fullName) {
      errors.fullName = 'Full name is required';
    } else if (editForm.fullName.length < 2) {
      errors.fullName = 'Name must be at least 2 characters';
    }
    
    if (!editForm.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!editForm.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    }
    
    if (editForm.password && editForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!editForm.address) {
      errors.address = 'Address is required';
    }
    
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // UPDATED to save fullName
  const handleSaveChanges = async () => {
    if (!validateEditForm()) {
      return;
    }

    setSaving(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user profile in context - UPDATED to include fullName
      const updatedData = {
        fullName: editForm.fullName,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
      };
      
      // Only include password if it was changed
      if (editForm.password) {
        updatedData.password = editForm.password;
      }
      
      updateProfile(updatedData);
      
      setShowEditModal(false);
      // Show success message (optional)
      
    } catch (err) {
      setEditErrors({ general: 'Failed to save changes. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currencyOptions = [
    { value: 'USD', label: 'USD — United States Dollar' },
    { value: 'EUR', label: 'EUR — Euro' },
    { value: 'GBP', label: 'GBP — British Pound' },
    { value: 'SAR', label: 'SAR — Saudi Riyal' },
    { value: 'AED', label: 'AED — UAE Dirham' },
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'French', label: 'French' },
    { value: 'Spanish', label: 'Spanish' },
  ];

  return (
    <div className="flex min-h-full bg-gradient-to-br from-slate-900 via-slate-900/70 to-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-300 text-sm">Manage your preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile & Theme */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="bg-slate-800/95 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Name</label>
                    <p className="text-white text-lg font-medium">
                      {user?.fullName || 'Jordan Carter'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Email</label>
                    <p className="text-white">
                      {user?.email || 'jordan.carter@example.com'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Phone</label>
                    <p className="text-white">
                      {user?.phoneNumber || '+1 555 246 8100'}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowEditModal(true)}
                    className="mt-4"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="bg-slate-800/95 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
                <h3 className="text-white font-medium mb-4">Theme</h3>
                <ThemeToggleSegmented />
              </div>

              {/* Currency & Language */}
              <div className="bg-slate-800/95 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {currencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-2">
                      Example: <span className="text-white">$1,234.56</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {languageOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-2">
                      Content language used across the app.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Links */}
              <div className="bg-slate-800/95 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl space-y-3">
                <button
                  onClick={() => navigate('/help')}
                  className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white text-left transition-all"
                >
                  Help Center
                </button>
                <button
                  onClick={() => navigate('/support')}
                  className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white text-left transition-all"
                >
                  Contact Support
                </button>
                <button
                  onClick={() => navigate('/privacy')}
                  className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white text-left transition-all"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => navigate('/terms')}
                  className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white text-left transition-all"
                >
                  Terms of Service
                </button>
              </div>

              {/* Notifications */}
              <div className="bg-slate-800/95 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
                <h3 className="text-white font-medium mb-4">Transaction alerts</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Transaction alerts</span>
                    <button
                      onClick={() => handleNotificationToggle('transactionAlerts')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.transactionAlerts ? 'bg-teal-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.transactionAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Budget reminders</span>
                    <button
                      onClick={() => handleNotificationToggle('budgetReminders')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.budgetReminders ? 'bg-teal-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.budgetReminders ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Investment updates</span>
                    <button
                      onClick={() => handleNotificationToggle('investmentUpdates')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.investmentUpdates ? 'bg-teal-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.investmentUpdates ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Marketing emails</span>
                    <button
                      onClick={() => handleNotificationToggle('marketingEmails')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.marketingEmails ? 'bg-teal-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  Tip: Disable all to silence notifications.
                </p>
              </div>

              {/* Logout Button */}
              <div className="bg-slate-800/95 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => setShowLogoutModal(true)}
                  className="!bg-red-500 hover:!bg-red-600"
                >
                  Log out
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-xs">v1.0.4 © Guroosh</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal - UPDATED with Full Name field */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        subtitle="Update your name, contact info and password."
      >
        <div className="space-y-4">
          {/* Error Message */}
          {editErrors.general && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{editErrors.general}</p>
            </div>
          )}

          {/* Full Name - NEW FIELD */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Full Name
            </label>
            <InputField
              type="text"
              name="fullName"
              value={editForm.fullName}
              onChange={handleEditInputChange}
              placeholder="Jordan Carter"
              error={editErrors.fullName}
              disabled={saving}
            />
          </div>

          {/* Email and Phone - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <InputField
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditInputChange}
                placeholder="jordan.carter@example.com"
                error={editErrors.email}
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Phone number
              </label>
              <InputField
                type="tel"
                name="phoneNumber"
                value={editForm.phoneNumber}
                onChange={handleEditInputChange}
                placeholder="+1 555 246 8100"
                error={editErrors.phoneNumber}
                disabled={saving}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password <span className="text-gray-400 text-xs">(leave blank to keep current)</span>
            </label>
            <InputField
              type={showPassword ? "text" : "password"}
              name="password"
              value={editForm.password}
              onChange={handleEditInputChange}
              placeholder="••••••••"
              error={editErrors.password}
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              disabled={saving}
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={editForm.address}
              onChange={handleEditInputChange}
              placeholder="Street, City, State/Province, ZIP/Postal, Country"
              disabled={saving}
              rows="3"
              className={`w-full px-4 py-3 bg-slate-700/50 border ${
                editErrors.address ? 'border-red-500' : 'border-slate-600'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none`}
            />
            {editErrors.address && (
              <p className="mt-1 text-sm text-red-400">{editErrors.address}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              variant="primary"
              fullWidth
              onClick={handleSaveChanges}
              disabled={saving}
              className="!bg-yellow-500 hover:!bg-yellow-600 !text-slate-900 font-semibold"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
            
            <button
              onClick={() => setShowEditModal(false)}
              disabled={saving}
              className="w-full py-3 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm log out"
        subtitle="You'll need to sign in again to access your account."
        maxWidth="max-w-md"
      >
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowLogoutModal(false)}
          >
            Cancel
          </Button>
          
          <Button
            variant="danger"
            fullWidth
            onClick={handleLogout}
            className="!bg-red-500 hover:!bg-red-600"
          >
            Confirm log out
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileSettings;
