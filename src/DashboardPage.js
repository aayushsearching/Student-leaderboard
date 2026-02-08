import React, { useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'; // Import useNavigate and useEffect
import './DashboardPage.css';

function DashboardPage({ user }) { // Receive user prop
  const location = useLocation(); // Get current location
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect to login if no user
    }
  }, [user, navigate]); // Depend on user and navigate

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
