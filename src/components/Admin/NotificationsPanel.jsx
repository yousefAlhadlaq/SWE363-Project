import React, { useCallback, useEffect, useMemo, useState } from 'react';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';
import AdminLayout from './AdminLayout';
import notificationService from '../../services/notificationService';

function NotificationsPanel() {
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    targetAudience: 'all'
  });

  const [notifications, setNotifications] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await notificationService.getAllNotifications(100);
      const payload = response?.data ?? response ?? {};
      const fetched = payload.notifications || payload?.data?.notifications || [];
      setNotifications(fetched);
    } catch (error) {
      console.error('Failed to load notifications history:', error);
      setHistoryError(error?.response?.data?.error || 'Unable to load notification history.');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleChange = (e) => {
    setNotification({
      ...notification,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setStatusMessage(null);
    setIsSubmitting(true);
    try {
      await notificationService.sendAdminNotification(notification);
      setStatusMessage({ type: 'success', text: 'Notification broadcast successfully.' });
      setNotification({
        title: '',
        message: '',
        type: 'info',
        targetAudience: 'all'
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to send notification:', error);
      setStatusMessage({
        type: 'error',
        text: error?.response?.data?.error || 'Failed to send notification.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const audienceLabel = useMemo(() => ({
    all: 'all',
    advisors: 'advisors',
    clients: 'clients'
  }), []);

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
            {statusMessage && (
              <p
                className={`text-sm font-medium ${
                  statusMessage.type === 'error' ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {statusMessage.text}
              </p>
            )}
            <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Notification'}
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
              {historyLoading ? 'Loading...' : `${notifications.length} total records`}
            </span>
          </header>
          <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-2">
            {historyError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-400/40 text-rose-200 text-sm">
                {historyError}
              </div>
            )}
            {!historyError && !historyLoading && notifications.length === 0 && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-sm text-gray-400">
                No notifications have been sent yet.
              </div>
            )}
            {!historyLoading && notifications.map((notif) => {
              const key = notif._id || notif.id;
              const createdAt = notif.createdAt ? new Date(notif.createdAt).toLocaleString() : notif.date;
              const type = notif.type || 'info';
              return (
                <article
                  key={key}
                  className="p-4 rounded-2xl bg-white/10 border border-white/10"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{notif.title}</h3>
                      <p className="text-sm text-gray-400">{notif.message}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {createdAt}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs font-semibold">
                    <span
                      className={`px-3 py-1 rounded-full border ${typeChipStyles[type] || typeChipStyles.info}`}
                    >
                      {type}
                    </span>
                    <span className="px-3 py-1 rounded-full border border-emerald-400/50 bg-emerald-400/10 text-emerald-100">
                      Sent
                    </span>
                    <span className="px-3 py-1 rounded-full border border-white/10 text-gray-300">
                      Audience: {audienceLabel[notif.metadata?.audience] || audienceLabel[notif.targetAudience] || notif.targetAudience}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

export default NotificationsPanel;
