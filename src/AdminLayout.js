import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import './AdminLayout.css';
import { Edit, BarChart2, User, Award } from 'react-feather';

function AdminLayout() {



  const getNavLinkClass = ({ isActive }) =>
    isActive ? 'active' : '';

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/admin" end className={getNavLinkClass}>
                <Edit className="icon" />
                <span>Manage Tasks</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/points" className={getNavLinkClass}>
                <Award className="icon" />
                <span>Point System</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/leaderboard" className={getNavLinkClass}>
                <BarChart2 className="icon" />
                <span>View Leaderboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/profile" className={getNavLinkClass}>
                <User className="icon" />
                <span>My Profile</span>
              </NavLink>
            </li>
          </ul>
        </nav>

      </aside>
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
