import { supabase } from './supabaseClient';

/**
 * Fetch top N leaderboard students.
 * @param {number} limit
 */
export const fetchTopLeaderboardStudents = (limit = 3) =>
  supabase.rpc('get_leaderboard_with_rank').order('rank', { ascending: true }).limit(limit);

/**
 * Fetch ranked leaderboard rows.
 */
export const fetchRankedLeaderboard = () =>
  supabase.rpc('get_leaderboard_with_rank');

/**
 * Fetch total students count.
 */
export const fetchTotalStudentsCount = () =>
  supabase.from('profiles').select('id', { count: 'exact', head: true });

/**
 * Fetch completed task count for a user.
 * @param {string} userId
 */
export const fetchCompletedTasksCount = (userId) =>
  supabase
    .from('user_tasks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed');

/**
 * Fetch pending review task count for a user.
 * @param {string} userId
 */
export const fetchPendingReviewsCount = (userId) =>
  supabase
    .from('user_tasks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'pending_review');

/**
 * Subscribe to user task changes.
 * @param {string} userId
 * @param {() => void} handler
 */
export const subscribeToUserTaskChanges = (userId, handler) =>
  supabase
    .channel('dashboard_user_tasks_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_tasks',
        filter: `user_id=eq.${userId}`,
      },
      handler
    )
    .subscribe();

/**
 * Remove Supabase realtime channel.
 * @param {import('@supabase/supabase-js').RealtimeChannel} channel
 */
export const removeRealtimeChannel = (channel) => supabase.removeChannel(channel);

