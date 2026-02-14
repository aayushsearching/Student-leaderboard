import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Grid, HelpCircle, Info, LogIn, LogOut, UserPlus } from 'react-feather';

/**
 * Public app shell with top navigation and nested route outlet.
 * @param {{ session: any, onLogout: () => void }} props
 */
function MainLayout({ session, onLogout }) {
  const getActiveClass = ({ isActive }) => (isActive ? 'nav-item active' : 'nav-item');
  const primaryAction = session
    ? { to: '/dashboard', icon: <Grid /> }
    : { to: '/login', icon: <LogIn /> };

  return (
    <>
      <div className="main-nav-container">
        <nav className="main-nav">
          <NavLink to="/" className="logo-link nav-item">
            <div className="logo">MentorFlow</div>
          </NavLink>
          <NavLink to="/how-it-works" className={getActiveClass}>
            <HelpCircle className="nav-icon" />
            <span className="nav-label">How it Works</span>
          </NavLink>

          <NavLink to={primaryAction.to} className="nav-primary-action">
            {primaryAction.icon}
          </NavLink>

          <NavLink to="/about" className={getActiveClass}>
            <Info className="nav-icon" />
            <span className="nav-label">About</span>
          </NavLink>
          {session ? (
            <button type="button" onClick={onLogout} className="nav-item">
              <LogOut className="nav-icon" />
              <span className="nav-label">Logout</span>
            </button>
          ) : (
            <NavLink to="/signup" className={getActiveClass}>
              <UserPlus className="nav-icon" />
              <span className="nav-label">Sign Up</span>
            </NavLink>
          )}
        </nav>
      </div>
      <div className="container-1200">
        <Outlet />
      </div>
    </>
  );
}

export default MainLayout;

