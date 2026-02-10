import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import './DashboardPage.css'; // Reuse DashboardPage styles

// Helper to format dates
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

function DashboardOverview({ user }) {
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect to login if no user
    }
  }, [user, navigate]); // Depend on user and navigate

  const username = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const [currentDateDisplay, setCurrentDateDisplay] = useState('');
  const [activeDateToggle, setActiveDateToggle] = useState('Month'); // Default active toggle

  // Function to calculate date ranges
  const getDateRange = useCallback((period) => {
    const today = new Date();
    let startDate, endDate;

    if (period === 'Day') {
      startDate = today;
      return `📅 ${formatDate(startDate)}`;
    } else if (period === 'Week') {
      endDate = today;
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6); // Last 7 days
      return `📅 ${formatDate(startDate)} - ${formatDate(endDate)}`;
    } else if (period === 'Month') {
      endDate = today;
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29); // 30-day range ending today
      return `📅 ${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
  }, []);

  // Set initial date display on component mount
  useEffect(() => {
    setCurrentDateDisplay(getDateRange(activeDateToggle));
  }, [activeDateToggle, getDateRange]);

  const handleDateToggleClick = (period) => {
    setActiveDateToggle(period);
    setCurrentDateDisplay(getDateRange(period));
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
        </div>
        <div className="header-actions">
          <div className="date-selector">
            <span>{currentDateDisplay}</span>
          </div>
          <div className="segmented-toggle">
            <button
              className={activeDateToggle === 'Day' ? 'active' : ''}
              onClick={() => handleDateToggleClick('Day')}
            >
              Day
            </button>
            <button
              className={activeDateToggle === 'Week' ? 'active' : ''}
              onClick={() => handleDateToggleClick('Week')}
            >
              Week
            </button>
            <button
              className={activeDateToggle === 'Month' ? 'active' : ''}
              onClick={() => handleDateToggleClick('Month')}
            >
              Month
            </button>
          </div>
        </div>
      </header>

      <section className="dashboard-grid">
        <div className="dashboard-card full-width">
          <h3>Welcome, {username}!</h3>
          <p className="muted-text">Here is your progress overview.</p>
        </div>

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
    </>
  );
}

export default DashboardOverview;
