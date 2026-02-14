import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import { Grid, CheckSquare, BarChart2, Bell, User } from 'react-feather';
import {
  fetchUnreadNotificationsCount,
  removeRealtimeChannel,
  subscribeToNotificationChanges,
} from '../services/notificationService';

const DASHBOARD_NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', Icon: Grid, end: true },
  { to: '/dashboard/tasks', label: 'Tasks', Icon: CheckSquare },
  { to: '/dashboard/leaderboard', label: 'Leaderboard', Icon: BarChart2 },
  { to: '/dashboard/notifications', label: 'Notifications', Icon: Bell, showBadge: true },
  { to: '/profile', label: 'Profile', Icon: User }
];

function DashboardPage({ user }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const { count, error } = await fetchUnreadNotificationsCount(user.id);

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

    const notificationsChannel = subscribeToNotificationChanges(user.id, () => {
      fetchUnreadCount();
    });

    return () => {
      removeRealtimeChannel(notificationsChannel);
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
            {DASHBOARD_NAV_ITEMS.map(({ to, label, Icon, showBadge, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={getNavLinkClass}>
                  <Icon className="icon" />
                  <span>{label}</span>
                  {showBadge && unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </NavLink>
              </li>
            ))}
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

