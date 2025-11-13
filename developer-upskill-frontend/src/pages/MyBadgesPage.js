// src/pages/MyBadgesPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { apiClient } from '../context/AuthContext';
import Spinner from '../components/Spinner';

// Enhanced trophy/medal icon with subtle gradient
const BadgeIcon = () => (
    <svg className="w-16 h-16" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="medalGradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#fde68a"/>
          <stop offset="50%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#b45309"/>
        </linearGradient>
        <linearGradient id="ribbonGradient" x1="0" x2="1">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="24" r="16" fill="url(#medalGradient)" stroke="#fcd34d" strokeWidth="2"/>
      <path d="M24 40 L18 60 L30 54 L32 64 L34 54 L46 60 L40 40" fill="url(#ribbonGradient)"/>
      <circle cx="32" cy="24" r="8" fill="#fff8db" opacity="0.9"/>
      <path d="M32 18 l2.472 5.007 5.528.804-4 3.902.944 5.5L32 30.5l-4.944 2.713.944-5.5-4-3.902 5.528-.804z" fill="#f59e0b"/>
    </svg>
);

const MyBadgesPage = () => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchBadges = async () => {
        try {
          const response = await apiClient.get('/api/my-badges/');
          setBadges(response.data);
        } catch (error) {
          console.error("Failed to fetch badges:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchBadges();
    }, []);
    
    // Sort newest first for a nicer experience
    const sortedBadges = useMemo(() => {
      return [...badges].sort((a, b) => new Date(b.earned_on) - new Date(a.earned_on));
    }, [badges]);
    
    if (loading) return <Spinner />;
    
    return (
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl mb-10 p-8 md:p-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Badges</h1>
            <p className="text-white/90 text-lg">Your trophy case. Earn a badge for every skill you complete.</p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-sm font-medium">Total Badges</span>
              <span className="px-2 py-0.5 rounded-full bg-white text-indigo-700 text-sm font-bold">{badges.length}</span>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedBadges.length === 0 && (
            <div className="col-span-full">
              <div className="flex flex-col items-center justify-center p-10 bg-white rounded-2xl shadow-lg border border-slate-100">
                <div className="mb-4">
                  <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 text-3xl">🏁</span>
                </div>
                <p className="text-slate-700 text-lg font-medium mb-1">No badges yet</p>
                <p className="text-slate-500 text-sm">Complete your first skill to earn a shiny new badge.</p>
              </div>
            </div>
          )}
          {sortedBadges.map((userBadge, index) => (
            <div key={userBadge.id} className="group relative bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
              {/* Accent ribbon */}
              <div className="absolute -top-2 -left-2">
                <span className="px-3 py-1 rounded-md bg-indigo-600 text-white text-xs font-semibold shadow">#{index + 1}</span>
              </div>
              <div className="p-6 text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mb-4 ring-8 ring-amber-50 group-hover:ring-amber-100 transition-all">
                  <BadgeIcon />
                </div>
                <h2 className="text-lg font-bold text-slate-900">{userBadge.badge.title}</h2>
                <p className="text-slate-600 text-sm mb-4 mt-1 px-2">{userBadge.badge.description}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-medium">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  Earned {format(new Date(userBadge.earned_on), 'PPP')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
};

export default MyBadgesPage;