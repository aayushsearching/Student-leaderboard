import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BadgeRankingPage.css';
import { useLeaderboard } from '../hooks/useLeaderboard';
import TopStudentsGrid from '../components/Leaderboard/TopStudentsGrid';
import AllRankingsTable from '../components/Leaderboard/AllRankingsTable';

const getLeagueColor = (league) => {
  switch (league) {
    case 'Novice':
      return 'bg-gray-200 text-gray-800';
    case 'Learner':
      return 'bg-yellow-100 text-yellow-800';
    case 'Scholar':
      return 'bg-blue-100 text-blue-800';
    case 'Skilled':
      return 'bg-green-100 text-green-800';
    case 'Expert':
      return 'bg-indigo-100 text-indigo-800';
    case 'Master':
      return 'bg-purple-100 text-purple-800';
    case 'Elite':
      return 'bg-pink-100 text-pink-800';
    case 'Apex':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Leaderboard page with top-3 and top-10 sections.
 * @param {{ user: { id: string } | null }} props
 */
function BadgeRankingPage({ user }) {
  const navigate = useNavigate();
  const {
    loadingTop3,
    errorTop3,
    top3Students,
    currentUserData,
    loadingTop10,
    errorTop10,
    leaderboardTop10,
  } = useLeaderboard(user);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-500">Top performing students</p>
      </div>

      {loadingTop3 && <p className="text-center text-gray-600">Loading top 3 leaderboard...</p>}
      {errorTop3 && <p className="text-center text-red-500">Error loading top 3: {errorTop3}</p>}

      {!loadingTop3 && !errorTop3 && (
        <TopStudentsGrid students={top3Students} getLeagueColor={getLeagueColor} />
      )}

      {loadingTop10 && <p className="text-center text-gray-600">Loading all rankings...</p>}
      {errorTop10 && <p className="text-center text-red-500">Error loading all rankings: {errorTop10}</p>}

      {!loadingTop10 && !errorTop10 && (
        <AllRankingsTable
          rows={leaderboardTop10}
          currentUserId={currentUserData?.user_id || null}
          getLeagueColor={getLeagueColor}
        />
      )}
    </div>
  );
}

export default BadgeRankingPage;


