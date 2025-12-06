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
    {
      value: 'available',
      label: 'Available',
      indicator: 'bg-emerald-500 dark:bg-emerald-400',
      activeClasses:
        'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-[0_15px_35px_rgba(16,185,129,0.15)] dark:border-emerald-400/60 dark:bg-emerald-400/10 dark:text-emerald-100'
    },
    {
      value: 'busy',
      label: 'Busy',
      indicator: 'bg-amber-400',
      activeClasses:
        'border-amber-300 bg-amber-50 text-amber-700 shadow-[0_15px_35px_rgba(251,191,36,0.15)] dark:border-amber-400/60 dark:bg-amber-400/10 dark:text-amber-100'
    },
    {
      value: 'offline',
      label: 'Offline',
      indicator: 'bg-slate-400',
      activeClasses:
        'border-slate-300 bg-slate-50 text-slate-700 shadow-[0_15px_35px_rgba(148,163,184,0.2)] dark:border-slate-400/60 dark:bg-slate-500/10 dark:text-slate-100'
    }
  ];

  const panelClasses = 'rounded-3xl p-6 backdrop-blur-xl border transition-all duration-300 shadow-[0_24px_65px_rgba(15,23,42,0.08)] bg-white/90 border-slate-200 dark:bg-slate-900/60 dark:border-white/10 dark:shadow-[0_12px_45px_rgba(1,6,12,0.65)]';
  const descriptionClasses = 'text-sm text-slate-500 dark:text-slate-400';
  const checkboxClasses = 'w-5 h-5 rounded border-2 border-slate-300 text-teal-500 focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 dark:border-white/30 dark:bg-slate-900/60';
  const timeInputClasses = 'w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent dark:bg-slate-900/60 dark:border-white/10 dark:text-white';
  const controlInputClasses = 'w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent dark:bg-slate-900/60 dark:border-white/10 dark:text-white';
  const inactiveStatusClasses = 'border-slate-200 bg-white/80 text-slate-700 hover:border-teal-200 hover:shadow-[0_15px_35px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20';

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
    <div className="relative flex min-h-screen bg-page text-slate-900 dark:text-slate-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-10 w-72 h-72 bg-teal-200/40 rounded-full blur-3xl animate-pulse dark:bg-teal-500/10"></div>
        <div className="absolute bottom-20 right-16 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse dark:bg-blue-500/10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-purple-100/30 dark:bg-purple-500/5 rounded-full blur-[180px]"></div>
      </div>

      <div className="relative z-10">
        <FinancialSidebar />
      </div>

      <div className="relative flex-1 p-4 sm:p-8 lg:ml-64 pt-24 z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-8 h-8 text-teal-500" />
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Availability Settings</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Manage your availability status and working hours. Clients will see your current status when booking sessions.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Current Status */}
            <div className={panelClasses}>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-teal-500" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Current Status</h2>
              </div>
              <p className={`${descriptionClasses} mb-4`}>
                Your status is visible to clients and affects session booking availability
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statusOptions.map((option) => {
                  const isActive = availability.status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleStatusChange(option.value)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        isActive ? option.activeClasses : inactiveStatusClasses
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-3.5 h-3.5 rounded-full mx-auto mb-2 ${option.indicator}`}></div>
                        <p className="font-semibold">{option.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Working Hours */}
            <div className={panelClasses}>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-teal-500" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Weekly Schedule</h2>
              </div>
              <p className={`${descriptionClasses} mb-6`}>
                Set your working hours for each day of the week
              </p>

              <div className="space-y-4">
                {daysOfWeek.map((day) => {
                  const enabled = availability.workingHours[day].enabled;
                  return (
                    <div
                      key={day}
                      className={`p-4 rounded-2xl border transition-all ${
                        enabled
                          ? 'bg-white/95 border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:bg-slate-900/60 dark:border-white/15'
                          : 'bg-white/70 border-slate-100 opacity-70 dark:bg-white/5 dark:border-white/5'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Day Toggle */}
                        <div className="flex items-center gap-3 md:w-40">
                          <input
                            type="checkbox"
                            id={`day-${day}`}
                            checked={enabled}
                            onChange={() => handleDayToggle(day)}
                            className={checkboxClasses}
                          />
                          <label htmlFor={`day-${day}`} className="text-slate-900 dark:text-white font-semibold cursor-pointer">
                            {dayLabels[day]}
                          </label>
                        </div>

                        {/* Time Inputs */}
                        {enabled && (
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex-1">
                              <label className="block text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-1">Start Time</label>
                              <input
                                type="time"
                                value={availability.workingHours[day].start}
                                onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                                className={timeInputClasses}
                              />
                            </div>
                            <span className="text-slate-400 dark:text-slate-500 mt-7">—</span>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-1">End Time</label>
                              <input
                                type="time"
                                value={availability.workingHours[day].end}
                                onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                                className={timeInputClasses}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Session Settings */}
            <div className={panelClasses}>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Session Settings</h2>
              <p className={`${descriptionClasses} mb-6`}>
                Configure your session parameters and capacity
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Max Daily Sessions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={availability.maxDailySessions}
                    onChange={(e) => handleSettingChange('maxDailySessions', e.target.value)}
                    className={controlInputClasses}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Maximum sessions per day</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Session Duration (min)
                  </label>
                  <select
                    value={availability.sessionDuration}
                    onChange={(e) => handleSettingChange('sessionDuration', e.target.value)}
                    className={controlInputClasses}
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Default session length</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Break Between (min)
                  </label>
                  <select
                    value={availability.breakBetweenSessions}
                    onChange={(e) => handleSettingChange('breakBetweenSessions', e.target.value)}
                    className={controlInputClasses}
                  >
                    <option value="0">No break</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                  </select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Buffer between sessions</p>
                </div>
              </div>
            </div>

            {/* Success/Error Message */}
            {saveStatus && (
              <div
                className={`p-4 rounded-xl border ${
                  saveStatus === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-200'
                    : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-200'
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
              className="!bg-gradient-to-r !from-teal-500 !via-blue-500 !to-purple-500 hover:!from-teal-400 hover:!to-blue-600 font-semibold shadow-lg hover:shadow-teal-500/20"
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
