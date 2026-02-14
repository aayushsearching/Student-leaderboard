import { useCallback, useEffect, useState } from 'react';
import {
  createLeaderboardEntryIfMissing,
  fetchRankedLeaderboard,
  fetchTop10Leaderboard,
  removeRealtimeChannel,
  subscribeToLeaderboardChanges,
} from '../services/leaderboardService';

const LEADERBOARD_TOP10_REFRESH_MS = 10000;

const formatLeaderboardData = (rankedData = []) =>
  rankedData.map((entry) => ({
    ...entry,
    profiles: {
      full_name: entry.full_name,
    },
  }));

/**
 * Leaderboard data orchestrator for top 3 + top 10 sections.
 * @param {{ id: string } | null | undefined} user
 */
export function useLeaderboard(user) {
  const [loadingTop3, setLoadingTop3] = useState(true);
  const [errorTop3, setErrorTop3] = useState(null);
  const [leaderboardTop3Data, setLeaderboardTop3Data] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [leaderboardTop10, setLeaderboardTop10] = useState([]);
  const [loadingTop10, setLoadingTop10] = useState(true);
  const [errorTop10, setErrorTop10] = useState(null);

  const fetchFormattedRankedData = useCallback(async () => {
    const { data: rankedData, error: rankedError } = await fetchRankedLeaderboard();
    if (rankedError) throw rankedError;
    return formatLeaderboardData(rankedData);
  }, []);

  const fetchTop3Data = useCallback(async () => {
    try {
      setLoadingTop3(true);
      setErrorTop3(null);

      let formattedRankedData = await fetchFormattedRankedData();
      setLeaderboardTop3Data(formattedRankedData);

      if (user && !formattedRankedData.find((entry) => entry.user_id === user.id)) {
        const { error: insertError } = await createLeaderboardEntryIfMissing(user.id);
        if (insertError) {
          console.error('Error creating new leaderboard entry:', insertError);
        } else {
          formattedRankedData = await fetchFormattedRankedData();
          setLeaderboardTop3Data(formattedRankedData);
        }
      }

      setCurrentUserData(
        user ? formattedRankedData.find((entry) => entry.user_id === user.id) || null : null
      );
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setErrorTop3('Failed to load leaderboard data: ' + error.message);
    } finally {
      setLoadingTop3(false);
    }
  }, [user, fetchFormattedRankedData]);

  const fetchTop10Data = useCallback(async () => {
    try {
      setLoadingTop10(true);
      setErrorTop10(null);
      const { data, error } = await fetchTop10Leaderboard();
      if (error) throw error;
      setLeaderboardTop10(data || []);
    } catch (fetchError) {
      console.error('Error fetching top 10 leaderboard:', fetchError);
      setErrorTop10('Failed to load top 10 leaderboard: ' + fetchError.message);
    } finally {
      setLoadingTop10(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchTop3Data();
    fetchTop10Data();

    const intervalId = setInterval(fetchTop10Data, LEADERBOARD_TOP10_REFRESH_MS);
    return () => clearInterval(intervalId);
  }, [user, fetchTop3Data, fetchTop10Data]);

  useEffect(() => {
    if (!user) return;

    const channel = subscribeToLeaderboardChanges(() => {
      fetchTop3Data();
      fetchTop10Data();
    });

    return () => removeRealtimeChannel(channel);
  }, [user, fetchTop3Data, fetchTop10Data]);

  return {
    loadingTop3,
    errorTop3,
    leaderboardTop3Data,
    currentUserData,
    loadingTop10,
    errorTop10,
    leaderboardTop10,
    top3Students: leaderboardTop3Data.slice(0, 3),
  };
}

