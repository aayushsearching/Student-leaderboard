import React, { useEffect, useState, useCallback } from 'react'; // Import useState and useCallback
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'; // Import useNavigate and useEffect
import { supabase } from './supabaseClient'; // Import supabase
import './DashboardPage.css';

function DashboardPage({ user }) { // Receive user prop
  const location = useLocation(); // Get current location
  const navigate = useNavigate(); // Initialize useNavigate
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
      navigate('/login'); // Redirect to login if no user
      return;
    }
    fetchUnreadCount();

    // Realtime subscription for unread count
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
  }, [user, navigate, fetchUnreadCount]); // Depend on user, navigate, and fetchUnreadCount

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>MentorFlow</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={location.pathname === '/dashboard' ? 'active' : ''}>
              <Link to="/dashboard">
                <span className="icon">📊</span>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={location.pathname === '/dashboard/tasks' ? 'active' : ''}> {/* Updated path */}
              <Link to="/dashboard/tasks">
                <span className="icon">✅</span>
                <span>Tasks</span>
              </Link>
            </li>
            <li className={location.pathname === '/dashboard/leaderboard' ? 'active' : ''}>
              <Link to="/dashboard/leaderboard">
                <span className="icon">🏆</span>
                <span>Leaderboard</span>
              </Link>
            </li>
            <li className={location.pathname.startsWith('/dashboard/notifications') ? 'active' : ''}>
              <Link to="/dashboard/notifications">
                <span className="icon">🔔</span> {/* Notification icon */}
                <span>Notifications</span>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </Link>
            </li>
            <li className={location.pathname === '/profile' ? 'active' : ''}>
              <Link to="/profile">
                <span className="icon">👤</span>
                <span>Profile</span>
              </Link>
            </li>

          </ul>
        </nav>
      </aside>

      {/* Main Content Area - Renders nested routes */}
      <main className="dashboard-main-content">
        <Outlet /> {/* This is where nested routes will render */}
      </main>
    </div>
  );
}

export default DashboardPage;
