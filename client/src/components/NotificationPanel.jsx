import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Bell, CheckCircle } from 'lucide-react';

function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    // Poll unread counts every 20 seconds for real-time responsiveness
    const interval = setInterval(fetchUnreadCount, 20000);
    return () => clearInterval(interval);
  }, []);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchUnreadCount() {
    try {
      const res = await api.get('/notifications/unread');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Error fetching unread notifications count:', err);
    }
  }

  async function fetchNotifications() {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error('Error fetching notifications list:', err);
    }
  }

  async function handleToggle() {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      await fetchNotifications();
    }
  }

  async function handleNotificationClick(notif) {
    setIsOpen(false);
    try {
      if (!notif.isRead) {
        await api.patch(`/notifications/${notif._id}/read`);
        await fetchUnreadCount();
      }
      
      // Redirect based on type
      if (notif.type === 'request') {
        navigate('/bookings/requests');
      } else {
        navigate('/bookings/my');
      }
    } catch (err) {
      console.error('Failed to handle notification click:', err);
    }
  }

  async function handleMarkAllRead() {
    try {
      await api.patch('/notifications/read-all');
      await fetchUnreadCount();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell trigger button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer"
        aria-label="Toggle notifications dropdown"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center rounded-full animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden font-sans">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No notifications to display.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                    !notif.isRead ? 'bg-amber-50/25 border-l-2 border-amber-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className={`text-xs font-bold text-slate-800 ${!notif.isRead ? 'text-slate-950 font-black' : ''}`}>
                      {notif.title}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase flex-shrink-0">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;
