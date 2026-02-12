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
        .from('leaderboard') // Assuming 'leaderboard' table exists
        .select(`
          score,
          profiles (full_name)
        `) // Join with profiles table to get full_name
        .order('score', { ascending: false })
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
      // Fetch all user scores from the leaderboard
      const { data: leaderboardEntries, error: fetchError } = await supabase
        .from('leaderboard')
        .select('user_id, score')
        .order('score', { ascending: false });

      if (fetchError) throw fetchError;

      if (!leaderboardEntries || leaderboardEntries.length === 0) {
        setUserRankPercentage(null);
        return;
      }

      const totalUsers = leaderboardEntries.length;
      let userRank = -1;

      // Find the current user's rank
      for (let i = 0; i < leaderboardEntries.length; i++) {
        if (leaderboardEntries[i].user_id === user.id) {
          userRank = i + 1; // Rank is 1-based
          break;
        }
      }

      if (userRank === -1) {
        setUserRankPercentage(null); // User not found in leaderboard
        return;
      }

      // Calculate percentage (lower percentage is better, so (rank / total) * 100)
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
              <li key={entry.profiles.full_name || index} className="student-item">
                <span className="student-rank">{index + 1}.</span>
                <span className="student-name">{entry.profiles.full_name || 'N/A'}</span>
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
