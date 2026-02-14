import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, GitMerge, Send, Users } from 'react-feather';

/**
 * Landing hero section content.
 */
function HomeContent() {
  return (
    <main className="hero-section">
      <div className="hero-content">
        <h1>Level Up Your Skills, Boost Your Rank!</h1>
        <p className="secondary-text">
          Task-based mentorship for college students to learn, earn points, and climb the
          leaderboard.
        </p>
        <Link to="/login" className="cta-button">
          Join the Challenge
        </Link>
      </div>

      <div className="ui-card card-task">
        <div className="card-header">
          <span className="card-title">Submit Task</span>
          <CheckSquare className="card-icon" size={20} />
        </div>
        <div className="card-body">
          <p>Complete the assigned task and submit for peer review.</p>
        </div>
        <div className="card-footer">
          <div className="avatar-group">
            <img
              src="https://randomuser.me/api/portraits/women/68.jpg"
              alt="Avatar"
              className="avatar"
            />
            <img
              src="https://randomuser.me/api/portraits/men/75.jpg"
              alt="Avatar"
              className="avatar"
            />
          </div>
        </div>
      </div>

      <div className="ui-card card-sticky-note">
        <p className="sticky-note-text">"The only way to do great work is to love what you do."</p>
      </div>

      <div className="ui-card card-reminder">
        <div className="card-header">
          <span className="card-title">Weekly Sync</span>
          <Send className="card-icon" size={20} />
        </div>
        <div className="reminder-item">
          <div className="reminder-checkbox" />
          <span className="reminder-text">Sync up with the team on project progress.</span>
        </div>
      </div>

      <div className="ui-card card-integration">
        <div className="card-header">
          <span className="card-title">Connect</span>
        </div>
        <div className="integration-icons">
          <GitMerge className="card-icon" size={24} />
          <Users className="card-icon" size={24} />
        </div>
      </div>
    </main>
  );
}

export default HomeContent;

