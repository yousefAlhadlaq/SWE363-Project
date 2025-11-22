import React, { useState } from 'react';
import { Calendar, Clock, Save, AlertCircle } from 'lucide-react';
import FinancialSidebar from '../Shared/FinancialSidebar';
import Button from '../Shared/Button';

function AdvisorAvailabilitySettings() {
  const [availability, setAvailability] = useState({
    status: 'available', // available, busy, offline
    workingHours: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '13:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' }
    },
    maxDailySessions: 8,
    sessionDuration: 60, // minutes
    breakBetweenSessions: 15 // minutes
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const statusOptions = [
    { value: 'available', label: 'Available', color: 'emerald' },
    { value: 'busy', label: 'Busy', color: 'amber' },
    { value: 'offline', label: 'Offline', color: 'slate' }
  ];

  const handleStatusChange = (newStatus) => {
    setAvailability({ ...availability, status: newStatus });
  };

  const handleDayToggle = (day) => {
    setAvailability({
      ...availability,
      workingHours: {
        ...availability.workingHours,
        [day]: {
          ...availability.workingHours[day],
          enabled: !availability.workingHours[day].enabled
        }
      }
    });
  };

  const handleTimeChange = (day, field, value) => {
    setAvailability({
      ...availability,
      workingHours: {
        ...availability.workingHours,
        [day]: {
          ...availability.workingHours[day],
          [field]: value
        }
      }
    });
  };

  const handleSettingChange = (field, value) => {
    setAvailability({ ...availability, [field]: parseInt(value) });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveStatus('');

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Saving availability:', availability);
      setSaveStatus('success');

      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-page text-slate-900 dark:text-slate-100">
      <FinancialSidebar />

      <div className="flex-1 p-8 ml-64 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-8 h-8 text-teal-400" />
              <h1 className="text-4xl font-bold text-white">Availability Settings</h1>
            </div>
            <p className="text-gray-400">
              Manage your availability status and working hours. Clients will see your current status when booking sessions.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Current Status */}
            <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-[0_12px_45px_rgba(1,6,12,0.75)]">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-teal-400" />
                <h2 className="text-2xl font-semibold text-white">Current Status</h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Your status is visible to clients and affects session booking availability
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleStatusChange(option.value)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      availability.status === option.value
                        ? `border-${option.color}-400 bg-${option.color}-400/10`
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                        option.value === 'available' ? 'bg-emerald-400' :
                        option.value === 'busy' ? 'bg-amber-400' :
                        'bg-slate-400'
                      }`}></div>
                      <p className="text-white font-semibold">{option.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-[0_12px_45px_rgba(1,6,12,0.75)]">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-teal-400" />
                <h2 className="text-2xl font-semibold text-white">Weekly Schedule</h2>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Set your working hours for each day of the week
              </p>

              <div className="space-y-4">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className={`p-4 rounded-2xl border transition-all ${
                      availability.workingHours[day].enabled
                        ? 'bg-white/10 border-white/20'
                        : 'bg-white/5 border-white/10 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Day Toggle */}
                      <div className="flex items-center gap-3 md:w-40">
                        <input
                          type="checkbox"
                          id={`day-${day}`}
                          checked={availability.workingHours[day].enabled}
                          onChange={() => handleDayToggle(day)}
                          className="w-5 h-5 rounded bg-slate-900/70 border-white/20 text-teal-500 focus:ring-2 focus:ring-teal-400"
                        />
                        <label htmlFor={`day-${day}`} className="text-white font-semibold cursor-pointer">
                          {dayLabels[day]}
                        </label>
                      </div>

                      {/* Time Inputs */}
                      {availability.workingHours[day].enabled && (
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-400 mb-1">Start Time</label>
                            <input
                              type="time"
                              value={availability.workingHours[day].start}
                              onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                          </div>
                          <span className="text-gray-500 mt-5">—</span>
                          <div className="flex-1">
                            <label className="block text-xs text-gray-400 mb-1">End Time</label>
                            <input
                              type="time"
                              value={availability.workingHours[day].end}
                              onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Settings */}
            <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-[0_12px_45px_rgba(1,6,12,0.75)]">
              <h2 className="text-2xl font-semibold text-white mb-4">Session Settings</h2>
              <p className="text-sm text-gray-400 mb-6">
                Configure your session parameters and capacity
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Daily Sessions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={availability.maxDailySessions}
                    onChange={(e) => handleSettingChange('maxDailySessions', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum sessions per day</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Session Duration (min)
                  </label>
                  <select
                    value={availability.sessionDuration}
                    onChange={(e) => handleSettingChange('sessionDuration', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Default session length</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Break Between (min)
                  </label>
                  <select
                    value={availability.breakBetweenSessions}
                    onChange={(e) => handleSettingChange('breakBetweenSessions', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="0">No break</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Buffer between sessions</p>
                </div>
              </div>
            </div>

            {/* Success/Error Message */}
            {saveStatus && (
              <div
                className={`p-4 rounded-xl border ${
                  saveStatus === 'success'
                    ? 'bg-green-500/10 border-green-500/30 text-green-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {saveStatus === 'success' ? (
                  <p className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Availability settings saved successfully!
                  </p>
                ) : (
                  <p className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Failed to save settings. Please try again.
                  </p>
                )}
              </div>
            )}

            {/* Save Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="!bg-gradient-to-r !from-teal-500 !to-blue-600 hover:!from-teal-600 hover:!to-blue-700"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Availability Settings
                  </>
                )}
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdvisorAvailabilitySettings;
