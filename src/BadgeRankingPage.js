import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './BadgeRankingPage.css'; // Import the new CSS

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

const getLeagueColor = (league) => {
  switch (league) {
    case 'Novice': return 'bg-gray-200 text-gray-800';
    case 'Learner': return 'bg-yellow-100 text-yellow-800';
    case 'Scholar': return 'bg-blue-100 text-blue-800';
    case 'Skilled': return 'bg-green-100 text-green-800';
    case 'Expert': return 'bg-indigo-100 text-indigo-800';
    case 'Master': return 'bg-purple-100 text-purple-800';
    case 'Elite': return 'bg-pink-100 text-pink-800';
    case 'Apex': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
};

function BadgeRankingPage({ user }) {
  const [loadingTop3, setLoadingTop3] = useState(true);
  const [errorTop3, setErrorTop3] = useState(null);
  const [leaderboardTop3Data, setLeaderboardTop3Data] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0); // Reintroduced
  const [userRankPercentage, setUserRankPercentage] = useState(null); // Reintroduced
  const navigate = useNavigate();

  const [leaderboardTop10, setLeaderboardTop10] = useState([]);
  const [loadingTop10, setLoadingTop10] = useState(true);
  const [errorTop10, setErrorTop10] = useState(null);

  const fetchLeaderboardTop3Data = useCallback(async () => {
    try {
      setLoadingTop3(true);
      setErrorTop3(null);

      const { data: rankedData, error: fetchError } = await supabase
        .rpc('get_leaderboard_with_rank')
        .order('rank', { ascending: true });

      if (fetchError) throw fetchError;

      const formattedRankedData = rankedData.map(entry => ({
        ...entry,
        profiles: {
          full_name: entry.full_name,
        }
      }));

      setLeaderboardTop3Data(formattedRankedData);
      setTotalStudents(formattedRankedData.length); // Reintroduced calculation

      if (user) {
        const userEntry = formattedRankedData.find(entry => entry.user_id === user.id);
        if (userEntry) {
          setCurrentUserData(userEntry);
          // Calculate user percentage
          const percentage = (userEntry.rank / formattedRankedData.length) * 100;
          setUserRankPercentage(Math.round(percentage)); // Reintroduced calculation
        } else {
          console.log("User not found in leaderboard data. Attempting to create entry...");
          const { error: insertError } = await supabase
            .from('leaderboard')
            .insert([{ user_id: user.id, score: 0 }]);

          if (insertError) {
            console.error('Error creating new leaderboard entry:', insertError);
          } else {
            console.log('Leaderboard entry created, re-fetching data...');
            await fetchLeaderboardTop3Data();
          }
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setErrorTop3('Failed to load leaderboard data: ' + err.message);
    } finally {
      setLoadingTop3(false);
    }
  }, [user, setUserRankPercentage, setTotalStudents]); // Added back to dependencies

  const fetchLeaderboardTop10 = useCallback(async () => {
    try {
      setLoadingTop10(true);
      setErrorTop10(null);
      const { data, error } = await supabase.rpc('get_leaderboard_top10');
      if (error) throw error;
      setLeaderboardTop10(data || []);
    } catch (err) {
      console.error('Error fetching top 10 leaderboard:', err);
      setErrorTop10('Failed to load top 10 leaderboard: ' + err.message);
    } finally {
      setLoadingTop10(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchLeaderboardTop3Data();
    fetchLeaderboardTop10();

    const intervalId = setInterval(fetchLeaderboardTop10, 10000);

    return () => clearInterval(intervalId);
  }, [user, navigate, fetchLeaderboardTop3Data, fetchLeaderboardTop10]);

  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'leaderboard' },
        () => {
          console.log('Leaderboard updated via real-time, re-fetching data.');
          fetchLeaderboardTop3Data();
          fetchLeaderboardTop10();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboardTop3Data, fetchLeaderboardTop10]);

  const top3Students = leaderboardTop3Data.slice(0, 3);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Page Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
              <p className="text-gray-500">Top performing students</p>
            </div>
      
            {/* User Standing Section */}
            {currentUserData && userRankPercentage !== null && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Standing</h2>
                <div className="border-b border-gray-200 mb-4"></div> {/* Subtle divider */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* Name Card */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-xl font-medium text-gray-900 mt-1">{currentUserData.profiles.full_name || 'You'}</p>
                  </div>
                  {/* Rank Card */}
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-600">Rank</p>
                    <p className="text-2xl font-bold text-blue-800 mt-1">{formatRank(currentUserData.rank)}</p>
                  </div>
                  {/* Top Percentage Card */}
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm text-green-600">Top Percentage</p>
                    <p className="text-xl font-medium text-green-800 mt-1">Top {userRankPercentage}%</p>
                  </div>
                </div>
              </div>
            )}
      
            {loadingTop3 && <p className="text-center text-gray-600">Loading top 3 leaderboard...</p>}
            {errorTop3 && <p className="text-center text-red-500">Error loading top 3: {errorTop3}</p>}

      {!loadingTop3 && !errorTop3 && (
        <>
          {/* Top 3 Highlight Section */}
          {top3Students.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 items-end">
              {top3Students.map((student, index) => (
                <div
                  key={student.user_id}
                  className={`bg-white p-6 rounded-xl shadow-md text-center relative transition-all duration-300
                    ${index === 0 ? 'border-2 border-indigo-500 shadow-lg scale-105' : ''}
                    ${index === 1 ? 'order-first' : ''}
                    ${index === 2 ? 'order-last' : ''}
                  `}
                >
                  <div className="flex justify-center mb-4">
                    {/* Placeholder Avatar */}
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg">
                      {student.profiles.full_name ? student.profiles.full_name[0].toUpperCase() : '?'}
                    </div>
                  </div>
                  {/* Rank Badge */}
                  <div className="absolute top-2 left-2 bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    {student.rank}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{student.profiles.full_name || 'Unknown'}</h3>
                  <p className="text-2xl font-semibold text-gray-800">{student.score} Pts</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getLeagueColor(student.league)}`}>
                    {student.league}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* New All Rankings Section (Top 10) */}
      {loadingTop10 && <p className="text-center text-gray-600">Loading all rankings...</p>}
      {errorTop10 && <p className="text-center text-red-500">Error loading all rankings: {errorTop10}</p>}

      {!loadingTop10 && !errorTop10 && leaderboardTop10.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6"> {/* mt-6 for spacing */}
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">All Rankings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Points</th>
                                    <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">League</th>
                                  </tr>
                                </thead>              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboardTop10.map((student) => (
                  <tr
                    key={student.rank} // Using rank as key, assuming it's unique for top 10
                    className={`${currentUserData && currentUserData.user_id === student.user_id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{student.rank}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">
                      {student.name || 'Unknown'}
                      {currentUserData && currentUserData.user_id === student.user_id && <span className="ml-2 px-2 inline-flex text-base leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">You</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-700">{student.points}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-700">
                      <span className={`px-2 inline-flex text-lg leading-5 font-semibold rounded-full ${getLeagueColor(student.league)}`}>
                        {student.league}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default BadgeRankingPage;