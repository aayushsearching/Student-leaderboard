import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './DashboardOverview.css'; // Use DashboardOverview specific styles

function DashboardOverview({ user }) {
  const navigate = useNavigate();

  // Placeholder data for stats
  const stats = [
    { id: 1, label: 'Total Students', value: '120', icon: '🧑‍🎓' },
    { id: 2, label: 'Tasks Completed', value: '450', icon: '✅' },
    { id: 3, label: 'Pending Reviews', value: '15', icon: '✍️' },
  ];

  // Placeholder data for active students (matching the original table structure)
  const activeStudents = [
    { id: 1, name: 'Aayush Yadav', course: 'Web Development', completed: '12/15', status: 'active' },
    { id: 2, name: 'Jane Doe', course: 'UI/UX Design', completed: '14/15', status: 'active' },
    { id: 3, name: 'John Smith', course: 'Data Science', completed: '8/15', status: 'inactive' },
    { id: 4, name: 'Emily White', course: 'Machine Learning', completed: '10/15', status: 'active' },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const username = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <>
      <section className="dashboard-grid">
        <div className="dashboard-card welcome-card full-width">
          <h3>Welcome, {username}!</h3>
          <p>Here is your progress overview.</p>
        </div>

        <div className="stats-grid full-width">
          {stats.map(stat => (
            <div className="stat-card" key={stat.id}>
              <span className="icon">{stat.icon}</span>
              <div className="value">{stat.value}</div>
              <div className="label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Desktop-friendly table layout for Active Students */}
        <div className="dashboard-card full-width active-students-table-desktop">
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
              {activeStudents.map(student => (
                <tr key={student.id}>
                  <td>
                    <div className="user-cell">
                      <span>{student.name.split(' ').map(n => n[0]).join('')}</span>
                      <p>{student.name}</p>
                    </div>
                  </td>
                  <td>{student.course}</td>
                  <td>{student.completed}</td>
                  <td><span className={`status-badge status-${student.status}`}>{student.status.charAt(0).toUpperCase() + student.status.slice(1)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile-friendly card layout for Active Students */}
        <div className="active-students-cards-mobile full-width">
          <h4>Active Students</h4>
          {activeStudents.map(student => (
            <div className="student-card-mobile" key={student.id}>
              <div className="name">{student.name}</div>
              <div className="course">{student.course}</div>
              <div className="completed-count">Completed: {student.completed}</div>
              <span className={`status-badge status-${student.status}`}>
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </span>
            </div>
          ))}
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
