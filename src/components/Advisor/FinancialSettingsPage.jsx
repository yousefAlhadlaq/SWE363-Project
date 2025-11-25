import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FinancialSidebar from '../Shared/FinancialSidebar';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import InputField from '../Shared/InputField';
import ThemeToggleSegmented from '../Shared/ThemeToggleSegmented';
import { useAuth } from '../../context/AuthContext';
import { PASSWORD_REQUIREMENTS, isPasswordStrong } from '../../utils/passwordRules';

function FinancialSettingsPage() {
  // Modal states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showRecoveryCodesModal, setShowRecoveryCodesModal] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phoneNumber: '+1 555 123 7890',
    address: '123 Market Street, San Francisco, CA',
  });

  // Temporary profile for editing
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

  // Notifications state
  const [notifications, setNotifications] = useState({
    newMessages: true,
    newRequests: true,
    threadAssigned: true,
    mentions: true
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'English',
    currency: 'USD',
    timezone: 'UTC'
  });

  // Security state
  const [security, setSecurity] = useState({
    twoFactor: true
  });

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNotificationToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleSecurityToggle = () => {
    setSecurity({ ...security, twoFactor: !security.twoFactor });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

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

    if (editForm.password && !isPasswordStrong(editForm.password)) {
      errors.password = PASSWORD_REQUIREMENTS;
    }

    if (!editForm.address) {
      errors.address = 'Address is required';
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenEditProfile = () => {
    setEditForm({
      fullName: profile.fullName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      password: '',
      address: profile.address,
    });
    setEditErrors({});
    setShowPassword(false);
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async () => {
    if (!validateEditForm()) {
      return;
    }

    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setProfile({
        fullName: editForm.fullName,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
      });

      setShowEditProfileModal(false);
      // TODO: integrate API call for persistence
    } catch (err) {
      setEditErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    // Use the Auth context to log the user out and redirect to login
    try {
      logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setShowLogoutModal(false);
    navigate('/login');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleOpenRecoveryCodes = () => {
    setShowRecoveryCodesModal(true);
  };

  const handleCloseRecoveryCodes = () => {
    setShowRecoveryCodesModal(false);
  };

  const handleLogout = () => {
    // Convenience handler (not used by modal) - ensure it logs out and redirects
    try {
      logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-page text-slate-900 dark:text-slate-100">
      {/* Decorative animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400/15 dark:bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-300/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <FinancialSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative ml-64 pt-24">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">Advisor Settings</h1>
              <p className="text-slate-600 dark:text-white/70 mt-1">Manage your profile, availability, notifications, and preferences.</p>
            </div>
            <button className="px-4 py-2.5 bg-white text-slate-900 font-medium rounded-lg transition-all border border-slate-200 shadow-sm hover:border-teal-400 hover:bg-teal-50 dark:bg-slate-800/70 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700/50">
              Quick Edit
            </button>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Section */}
            <div className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all duration-200 shadow-sm dark:shadow-none">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </h2>
              <div className="space-y-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1">Name</p>
                  <p className="text-lg text-slate-900 dark:text-white font-semibold">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-sm text-slate-700 dark:text-gray-200">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                  <p className="text-sm text-slate-700 dark:text-gray-200">{profile.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1">Office</p>
                  <p className="text-sm text-slate-700 dark:text-gray-200">{profile.address}</p>
                </div>
              </div>
              <button
                onClick={handleOpenEditProfile}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 font-medium rounded-lg transition-all hover:border-teal-400 hover:bg-teal-50 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white"
              >
                Edit Profile
              </button>
            </div>

            {/* Support Section */}
            <div className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 hover-border-slate-300 dark:hover:border-slate-600/50 transition-all duration-200 shadow-sm dark:shadow-none">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Support
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-900 font-medium rounded-lg transition-all text-sm hover:border-teal-400 hover:bg-teal-50 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white">
                  Help Center
                </button>
                <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-900 font-medium rounded-lg transition-all text-sm hover:border-teal-400 hover:bg-teal-50 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white">
                  Contact
                </button>
                <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-900 font-medium rounded-lg transition-all text-sm hover:border-teal-400 hover:bg-teal-50 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white">
                  Terms
                </button>
                <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-900 font-medium rounded-lg transition-all text-sm hover:border-teal-400 hover:bg-teal-50 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-white">
                  Privacy
                </button>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm dark:shadow-none">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Notifications</h2>
              <div className="space-y-3">
                <ToggleItem
                  label="New messages"
                  checked={notifications.newMessages}
                  onChange={() => handleNotificationToggle('newMessages')}
                />
                <ToggleItem
                  label="New requests"
                  checked={notifications.newRequests}
                  onChange={() => handleNotificationToggle('newRequests')}
                />
                <ToggleItem
                  label="Thread assigned"
                  checked={notifications.threadAssigned}
                  onChange={() => handleNotificationToggle('threadAssigned')}
                />
                <ToggleItem
                  label="Mentions"
                  checked={notifications.mentions}
                  onChange={() => handleNotificationToggle('mentions')}
                />
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm dark:shadow-none">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Preferences</h2>
              <div className="space-y-4">
                {/* Language & Currency */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">Language</label>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm text-slate-900 focus:ring-2 focus:ring-brand-aqua focus:border-transparent dark:bg-white/10 dark:border-white/20 dark:text-white/80"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">Currency</label>
                    <select
                      value={preferences.currency}
                      onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm text-slate-900 focus:ring-2 focus:ring-brand-aqua focus:border-transparent dark:bg-white/10 dark:border-white/20 dark:text-white/80"
                    >
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                    </select>
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-xs text-slate-600 dark:text-white/60 mb-1">Timezone</label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm text-slate-900 focus:ring-2 focus:ring-brand-aqua focus:border-transparent dark:bg-white/10 dark:border-white/20 dark:text-white/80"
                  >
                    <option>UTC</option>
                    <option>EST</option>
                    <option>PST</option>
                    <option>GMT</option>
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-xs text-slate-600 dark:text-white/60 uppercase tracking-wide mb-3">Theme</label>
                  <ThemeToggleSegmented />
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm dark:shadow-none">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Security</h2>
              <div className="space-y-4">
                <ToggleItem
                  label="Two-factor authentication"
                  checked={security.twoFactor}
                  onChange={handleSecurityToggle}
                />
                <button 
                  onClick={handleOpenRecoveryCodes}
                  className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg transition-all text-sm hover:border-teal-400 hover:bg-teal-50 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20"
                >
                  View recovery codes
                </button>
              </div>
            </div>

            {/* Account Section - Full Width */}
            <div className="lg:col-span-3">
              <div className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm dark:shadow-none">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Account</h2>
                <button
                  onClick={handleOpenLogout}
                  className="w-full max-w-xs px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-all shadow-lg"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>

        <Modal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          title="Edit Profile"
          subtitle="Update your name, contact info, and password."
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            {editErrors.general && (
              <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-lg">
                <p className="text-sm text-red-300">{editErrors.general}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
              <InputField
                type="text"
                name="fullName"
                value={editForm.fullName}
                onChange={handleEditInputChange}
                placeholder="Alex Morgan"
                error={editErrors.fullName}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <InputField
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditInputChange}
                  placeholder="alex.morgan@example.com"
                  error={editErrors.email}
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Phone number</label>
                <InputField
                  type="tel"
                  name="phoneNumber"
                  value={editForm.phoneNumber}
                  onChange={handleEditInputChange}
                  placeholder="+1 555 123 7890"
                  error={editErrors.phoneNumber}
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Password <span className="text-xs text-white/50">(leave blank to keep current)</span>
              </label>
              <InputField
                type={showPassword ? 'text' : 'password'}
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
              <p className="mt-1 text-xs text-white/70">
                {PASSWORD_REQUIREMENTS}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Address</label>
              <textarea
                name="address"
                value={editForm.address}
                onChange={handleEditInputChange}
                rows="3"
                placeholder="Street, City, State/Province, ZIP, Country"
                disabled={saving}
                className={`w-full rounded-lg border px-4 py-3 text-sm text-white bg-brand-deep/60 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-aqua transition ${
                  editErrors.address ? 'border-red-500' : 'border-white/10'
                }`}
              />
              {editErrors.address && (
                <p className="mt-1 text-sm text-red-300">{editErrors.address}</p>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleSaveProfile}
                disabled={saving}
                className="!bg-brand-aqua !text-brand-midnight font-semibold hover:!bg-brand-aqua/90"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
              <button
                onClick={() => setShowEditProfileModal(false)}
                disabled={saving}
                className="w-full py-3 text-sm text-white/70 hover:text-white transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-brand-midnight/90 border border-white/10 rounded-2xl w-full max-w-md">
              {/* Modal Header */}
              <div className="border-b border-white/10 p-6">
                <h3 className="text-2xl font-bold text-white">Confirm Logout</h3>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-white/80">
                  Are you sure you want to log out? You'll need to sign in again to access your account.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-white/10 p-6 flex space-x-4">
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-all"
                >
                  Yes, Log Out
                </button>
                <button
                  onClick={handleCancelLogout}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recovery Codes Modal */}
        {showRecoveryCodesModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl dark:bg-brand-midnight/90 dark:border-white/10">
              {/* Modal Header */}
              <div className="border-b border-slate-200 p-6 flex justify-between items-center dark:border-white/10">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Recovery Codes</h3>
                <button
                  onClick={handleCloseRecoveryCodes}
                  className="text-slate-500 hover:text-slate-900 transition-colors dark:text-white/60 dark:hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-slate-600 text-sm mb-4 dark:text-white/60">
                  Save these codes in a safe place. You can use them to access your account if you lose your authentication device.
                </p>
                
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 dark:bg-brand-deep/60 dark:border-white/10">
                  {['ABCD-1234-EFGH', '5678-IJKL-9012', 'MNOP-3456-QRST', '7890-UVWX-YZAB', 'CDEF-1234-GHIJ', '5678-KLMN-OPQR'].map((code, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded dark:bg-white/5">
                      <span className="font-mono text-slate-900 dark:text-white">{code}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(code);
                          console.log('Copied:', code);
                        }}
                        className="text-brand-aqua hover:text-brand-aqua/80 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-brand-accent/10 border border-brand-accent/30 rounded-lg p-3">
                  <p className="text-brand-accent text-xs">
                    ⚠️ Each code can only be used once. Keep them secure and don't share them with anyone.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 p-6 dark:border-white/10">
                <button
                  onClick={handleCloseRecoveryCodes}
                  className="w-full px-6 py-3 bg-brand-aqua hover:bg-blue-500 text-white font-semibold rounded-lg transition-all"
                >
                  I've Saved My Codes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Toggle Item Component
const ToggleItem = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700 dark:text-white/80">{label}</span>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-teal-500 dark:bg-brand-aqua' : 'bg-slate-200 dark:bg-white/20'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default FinancialSettingsPage;
