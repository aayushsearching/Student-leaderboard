import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';
import { Edit, BarChart2, User, Award } from 'react-feather';

const ADMIN_NAV_ITEMS = [
  { to: '/admin', label: 'Manage Tasks', Icon: Edit, end: true },
  { to: '/admin/points', label: 'Point System', Icon: Award },
  { to: '/admin/leaderboard', label: 'View Leaderboard', Icon: BarChart2 },
  { to: '/admin/profile', label: 'My Profile', Icon: User }
];

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
            {ADMIN_NAV_ITEMS.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={getNavLinkClass}>
                  <Icon className="icon" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
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
