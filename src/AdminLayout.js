import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './AdminLayout.css';

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      navigate('/'); // Redirect to home on successful logout
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              {/* This will link to the task management page at /admin */}
              <NavLink to="/admin" end>
                <span className="icon">📝</span>
                <span>Manage Tasks</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/points">
                <span className="icon">🪙</span>
                <span>Point System</span>
              </NavLink>
            </li>
            <li>
              {/* This links to the leaderboard rendered within the admin layout */}
              <NavLink to="/admin/leaderboard">
                <span className="icon">🏆</span>
                <span>View Leaderboard</span>
              </NavLink>
            </li>
            <li>
              {/* This links to the profile page rendered within the admin layout */}
              <NavLink to="/admin/profile">
                <span className="icon">👤</span>
                <span>My Profile</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <span className="icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;