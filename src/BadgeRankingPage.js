import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { supabase } from './supabaseClient'; // Import Supabase client
import './BadgeRankingPage.css';

// Helper to format rank with suffixes
const formatRank = (rank) => {
  if (rank % 100 >= 11 && rank % 100 <= 13) {
    return rank + 'th';
  }
  switch (rank % 10) {
    case 1: return rank + 'st';
    case 2: return rank + 'nd';
    case 3: return rank + 'rd';
    default: return rank + 'th';
  }
};

const leagues = [
  { name: 'Novice', tier: 'novice', description: 'Entry-level, grounded in basic understanding.' },
  { name: 'Learner', tier: 'learner', description: 'Developing core skills with foundational knowledge.' },
  { name: 'Scholar', tier: 'scholar', description: 'Demonstrating solid comprehension and consistent progress.' },
  { name: 'Skilled', tier: 'skilled', description: 'Proficient in key areas, consistently performing well.' },
  { name: 'Expert', tier: 'expert', description: 'Mastered complex challenges, highly effective.' },
  { name: 'Master', tier: 'master', description: 'Dominant in multiple domains, influencing others.' },
  { name: 'Elite', tier: 'elite', description: 'Top-tier performance, consistently outstanding achievements.' },
  { name: 'Apex', tier: 'apex', description: 'Unrivaled expertise, setting new benchmarks for excellence.' },
];

const DivisionIndicator = ({ division, totalDivisions = 5 }) => {
  return (
    <div className="division-indicator">
      {[...Array(totalDivisions)].map((_, i) => (
        <span key={i} className={i < division ? 'filled' : ''}>★</span>
      ))}
    </div>
  );
};

// Simplified Badge component - will use CSS classes
const Badge = ({ tier, size = 'medium' }) => {
  const league = leagues.find(l => l.tier === tier);
  return (
    <div className={`badge-display badge-${tier} badge-size-${size}`}>
      {league ? <span className="league-title">{league.name}</span> : null}
    </div>
  );
};

function BadgeRankingPage({ user }) { // Accept user prop
  const [showRankingExplanation, setShowRankingExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect to login if no user
      return;
    }
    fetchLeaderboardData();
  }, [user, navigate]); // Depend on user and navigate

  async function fetchLeaderboardData() {
    try {
      setLoading(true);
      setError(null);

      // const { data: { session }, error: sessionError } = await supabase.auth.getSession(); // No longer needed
      // if (sessionError) throw sessionError;

      const { data, error: fetchError } = await supabase
        .from('leaderboard')
        .select('*, profiles(full_name, academic_year, branch)') // Fetch related profile data
        .order('score', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      setLeaderboardData(data);

      // Find current user's data if logged in
      if (user) { // Use the user prop directly
        const userEntry = data.find(entry => entry.user_id === user.id);
        if (userEntry) {
          setCurrentUserData(userEntry);
        } else {
          // If user is logged in but not in top 10, fetch their specific data
          const { data: userData, error: userError } = await supabase
            .from('leaderboard')
            .select('*, profiles(full_name, academic_year, branch)')
            .eq('user_id', user.id) // Use user.id from prop
            .single();
          if (userError && userError.code !== 'PGRST116') throw userError; // PGRST116 is 'No rows found'
          setCurrentUserData(userData);
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError('Failed to load leaderboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Prepare current user mock data using fetched data
  const currentUserDisplay = {
    name: currentUserData?.profiles?.full_name || currentUserData?.username || 'You',
    rank: currentUserData?.rank || 'N/A',
    badge: { 
      name: leagues.find(l => l.tier === currentUserData?.badge_tier)?.name || 'Unranked', 
      tier: currentUserData?.badge_tier || 'novice', 
      division: currentUserData?.badge_division || 1 
    },
    course: currentUserData?.profiles?.branch || 'N/A', // Assuming branch maps to course for display
    year: currentUserData?.profiles?.academic_year || 'N/A',
    points: currentUserData?.score || 0
  };

  return (
    <div className="badge-ranking-page">
      <div className="ranking-header">
        <h1>Leaderboard</h1>
        <p>See where you stand among your peers.</p>
        <button className="ranking-info-button" onClick={() => setShowRankingExplanation(!showRankingExplanation)}>
          {showRankingExplanation ? 'Hide Ranking Details' : 'See how ranking works'}
        </button>
      </div>

      {showRankingExplanation && (
        <div className="ranking-explanation leaderboard-card">
          <h4>How Ranking Works</h4>
          <p>Your rank is determined by your performance across various tasks and challenges. Progress through divisions by accumulating points and demonstrating mastery in your chosen path. There are 8 distinct leagues, each with 5 divisions (V to I), representing increasing levels of skill and achievement.</p>
          <div className="league-explanation-grid">
            {leagues.map((league) => (
              <div key={league.tier} className="league-info-item">
                <div className={`badge-display badge-${league.tier} badge-size-x-small`}></div> {/* Use generic div */}
                <h5>{league.name}</h5>
                <p>{league.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showRankingExplanation && (
        <>
          {loading && <p className="loading-message">Loading leaderboard...</p>}
          {error && <p className="error-message">{error}</p>}

          {!loading && !error && (
            <>
              {/* Top Section: Current User's Rank */}
              {currentUserData ? (
                <div className="current-user-rank-card">
                  <div className="user-info">
                    <h3 className="user-name">{currentUserDisplay.name}</h3>
                    <p className="user-rank">Your Rank: {formatRank(currentUserDisplay.rank)}</p>
                    <p className="user-points">{currentUserDisplay.points} Points</p>
                  </div>
                  <div className="user-badge">
                    <Badge tier={currentUserDisplay.badge.tier} size="small" /> {/* Using simplified Badge */}
                  </div>
                </div>
              ) : (
                <p className="muted-text" style={{textAlign: 'center', marginBottom: '2rem'}}>You are not currently ranked on the leaderboard. Complete tasks to earn points!</p>
              )}


              {/* Folder of Badges Section - This section will now show ALL badges defined, not just earned */}
              {/* I'll simplify this for now based on user's previous request to only show league titles and points */}
              {/* If you want to show earned badges, you'd need to fetch a user's specific earned badges from DB */}
              {/* For now, removing this section as per current user's request for simpler display */}
              {/* The league explanation grid is still available via the "How ranking works" button */}

              {/* Leaderboard List: Top 10 Students */}
              <div className="leaderboard-card">
                <h4>Top 10 Students</h4>
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Details</th>
                      <th>Points</th>
                      <th>League</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.length > 0 ? (
                      leaderboardData.map((student) => (
                        <tr key={student.user_id}> {/* Use user_id as key as it's unique */}
                          <td>{formatRank(student.rank)}</td>
                          <td>{student.profiles?.full_name || student.username || 'N/A'}</td>
                          <td>{student.profiles?.branch || 'N/A'} ({student.profiles?.academic_year || 'N/A'})</td>
                          <td>{student.score}</td>
                          <td className="leaderboard-badge-cell">
                            <Badge tier={student.badge_tier} size="x-small" /> {/* Using simplified Badge */}
                            <div className="badge-details">
                              <p className="badge-name-text">{leagues.find(l => l.tier === student.badge_tier)?.name || 'N/A'}</p>
                              <DivisionIndicator division={student.badge_division || 1} totalDivisions={5} />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="muted-text" style={{textAlign: 'center', padding: '1rem'}}>No students on the leaderboard yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default BadgeRankingPage;