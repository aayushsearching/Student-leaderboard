import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationsPage.css';
import {
  fetchNotificationsByUserId,
  markAllNotificationsRead,
  markNotificationRead,
  removeRealtimeChannel,
  subscribeToNotifications,
} from '../services/notificationService';

function NotificationsPage({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const unreadNotifications = notifications.filter((notification) => !notification.is_read);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await fetchNotificationsByUserId(user.id);

      if (fetchError) throw fetchError;
      setNotifications(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    if (!user) {
      return;
    }

    // Realtime subscription for new notifications
    const channel = subscribeToNotifications(user.id, (payload) => {
        // Add new notification to the top of the list
        setNotifications((prevNotifications) => [payload.new, ...prevNotifications]);
      });

    return () => {
      removeRealtimeChannel(channel);
    };
  }, [fetchNotifications, user]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const { error: updateError } = await markNotificationRead(notificationId);

      if (updateError) throw updateError;
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read: ' + err.message);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    try {
      const { error: updateError } = await markAllNotificationsRead(user.id);

      if (updateError) throw updateError;
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all notifications as read: ' + err.message);
    }
  }, [user]);

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    // Navigate to the task if task_id is present
    if (notification.task_id) {
      navigate('/dashboard/tasks');
    }
  }, [navigate, markAsRead]);

  if (loading) return <div className="notifications-container">Loading notifications...</div>;
  if (error) return <div className="notifications-container error-message">{error}</div>;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Your Notifications</h2>
        {unreadNotifications.length > 0 && (
          <button type="button" onClick={markAllAsRead} className="mark-all-read-button">
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="no-notifications">No new notifications.</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.is_read ? 'read' : 'unread'} ${notification.type === 'admin_announcement' ? 'announcement' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-content">
                <span className="notification-title">
                  {notification.type === 'admin_announcement' && <span className="notification-type-badge">Announcement</span>}
                  {notification.title}
                </span>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
              {!notification.is_read && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                  className="mark-read-button"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;

