import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './DashboardPage.css';
import { Grid, CheckSquare, BarChart2, Bell, User } from 'react-feather';

function DashboardPage({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUnreadCount();

    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate, fetchUnreadCount]);

  return (
    <div className="dashboard-page-wrapper">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>MentorFlow</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={location.pathname === '/dashboard' ? 'active' : ''}>
              <Link to="/dashboard">
                <Grid className="icon" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={location.pathname === '/dashboard/tasks' ? 'active' : ''}>
              <Link to="/dashboard/tasks">
                <CheckSquare className="icon" />
                <span>Tasks</span>
              </Link>
            </li>
            <li className={location.pathname === '/dashboard/leaderboard' ? 'active' : ''}>
              <Link to="/dashboard/leaderboard">
                <BarChart2 className="icon" />
                <span>Leaderboard</span>
              </Link>
            </li>
            <li className={location.pathname.startsWith('/dashboard/notifications') ? 'active' : ''}>
              <Link to="/dashboard/notifications">
                <Bell className="icon" />
                <span>Notifications</span>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </Link>
            </li>
            <li className={location.pathname === '/profile' ? 'active' : ''}>
              <Link to="/profile">
                <User className="icon" />
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardPage;
