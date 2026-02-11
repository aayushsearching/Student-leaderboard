import React, { useState, useEffect, useCallback } from 'react';
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

const getDivisionLabel = (division) => {
  switch (division) {
    case 5: return 'V';
    case 4: return 'IV';
    case 3: return 'III';
    case 2: return 'II';
    case 1: return 'I';
    default: return '';
  }
};

const leagues = [
  { name: 'Novice', tier: 'novice', description: 'Easy progression to welcome new players.', pointsPerDivision: 50 },
  { name: 'Learner', tier: 'learner', description: 'Moderate grind, requiring consistent effort.', pointsPerDivision: 75 },
  { name: 'Scholar', tier: 'scholar', description: 'Moderate grind, requiring consistent effort.', pointsPerDivision: 100 },
  { name: 'Skilled', tier: 'skilled', description: 'A significant grind, rewarding dedication.', pointsPerDivision: 150 },
  { name: 'Expert', tier: 'expert', description: 'A significant grind, rewarding dedication.', pointsPerDivision: 200 },
  { name: 'Master', tier: 'master', description: 'A very hard climb, for seasoned participants.', pointsPerDivision: 300 },
  { name: 'Elite', tier: 'elite', description: 'A very hard climb, for seasoned participants.', pointsPerDivision: 400 },
  { name: 'Apex', tier: 'apex', description: 'The pinnacle of achievement, for the top 1%.', pointsPerDivision: 500 }, // Points to maintain or for future seasons
];

// Simplified Badge component - will use CSS classes
const Badge = ({ tier, division, size = 'medium' }) => {
  const league = leagues.find(l => l.tier === tier);
  const divisionLabel = getDivisionLabel(division);
  const capitalizedTier = league ? league.name.charAt(0).toUpperCase() + league.name.slice(1) : 'Unranked';
  
  return (
    <div className={`badge-display badge-${tier} badge-size-${size}`}>
      <span className="league-title">{`${capitalizedTier} ${divisionLabel}`}</span>
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

  const fetchLeaderboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('leaderboard')
        .select(`
          score,
          rank,
          badge_tier,
          badge_division,
          profiles (
            full_name,
            academic_year,
            branch
          )
        `)
        .order('rank', { ascending: true }); // Order by rank

      if (fetchError) throw fetchError;

      setLeaderboardData(data);

      // Find current user's data if logged in
      if (user) { // Use the user prop directly
        const userEntry = data.find(entry => entry.profiles?.full_name === user.full_name); // Assuming full_name is unique enough or use user.id
        if (userEntry) {
          setCurrentUserData(userEntry);
        } else {
          // If user is logged in but not in top 10, fetch their specific data
          const { data: userData, error: userError } = await supabase
            .from('leaderboard')
            .select(`
              score,
              rank,
              badge_tier,
              badge_division,
              profiles (
                full_name,
                academic_year,
                branch
              )
            `)
            .eq('user_id', user.id) // Use user.id from prop
            .single();
          if (userError && userError.code !== 'PGRST116') throw userError; // PGRST116 is 'No rows found'
          setCurrentUserData(userData);

          // If user is logged in but no leaderboard entry found, create one
          if (user && !userData) {
            console.log("Creating new leaderboard entry for user:", user.id);
            const { error: insertError } = await supabase
              .from('leaderboard')
              .insert([
                { user_id: user.id, score: 0 } // Only insert user_id and score, rank is calculated by DB
              ]);

            if (insertError) {
              throw insertError; // Throw the error so it's caught by the outer catch block
            } else {
              console.log('Leaderboard entry created, re-fetching data...');
              // Re-fetch data to include the newly created entry
              await fetchLeaderboardData(); // This will re-run the whole fetch process
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return; // Silently ignore AbortError
      console.error('Error fetching leaderboard data:', err);
      setError('Failed to load leaderboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect to login if no user
      return;
    }
    fetchLeaderboardData();
  }, [user, navigate, fetchLeaderboardData]); // Depend on user and navigate

  // Prepare current user mock data using fetched data
  const currentUserDisplay = {
    name: currentUserData?.profiles?.full_name || 'You',
    rank: currentUserData?.rank,
    badge: { 
      name: (leagues.find(l => l.tier === currentUserData?.badge_tier)?.name ? 
             (leagues.find(l => l.tier === currentUserData?.badge_tier).name.charAt(0).toUpperCase() + 
              leagues.find(l => l.tier === currentUserData?.badge_tier).name.slice(1)) : 'Unranked') + 
             ' ' + getDivisionLabel(currentUserData?.badge_division || 1),
      tier: currentUserData?.badge_tier || 'novice', 
      division: currentUserData?.badge_division || 1 
    },
    course: currentUserData?.profiles?.branch, 
    year: currentUserData?.profiles?.academic_year,
    points: currentUserData?.score || 0,
    pointsToNextDivision: (() => {
      if (!currentUserData) return null;
      const currentLeague = leagues.find(l => l.tier === currentUserData.badge_tier);
      if (!currentLeague) return null;
      const scoreInLeague = currentUserData.score - (leagues.slice(0, leagues.indexOf(currentLeague)).reduce((acc, l) => acc + l.pointsPerDivision * 5, 0));
      const pointsInDivision = scoreInLeague % currentLeague.pointsPerDivision;
      return currentLeague.pointsPerDivision - pointsInDivision;
    })()
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
                    {currentUserDisplay.pointsToNextDivision !== null && <p className="user-points">{currentUserDisplay.pointsToNextDivision} points to next division</p>}
                  </div>
                  <div className="user-badge">
                    <Badge tier={currentUserDisplay.badge.tier} division={currentUserDisplay.badge.division} size="small" /> {/* Using simplified Badge */}
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
                <div className="table-responsive-wrapper"> {/* New wrapper for responsive table */}
                  <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th className="hide-mobile">Details</th>
                      <th>Points</th>
                      <th className="hide-mobile">League</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.length > 0 ? (
                      leaderboardData.map((student) => (
                        <tr key={student.user_id}> {/* Use user_id as key as it's unique */}
                          <td>{formatRank(student.rank)}</td>
                          <td>{student.profiles.full_name}</td>
                          <td className="hide-mobile">{student.profiles.branch} ({student.profiles.academic_year})</td>
                          <td>{student.score}</td>
                          <td className="leaderboard-badge-cell hide-mobile">
                            <Badge tier={student.badge_tier} division={student.badge_division} size="x-small" /> {/* Using simplified Badge */}
                            {/* <div className="badge-details">
                              <p className="badge-name-text">{leagues.find(l => l.tier === student.badge_tier)?.name || 'N/A'}</p>
                              <DivisionIndicator division={student.badge_division || 1} totalDivisions={5} />
                            </div> */}
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
                </div> {/* Closing tag for table-responsive-wrapper */}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default BadgeRankingPage;