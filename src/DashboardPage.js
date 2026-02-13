import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './DashboardPage.css';
import { Grid, CheckSquare, BarChart2, Bell, User } from 'react-feather';

function DashboardPage({ user }) {

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

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [user, navigate, fetchUnreadCount]);


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
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardPage;
