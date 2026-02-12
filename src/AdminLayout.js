import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './AdminLayout.css';
import { Edit, BarChart2, User, LogOut, Award } from 'react-feather';

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      navigate('/');
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
              <NavLink to="/admin" end>
                <Edit className="icon" />
                <span>Manage Tasks</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/points">
                <Award className="icon" />
                <span>Point System</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/leaderboard">
                <BarChart2 className="icon" />
                <span>View Leaderboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/profile">
                <User className="icon" />
                <span>My Profile</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <LogOut className="icon" />
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
