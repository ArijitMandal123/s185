import React from 'react';
import Scoreboard from '../components/Scoreboard';

const LeaderboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Global Leaderboard</h1>
          <Scoreboard />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage; 