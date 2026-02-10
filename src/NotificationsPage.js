import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import './NotificationsPage.css';

function NotificationsPage({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError);
      setError('Failed to load notifications: ' + fetchError.message);
    } else {
      setNotifications(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    // Realtime subscription for new notifications
    const channel = supabase
      .channel('notifications_channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        console.log('New notification:', payload);
        // Add new notification to the top of the list
        setNotifications((prevNotifications) => [payload.new, ...prevNotifications]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, user]);

  const markAsRead = useCallback(async (notificationId) => {
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (updateError) {
      console.error('Error marking notification as read:', updateError);
      setError('Failed to mark notification as read: ' + updateError.message);
    } else {
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (updateError) {
      console.error('Error marking all notifications as read:', updateError);
      setError('Failed to mark all notifications as read: ' + updateError.message);
    } else {
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) => ({ ...n, is_read: true }))
      );
    }
  }, [user]);

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    // Navigate to the task if task_id is present
    if (notification.task_id) {
      navigate(`/dashboard/tasks/${notification.task_id}`); // Assuming a route like /dashboard/tasks/:taskId
    }
  }, [navigate, markAsRead]);

  if (loading) return <div className="notifications-container">Loading notifications...</div>;
  if (error) return <div className="notifications-container error-message">{error}</div>;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Your Notifications</h2>
        {notifications.filter(n => !n.is_read).length > 0 && (
          <button onClick={markAllAsRead} className="mark-all-read-button">
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
                <button onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }} className="mark-read-button">
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