import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Import supabase client
import './DashboardOverview.css';

const DEFAULT_RANK_PERCENTAGE = 10;
const MAX_RANK_PERCENTAGE = 100;
const UNRANKED_LEAGUE = 'Unranked';

const toRankPercentage = (userRank, totalUsers) => {
  const rawPercentage = (userRank / totalUsers) * 100;

  if (rawPercentage <= 10) return DEFAULT_RANK_PERCENTAGE;
  if (rawPercentage > 90) return MAX_RANK_PERCENTAGE;
  return Math.ceil(rawPercentage / 10) * 10;
};

function DashboardOverview({ user }) {
  const navigate = useNavigate();
  const [topLeaderboardStudents, setTopLeaderboardStudents] = useState([]);
  const [userRankPercentage, setUserRankPercentage] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);

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

      setUserRankPercentage(toRankPercentage(userRank, totalUsers));

    } catch (err) {
      console.error('Error fetching user leaderboard rank:', err.message);
      setUserRankPercentage(null);
    }
  }, [user]);

  const fetchDashboardMetrics = useCallback(async () => {
    if (!user) {
      setTotalStudents(0);
      setTasksCompleted(0);
      setPendingReviews(0);
      return;
    }

    try {
      // Fetch Total Students (assuming a 'profiles' table for all users)
      const { count: studentsCount, error: studentsError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      if (studentsError) throw studentsError;
      setTotalStudents(studentsCount);

      // Fetch Tasks Completed by the current user from 'user_tasks' table
      const { count: completedTasksCount, error: completedTasksError } = await supabase
        .from('user_tasks') // Changed to 'user_tasks'
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');
      if (completedTasksError) throw completedTasksError;
      setTasksCompleted(completedTasksCount);

      // Fetch Pending Reviews for the current user from 'user_tasks' table
      const { count: pendingReviewsCount, error: pendingReviewsError } = await supabase
        .from('user_tasks') // Changed to 'user_tasks'
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending_review'); // Changed to 'pending_review'
      if (pendingReviewsError) throw pendingReviewsError;
      setPendingReviews(pendingReviewsCount);

    } catch (err) {
      console.error('Error fetching dashboard metrics:', err.message);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTopLeaderboardStudents();
    fetchUserLeaderboardRank();
    fetchDashboardMetrics(); // Call new fetch function

    const userTasksChannel = supabase
      .channel('dashboard_user_tasks_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_tasks',
        filter: `user_id=eq.${user?.id}` // Filter by current user's tasks
      }, () => {
        fetchDashboardMetrics(); // Re-fetch metrics when user_tasks change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(userTasksChannel); // Unsubscribe from user_tasks channel
    };
  }, [user, navigate, fetchTopLeaderboardStudents, fetchUserLeaderboardRank, fetchDashboardMetrics]);

  return (
    <div className="dashboard-overview-container">
      <div className="welcome-banner">
        <h1>Welcome, {user?.user_metadata?.full_name || user?.email}!</h1>
        <p>Here is your progress overview:</p>
      </div>

      <div className="dashboard-cards-container">
        <div className="dashboard-card">
          <h3>Total Students</h3>
          <p className="card-value">{totalStudents}</p>
        </div>
        <div className="dashboard-card">
          <h3>Tasks Completed</h3>
          <p className="card-value">{tasksCompleted}</p>
        </div>
        <div className="dashboard-card">
          <h3>Pending Reviews</h3>
          <p className="card-value">{pendingReviews}</p>
        </div>
      </div>

      <div className="top-students-leaderboard-block">
        <h2>Top 3 Leaderboard Students</h2>
        <ul className="student-list">
          {topLeaderboardStudents.length > 0 ? (
            topLeaderboardStudents.map((entry, index) => (
              <li key={entry.full_name || index} className="student-item">
                <span className="student-rank">{index + 1}.</span>
                <span className="student-name">
                  {entry.full_name || 'Unknown User'}
                  {entry.league && entry.league !== UNRANKED_LEAGUE && (
                    <span className="student-league"> ({entry.league})</span>
                  )}
                  {entry.league === UNRANKED_LEAGUE && (
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
