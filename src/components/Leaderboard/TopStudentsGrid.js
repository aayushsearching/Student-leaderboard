import React from 'react';

/**
 * Top-3 leaderboard cards.
 * @param {{ students: any[], getLeagueColor: (league: string) => string }} props
 */
function TopStudentsGrid({ students, getLeagueColor }) {
  if (!students.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 items-end">
      {students.map((student, index) => (
        <div
          key={student.user_id}
          className={`bg-white p-6 rounded-xl shadow-md text-center relative transition-all duration-300
            ${index === 0 ? 'border-2 border-indigo-500 shadow-lg scale-105' : ''}
            ${index === 1 ? 'order-first' : ''}
            ${index === 2 ? 'order-last' : ''}
          `}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg">
              {student.profiles.full_name ? student.profiles.full_name[0].toUpperCase() : '?'}
            </div>
          </div>
          <div className="absolute top-2 left-2 bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
            {student.rank}
          </div>
          <h3 className="font-bold text-lg text-gray-900">{student.profiles.full_name || 'Unknown'}</h3>
          <p className="text-2xl font-semibold text-gray-800">{student.score} Pts</p>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getLeagueColor(
              student.league
            )}`}
          >
            {student.league}
          </span>
        </div>
      ))}
    </div>
  );
}

export default TopStudentsGrid;

