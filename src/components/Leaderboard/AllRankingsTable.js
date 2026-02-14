import React from 'react';

/**
 * Full rankings table.
 * @param {{ rows: any[], currentUserId: string | null, getLeagueColor: (league: string) => string }} props
 */
function AllRankingsTable({ rows, currentUserId, getLeagueColor }) {
  if (!rows.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
      <h2 className="text-3xl font-semibold text-gray-900 mb-4">All Rankings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                League
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((student) => (
              <tr
                key={`${student.user_id || 'unknown'}-${student.rank}`}
                className={`${currentUserId === student.user_id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{student.rank}</td>
                <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">
                  {student.name || 'Unknown'}
                  {currentUserId === student.user_id && (
                    <span className="ml-2 px-2 inline-flex text-base leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      You
                    </span>
                  )}
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
  );
}

export default AllRankingsTable;

