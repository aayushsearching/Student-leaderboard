import { supabase } from './supabaseClient';

/**
 * Get ranked leaderboard data from RPC.
 */
export const fetchRankedLeaderboard = () =>
  supabase.rpc('get_leaderboard_with_rank').order('rank', { ascending: true });

/**
 * Get top 10 leaderboard rows from RPC.
 */
export const fetchTop10Leaderboard = () =>
  supabase.rpc('get_leaderboard_top10');

/**
 * Ensure leaderboard row exists for a user.
 * @param {string} userId
 */


/**
 * Subscribe to leaderboard updates.
 * @param {() => void} onUpdate
 */
export const subscribeToLeaderboardChanges = (onUpdate) =>
  supabase
    .channel('leaderboard-changes')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'leaderboard' },
      onUpdate
    )
    .subscribe();

/**
 * Remove Supabase realtime channel.
 * @param {import('@supabase/supabase-js').RealtimeChannel} channel
 */
export const removeRealtimeChannel = (channel) => supabase.removeChannel(channel);

