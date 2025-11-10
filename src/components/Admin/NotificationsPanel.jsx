import React, { useState } from 'react';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';
import AdminLayout from './AdminLayout';

function NotificationsPanel() {
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    targetAudience: 'all'
  });

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday',
      type: 'warning',
      date: '2024-01-10',
      sent: true
    },
    {
      id: 2,
      title: 'New Feature Released',
      message: 'Check out our new Zakah calculator',
      type: 'info',
      date: '2024-01-08',
      sent: true
    }
  ]);

  const handleChange = (e) => {
    setNotification({
      ...notification,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newNotification = {
      id: notifications.length + 1,
      ...notification,
      date: new Date().toISOString().split('T')[0],
      sent: false
    };
    setNotifications([newNotification, ...notifications]);
    setNotification({
      title: '',
      message: '',
      type: 'info',
      targetAudience: 'all'
    });
  };

  const typeChipStyles = {
    info: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100',
    warning: 'border-amber-400/40 bg-amber-400/10 text-amber-100',
    success: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100',
    error: 'border-rose-400/40 bg-rose-400/10 text-rose-100'
  };

  return (
    <AdminLayout
      accentLabel="Notifications"
      title="Notifications Control Center"
      description="Compose targeted announcements, review historical sends, and keep admins in sync."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-[0_12px_45px_rgba(1,6,12,0.75)]">
          <header className="mb-6">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
              Composer
            </p>
            <h2 className="text-2xl font-semibold text-white">
              Create Notification
            </h2>
          </header>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Title"
              type="text"
              name="title"
              value={notification.title}
              onChange={handleChange}
              placeholder="System update..."
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={notification.message}
                onChange={handleChange}
                rows={5}
                placeholder="Include clear action items for recipients..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-900/70 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400/70"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={notification.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900/70 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-teal-400/70"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Target Audience
                </label>
                <select
                  name="targetAudience"
                  value={notification.targetAudience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900/70 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-teal-400/70"
                >
                  <option value="all">All Users</option>
                  <option value="advisors">Advisors Only</option>
                  <option value="clients">Clients Only</option>
                </select>
              </div>
            </div>
            <Button type="submit" variant="primary" fullWidth>
              Send Notification
            </Button>
          </form>
        </section>

        <section className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-[0_12px_45px_rgba(1,6,12,0.75)]">
          <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
                History
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Notification Log
              </h2>
            </div>
            <span className="text-sm text-gray-500">
              {notifications.length} total records
            </span>
          </header>
          <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-2">
            {notifications.map((notif) => (
              <article
                key={notif.id}
                className="p-4 rounded-2xl bg-white/10 border border-white/10"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{notif.title}</h3>
                    <p className="text-sm text-gray-400">{notif.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {notif.date}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-semibold">
                  <span
                    className={`px-3 py-1 rounded-full border ${typeChipStyles[notif.type]}`}
                  >
                    {notif.type}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full border ${
                      notif.sent
                        ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-100'
                        : 'border-slate-400/40 bg-slate-500/10 text-slate-200'
                    }`}
                  >
                    {notif.sent ? 'Sent' : 'Draft'}
                  </span>
                  <span className="px-3 py-1 rounded-full border border-white/10 text-gray-300">
                    Audience: {notif.targetAudience}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

export default NotificationsPanel;
