import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Import supabase client
import './DashboardOverview.css';

function DashboardOverview({ user }) {
  const navigate = useNavigate();
  const [topLeaderboardStudents, setTopLeaderboardStudents] = useState([]);
  const [userRankPercentage, setUserRankPercentage] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchTopLeaderboardStudents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_leaderboard_with_rank') // Call the RPC function
        .order('rank', { ascending: true }) // Order by the calculated rank
        .limit(3);

      if (error) throw error;
      setTopLeaderboardStudents(data);
    } catch (err) {
      console.error('Error fetching top leaderboard students:', err.message);
    }
  }, []);

  const fetchUserLeaderboardRank = useCallback(async () => {
    if (!user) {
      setUserRankPercentage(null);
      return;
    }
    try {
      // Fetch all users with their ranks using the RPC
      const { data: rankedLeaderboard, error: fetchError } = await supabase
        .rpc('get_leaderboard_with_rank');

      if (fetchError) throw fetchError;

      if (!rankedLeaderboard || rankedLeaderboard.length === 0) {
        setUserRankPercentage(null);
        return;
      }

      const totalUsers = rankedLeaderboard.length;
      let userRank = -1;

      // Find the current user's rank from the RPC result
      for (let i = 0; i < rankedLeaderboard.length; i++) {
        if (rankedLeaderboard[i].user_id === user.id) {
          userRank = rankedLeaderboard[i].rank; // Use the rank returned by the RPC
          break;
        }
      }

      if (userRank === -1) {
        setUserRankPercentage(null); // User not found in leaderboard
        return;
      }

      // Calculate percentage (lower percentage is better)
      const rawPercentage = (userRank / totalUsers) * 100;

      // Round to nearest 10%
      let roundedPercentage;
      if (rawPercentage <= 10) {
        roundedPercentage = 10;
      } else if (rawPercentage > 90) {
        roundedPercentage = 100;
      } else {
        roundedPercentage = Math.ceil(rawPercentage / 10) * 10;
      }

      setUserRankPercentage(roundedPercentage);

    } catch (err) {
      console.error('Error fetching user leaderboard rank:', err.message);
      setUserRankPercentage(null);
    }
  }, [user]);

  useEffect(() => {
    fetchTopLeaderboardStudents();
    fetchUserLeaderboardRank();
  }, [fetchTopLeaderboardStudents, fetchUserLeaderboardRank]);

  return (
    <div className="dashboard-overview-container">
      <div className="top-students-leaderboard-block">
        <h2>Top 3 Leaderboard Students</h2>
        <ul className="student-list">
          {topLeaderboardStudents.length > 0 ? (
            topLeaderboardStudents.map((entry, index) => (
              <li key={entry.full_name || index} className="student-item">
                <span className="student-rank">{index + 1}.</span>
                <span className="student-name">
                  {entry.full_name || 'Unknown User'}
                  {entry.league && entry.league !== 'Unranked' && (
                    <span className="student-league"> ({entry.league})</span>
                  )}
                  {entry.league === 'Unranked' && (
                    <span className="student-league"> (No League Yet)</span>
                  )}
                </span>
                <span className="student-points">{entry.score} points</span>
              </li>
            ))
          ) : (
            // Placeholder for 3 students if topLeaderboardStudents is empty
            [...Array(3)].map((_, index) => (
              <li key={`placeholder-${index}`} className="student-item placeholder-item">
                <span className="student-rank">{index + 1}.</span>
                <span className="student-name">Loading Student...</span>
                <span className="student-points">-- points</span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="leaderboard-position-card dashboard-card">
        <h3>Your Global Rank</h3>
        {userRankPercentage !== null ? (
            <p className="card-value">Top {userRankPercentage}%</p>
        ) : (
            <p className="card-value">--</p>
        )}
      </div>
    </div>
  );
}

export default DashboardOverview;
