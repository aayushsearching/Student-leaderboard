import { supabase } from './supabaseClient';

/**
 * Fetch unread notifications count for a user.
 * @param {string} userId
 */
export const fetchUnreadNotificationsCount = (userId) =>
  supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

/**
 * Fetch all notifications for a user.
 * @param {string} userId
 */
export const fetchNotificationsByUserId = (userId) =>
  supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

/**
 * Mark a single notification as read.
 * @param {string} notificationId
 */
export const markNotificationRead = (notificationId) =>
  supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);

/**
 * Mark all user notifications as read.
 * @param {string} userId
 */
export const markAllNotificationsRead = (userId) =>
  supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

/**
 * Subscribe to notifications for a user.
 * @param {string} userId
 * @param {(payload: any) => void} handler
 */
export const subscribeToNotifications = (userId, handler) =>
  supabase
    .channel('notifications_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      handler
    )
    .subscribe();

/**
 * Subscribe to notification table changes for dashboard badge updates.
 * @param {string} userId
 * @param {() => void} handler
 */
export const subscribeToNotificationChanges = (userId, handler) =>
  supabase
    .channel('unread_dashboard_notifications_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      handler
    )
    .subscribe();

/**
 * Send an admin announcement to users.
 * @param {{ title: string, message: string }} payload
 */
export const sendAdminAnnouncement = ({ title, message }) =>
  supabase.rpc('send_admin_notification', {
    p_title: title,
    p_message: message,
  });

/**
 * Remove Supabase realtime channel.
 * @param {import('@supabase/supabase-js').RealtimeChannel} channel
 */
export const removeRealtimeChannel = (channel) => supabase.removeChannel(channel);

