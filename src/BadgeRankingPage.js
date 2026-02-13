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

      // Fetch leaderboard data with dynamically calculated ranks using the RPC
      const { data: rankedData, error: fetchError } = await supabase
        .rpc('get_leaderboard_with_rank')
        .order('rank', { ascending: true }); // Order by the calculated rank

      if (fetchError) throw fetchError;

      // The RPC returns a flat array, so profiles data needs to be structured manually for consistency
      const formattedRankedData = rankedData.map(entry => ({
        ...entry,
        profiles: {
          full_name: entry.full_name,
        }
      }));

      setLeaderboardData(formattedRankedData); // Set the full ranked leaderboard data

      // Find current user's data if logged in
      if (user) {
        const userEntry = formattedRankedData.find(entry => entry.user_id === user.id);
        if (userEntry) {
          setCurrentUserData(userEntry);
        } else {
          // If user is logged in but no leaderboard entry found, create one
          // This part still interacts with the 'leaderboard' table directly
          // Assuming 'leaderboard' table only contains user_id and score.
          console.log("Creating new leaderboard entry for user:", user.id);
          const { error: insertError } = await supabase
            .from('leaderboard')
            .insert([
              { user_id: user.id, score: 0 }
            ]);

          if (insertError) {
            throw insertError;
          } else {
            console.log('Leaderboard entry created, re-fetching data...');
            // Re-fetch data to include the newly created entry
            await fetchLeaderboardData(); // This will re-run the whole fetch process
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
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
    league: currentUserData?.league, // Directly use the league from RPC
    points: currentUserData?.score || 0,
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
                    {currentUserDisplay.league && currentUserDisplay.league !== 'Unranked' && (
                      <p className="user-league">League: {currentUserDisplay.league}</p>
                    )}
                    {currentUserDisplay.league === 'Unranked' && (
                      <p className="user-league">League: No League Yet</p>
                    )}
                  </div>
                  <div className="user-league-display">
                    {currentUserDisplay.league && currentUserDisplay.league !== 'Unranked' && (
                      <span className="league-badge">{currentUserDisplay.league}</span>
                    )}
                    {currentUserDisplay.league === 'Unranked' && (
                      <span className="league-badge">Unranked</span>
                    )}
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
                      <th>Points</th>
                      <th>League</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.length > 0 ? (
                      leaderboardData.map((student) => (
                        <tr key={student.user_id}> {/* Use user_id as key as it's unique */}
                          <td>{formatRank(student.rank)}</td>
                          <td>{student.profiles.full_name || 'Unknown User'}</td>
                          <td>{student.score}</td>
                          <td className="leaderboard-league-cell">
                            {student.league && student.league !== 'Unranked' && (
                              <span className="league-badge">{student.league}</span>
                            )}
                            {student.league === 'Unranked' && (
                              <span className="league-badge">Unranked</span>
                            )}
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