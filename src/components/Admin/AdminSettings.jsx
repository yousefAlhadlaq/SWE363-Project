import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import ToggleSwitch from '../Shared/ToggleSwitch';
import { useAuth } from '../../context/AuthContext';

function AdminSettings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    enable2FA: true,
    weeklyDigest: false,
    incidentEmails: true,
    allowUserExports: false,
  });

  const [branding, setBranding] = useState({
    productName: 'Guroosh Admin',
    supportEmail: 'support@guroosh.com',
    primaryColor: '#0ea5e9',
  });

  const handleToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setBranding((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    // TODO: Connect to admin settings API
    console.log('Saving admin settings', { preferences, branding });
    alert('Settings saved');
  };

  const handleLogout = () => {
    try {
      logout();
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      navigate('/login');
    }
  };

  return (
    <AdminLayout title="Admin Settings" description="Configure platform and security defaults" accentLabel="Control Panel">
      <form onSubmit={handleSave} className="space-y-8">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-teal-200/80">Security</p>
              <h2 className="text-xl font-semibold text-white">Access Controls</h2>
            </div>
          </header>
          <div className="space-y-4">
            <ToggleSwitch
              label="Require two-factor authentication for admins"
              checked={preferences.enable2FA}
              onChange={() => handleToggle('enable2FA')}
            />
            <ToggleSwitch
              label="Send incident alerts to admin emails"
              checked={preferences.incidentEmails}
              onChange={() => handleToggle('incidentEmails')}
            />
            <ToggleSwitch
              label="Allow user data exports"
              checked={preferences.allowUserExports}
              onChange={() => handleToggle('allowUserExports')}
            />
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-teal-200/80">Branding</p>
              <h2 className="text-xl font-semibold text-white">Organization Details</h2>
            </div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase mb-1">Product name</label>
              <input
                type="text"
                name="productName"
                value={branding.productName}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase mb-1">Support email</label>
              <input
                type="email"
                name="supportEmail"
                value={branding.supportEmail}
                onChange={handleInputChange}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase mb-1">Primary color</label>
              <input
                type="color"
                name="primaryColor"
                value={branding.primaryColor}
                onChange={handleInputChange}
                className="h-10 w-full bg-slate-900/50 border border-white/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-teal-200/80">Communications</p>
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
            </div>
          </header>
          <div className="space-y-4">
            <ToggleSwitch
              label="Weekly activity digest"
              checked={preferences.weeklyDigest}
              onChange={() => handleToggle('weeklyDigest')}
            />
          </div>
        </section>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-3 text-sm font-semibold text-red-400 border border-red-400/40 rounded-lg hover:bg-red-500/10 transition"
          >
            Log out
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold rounded-lg transition shadow-lg"
          >
            Save Settings
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

export default AdminSettings;
