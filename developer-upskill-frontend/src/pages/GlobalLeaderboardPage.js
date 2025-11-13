// src/pages/GlobalLeaderboardPage.js
import React, { useState, useEffect } from 'react';
import { apiClient } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const rankStyles = [
  // 1st, 2nd, 3rd special chips
  'bg-yellow-400 text-slate-900',
  'bg-slate-300 text-slate-900',
  'bg-amber-600 text-white',
];

const GlobalLeaderboardPage = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchLeaderboard = async () => {
        try {
          const response = await apiClient.get('/api/leaderboard/');
          setLeaders(response.data || []);
        } catch (error) {
          console.error("Failed to fetch leaderboard:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchLeaderboard();
    }, []);
  
    if (loading) return <Spinner />;
  
    return (
      <div className="container mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-pixel font-bold text-white tracking-wide flex items-center">
            <span className="mr-3">Global Leaderboard</span>
            <span className="text-yellow-400">👑</span>
          </h1>
          <p className="mt-2 text-pixel-gray-light font-sans">
            See who’s on top. Earn XP by completing resources to climb the ranks!
          </p>
        </div>

        {/* Card */}
        <div className="bg-pixel-card-bg p-6 md:p-8 rounded-xl shadow-pixel-box border border-pixel-border">
          <div className="space-y-3">
            {leaders.length === 0 && (
              <div className="text-center text-pixel-gray-light py-8">No leaders yet.</div>
            )}
            {leaders.map((leader, index) => {
              const place = index + 1;
              const chip = rankStyles[index] || 'bg-slate-700 text-pixel-gray-light';
              const nameInitial = (leader.username || '?').charAt(0).toUpperCase();
              const xp = Number(leader.total_xp || 0).toLocaleString();
              return (
                <div
                  key={`${leader.username}-${index}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/60 border border-pixel-border hover:shadow-pixel-sm transition-all duration-150 hover:-translate-y-0.5"
                >
                  <div className="flex items-center">
                    {/* Rank chip */}
                    <span className={`w-10 h-10 flex items-center justify-center rounded-lg font-pixel text-sm mr-4 ${chip}`}>
                      {place}
                    </span>
                    {/* Avatar + name */}
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-md bg-slate-700 text-white flex items-center justify-center font-pixel text-sm border border-pixel-border">
                        {nameInitial}
                      </div>
                      <span className="ml-3 font-sans text-pixel-gray-light text-base md:text-lg">
                        {leader.username}
                      </span>
                    </div>
                  </div>
                  {/* XP pill */}
                  <span className="font-pixel text-xs md:text-sm px-3 py-1 rounded-md bg-pixel-purple text-white shadow-pixel-sm">
                    {xp} XP
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
};

export default GlobalLeaderboardPage;