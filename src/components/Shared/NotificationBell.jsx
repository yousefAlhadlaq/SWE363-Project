import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, X, Check, AlertCircle, Info } from 'lucide-react';
import notificationService from '../../services/notificationService';

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const dropdownRef = useRef(null);

  const extractData = (response) => response?.data ?? response ?? {};

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.getAllNotifications(25);
      const payload = extractData(response);
      const history = payload.notifications ?? [];
      const unread = typeof payload.unreadCount === 'number'
        ? payload.unreadCount
        : history.filter((n) => !n.read).length;
      setNotifications(history);
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      loadNotifications();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, loadNotifications]);

  useEffect(() => {
    if (!isOpen) {
      setActionError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'error':
        return <X className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  const handleMarkAsRead = async (id) => {
    if (!id) return;
    try {
      const response = await notificationService.markAsRead(id);
      const payload = extractData(response);
      setNotifications((prev) => prev.map((n) =>
        (n._id || n.id) === id ? { ...n, read: true } : n
      ));
      if (typeof payload.unreadCount === 'number') {
        setUnreadCount(payload.unreadCount);
      } else {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setActionError(null);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setActionError('Could not mark notification as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      const payload = extractData(response);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(payload.unreadCount ?? 0);
      setActionError(null);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setActionError('Could not mark notifications as read.');
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!id) return;
    try {
      const response = await notificationService.deleteNotification(id);
      const payload = extractData(response);
      setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
      if (typeof payload.unreadCount === 'number') {
        setUnreadCount(payload.unreadCount);
      }
      setActionError(null);
    } catch (err) {
      console.error('Error deleting notification:', err);
      setActionError('Could not delete notification.');
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
      setActionError(null);
    } catch (err) {
      console.error('Error clearing notifications:', err);
      setActionError('Could not clear notifications.');
    }
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-all duration-200 group"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            {unreadCount > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[450px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-gray-400 font-medium">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-rose-200 font-medium">{error}</p>
                <p className="text-xs text-rose-200/70 mt-1">Try reopening the panel to retry.</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No notifications</p>
                <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {actionError && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs">
                    {actionError}
                  </div>
                )}
                {notifications.map((notification) => {
                  const id = notification._id || notification.id;
                  const createdAt = formatTimestamp(notification.createdAt)
                    || notification.timestamp;
                  const type = notification.type || 'info';
                  return (
                  <div
                    key={id}
                    className={`p-3 rounded-xl border transition-all hover:bg-white/5 ${
                      notification.read ? 'opacity-60' : ''
                    } ${getBgColor(type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-white">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0 mt-1.5"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-300 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {createdAt}
                          </span>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(id)}
                                className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
                              >
                                Mark read
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(id)}
                              className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
              <button
                onClick={handleClearAll}
                className="w-full px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-red-200 text-sm font-medium transition-all"
              >
                Clear All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
