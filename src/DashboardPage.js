import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './DashboardPage.css';
import { Grid, CheckSquare, BarChart2, Bell, User, Award, DollarSign, Clipboard } from 'react-feather';

function DashboardPage({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error fetching unread notification count:', err.message);
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
    fetchUnreadCount();
    fetchDashboardMetrics();

    const notificationsChannel = supabase
      .channel('unread_dashboard_notifications_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        fetchUnreadCount();
      })
      .subscribe();

    const userTasksChannel = supabase
      .channel('dashboard_user_tasks_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_tasks',
        filter: `user_id=eq.${user?.id}` // Filter by current user's tasks
      }, (payload) => {
        fetchDashboardMetrics(); // Re-fetch metrics when user_tasks change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(userTasksChannel); // Unsubscribe from both channels
    };
  }, [user, navigate, fetchUnreadCount, fetchDashboardMetrics]);


  const getNavLinkClass = ({ isActive }) =>
    isActive ? 'active' : '';

  return (
    <div className="dashboard-page-wrapper">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>MentorFlow</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/dashboard" className={getNavLinkClass}>
                <Grid className="icon" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/tasks" className={getNavLinkClass}>
                <CheckSquare className="icon" />
                <span>Tasks</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/leaderboard" className={getNavLinkClass}>
                <BarChart2 className="icon" />
                <span>Leaderboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/notifications" className={getNavLinkClass}>
                <Bell className="icon" />
                <span>Notifications</span>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={getNavLinkClass}>
                <User className="icon" />
                <span>Profile</span>
              </NavLink>
            </li>
          </ul>
        </nav>

      </aside>

      <main className="dashboard-main-content">
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
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardPage;
