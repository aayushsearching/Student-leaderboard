import React from 'react';
import './DashboardPage.css';

function DashboardPage({ user }) {
  const username = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="dashboard-container">
      {/* Phase 1: Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>MentorFlow</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active">
              <a href="#dashboard">
                <span className="icon">📊</span>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="#tasks">
                <span className="icon">✅</span>
                <span>Tasks</span>
              </a>
            </li>
            <li>
              <a href="#leaderboard">
                <span className="icon">🏆</span>
                <span>Leaderboard</span>
              </a>
            </li>
            <li>
              <a href="#profile">
                <span className="icon">👤</span>
                <span>Profile</span>
              </a>
            </li>
            <li>
              <a href="#settings">
                <span className="icon">⚙️</span>
                <span>Settings</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Phase 1: Main Content Area */}
      <main className="dashboard-main-content">
        {/* Phase 2: Header Bar */}
        <header className="dashboard-header">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>
          <div className="header-actions">
            <div className="date-selector">
              <span>📅 Oct 20, 2024</span>
            </div>
            <div className="segmented-toggle">
              <button className="active">Day</button>
              <button>Week</button>
              <button>Month</button>
            </div>
          </div>
        </header>

        {/* Phase 3: Main Content Grid */}
        <section className="dashboard-grid">
          {/* This is where the cards for tables and data viz will go */}
          <div className="dashboard-card full-width">
            <h3>Welcome, {username}!</h3>
            <p className="muted-text">Here is your progress overview.</p>
          </div>

          {/* Table Card */}
          <div className="dashboard-card full-width">
            <h4>Active Students</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Tasks Completed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="user-cell">
                      {/* Avatar placeholder */}
                      <span>AY</span>
                      <p>Aayush Yadav</p>
                    </div>
                  </td>
                  <td>Web Development</td>
                  <td>12/15</td>
                  <td><span className="status-badge status-active">Active</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="user-cell">
                      <span>JD</span>
                      <p>Jane Doe</p>
                    </div>
                  </td>
                  <td>UI/UX Design</td>
                  <td>14/15</td>
                  <td><span className="status-badge status-active">Active</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="user-cell">
                      <span>JS</span>
                      <p>John Smith</p>
                    </div>
                  </td>
                  <td>Data Science</td>
                  <td>8/15</td>
                  <td><span className="status-badge status-inactive">Inactive</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="dashboard-card">
            <h4>Tasks Overview</h4>
            <div className="chart-container">
              <svg viewBox="0 0 300 100" preserveAspectRatio="none">
                <polyline
                  className="chart-line"
                  fill="none"
                  points="0,50 50,30 100,60 150,40 200,70 250,50 300,80"
                />
                <circle className="chart-point" cx="150" cy="40" r="3" />
              </svg>
            </div>
          </div>

          <div className="dashboard-card">
            <h4>Leaderboard Position</h4>
            <div className="stacked-panels">
              <div className="panel panel-1">
                <p>Global Rank: #15</p>
              </div>
              <div className="panel panel-2">
                <p>Class Rank: #3</p>
              </div>
              <div className="panel panel-3">
                <p>Weekly Rank: #1</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
