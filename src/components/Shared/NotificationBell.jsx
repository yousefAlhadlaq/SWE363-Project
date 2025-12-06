import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, AlertCircle, Info } from 'lucide-react';
import notificationService from '../../services/notificationService';

// Format timestamp to relative time - memoized outside component
const formatTimestamp = (timestamp) => {
  const now = new Date();
  const notifTime = new Date(timestamp);
  const diffMs = now - notifTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return notifTime.toLocaleDateString();
};

// Icon getter - memoized outside component
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

// Background color getter - memoized outside component
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

// Memoized notification item component
const NotificationItem = memo(function NotificationItem({ 
  notification, 
  onMarkRead, 
  onDelete, 
  onNavigate,
  loading 
}) {
  const handleClick = useCallback(() => {
    if (notification.category === 'advisor') {
      onNavigate();
    }
  }, [notification.category, onNavigate]);

  const handleMarkRead = useCallback((e) => {
    e.stopPropagation();
    onMarkRead(notification.id);
  }, [notification.id, onMarkRead]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(notification.id);
  }, [notification.id, onDelete]);

  return (
    <div
      onClick={handleClick}
      className={`p-3 rounded-xl border transition-all hover:bg-white/5 ${
        notification.category === 'advisor' ? 'cursor-pointer' : ''
      } ${notification.read ? 'opacity-60' : ''} ${getBgColor(notification.type)}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0 mt-1.5"></span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-gray-300 mb-2 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-slate-400 dark:text-gray-500">
              {notification.timestamp}
            </span>
            <div className="flex items-center gap-2">
              {!notification.read && (
                <button
                  onClick={handleMarkRead}
                  disabled={loading}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors disabled:opacity-50 py-1"
                >
                  Mark read
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium transition-colors disabled:opacity-50 py-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch notifications from backend - memoized
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getAllNotifications();

      if (response.success) {
        const fetchedNotifications = response.data.notifications.map(notif => ({
          id: notif._id,
          type: notif.type,
          category: notif.category,
          title: notif.title,
          message: notif.message,
          timestamp: formatTimestamp(notif.createdAt),
          read: notif.read,
          metadata: notif.metadata || {}
        }));

        setNotifications(fetchedNotifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  // Fetch unread count only (lightweight) - memoized
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();

      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    pollIntervalRef.current = setInterval(fetchUnreadCount, 30000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchUnreadCount]);

  // Fetch full notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Memoized handlers
  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleNavigate = useCallback(() => {
    setIsOpen(false);
    navigate('/financial-advice');
  }, [navigate]);

  const markAsRead = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await notificationService.markAsRead(id);

      if (response.success) {
        setNotifications(prev => prev.map(n =>
          n.id === id ? { ...n, read: true } : n
        ));
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationService.markAllAsRead();

      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await notificationService.deleteNotification(id);

      if (response.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationService.clearAllNotifications();

      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button - larger touch target on mobile */}
      <button
        onClick={toggleOpen}
        className="relative p-2 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200 group min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-6 h-6 text-slate-600 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown - responsive width */}
      {isOpen && (
        <div className="absolute right-0 sm:right-0 mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-[400px] max-h-[80vh] sm:max-h-[600px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in -right-2 sm:right-0">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 dark:from-slate-800/50 to-slate-100 dark:to-slate-900/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Notifications</h3>
              <button
                onClick={closeDropdown}
                className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white" />
              </button>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors disabled:opacity-50 py-1 px-2"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>

          {/* Notifications List - scrollable */}
          <div className="max-h-[50vh] sm:max-h-[450px] overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-gray-400 font-medium">No notifications</p>
                <p className="text-sm text-slate-400 dark:text-gray-500 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                    onNavigate={handleNavigate}
                    loading={loading}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 sm:p-3 border-t border-slate-200 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 dark:from-slate-900/50 to-slate-100 dark:to-slate-800/50">
              <button
                onClick={clearAll}
                disabled={loading}
                className="w-full px-4 py-2.5 sm:py-2 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 text-sm font-medium transition-all disabled:opacity-50 active:scale-[0.98]"
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

export default memo(NotificationBell);
