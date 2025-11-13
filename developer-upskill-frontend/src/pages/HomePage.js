// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { apiClient, useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import SkillCard from '../components/SkillCard';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const [enrolledSkills, setEnrolledSkills] = useState([]);
    const [exploreSkills, setExploreSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
  
    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const skillsResponse = await apiClient.get('/api/skills/');
          const allSkills = skillsResponse.data || [];

          if (user) {
            const enrollmentsResponse = await apiClient.get('/api/enrollments/');
            const enrollments = enrollmentsResponse.data || [];
            const enrolledIds = new Set(enrollments.map(e => e.skill.id));
            const current = enrollments.map(e => ({
                ...e.skill, 
                progress: e.progress 
            }));
            setEnrolledSkills(current);
            const explore = allSkills.filter(skill => !enrolledIds.has(skill.id));
            setExploreSkills(explore);
          } else {
            setEnrolledSkills([]);
            setExploreSkills(allSkills);
          }
        } catch (error) {
          console.error("Failed to fetch skills:", error);
          setEnrolledSkills([]);
          setExploreSkills([]);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [user]); 
  
    if (loading) return <Spinner />;
  
  return (
      <div className="relative container mx-auto px-4 sm:px-6 py-12">

        {/* Hero with looped animated video */}
        {(() => {
          const heroVideoUrl = process.env.REACT_APP_HERO_VIDEO_URL;
          return (
            <section className="relative mb-12 h-[42vh] md:h-[58vh] rounded-2xl overflow-hidden border border-pixel-border shadow-pixel-box">
              {/* Fallback gradient layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" />
              {/* Video layer (optional) */}
              {heroVideoUrl && (
                <video
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={heroVideoUrl}
                />
              )}
              {/* Soft vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/40 to-transparent" />
              {/* Retro scanline overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize:'100% 3px'}} />
              {/* Content */}
              <div className="relative z-10 h-full flex items-center">
                <div className="px-6 md:px-10 max-w-2xl">
                  <p className="font-sans text-pixel-gray-light text-sm md:text-base mb-2">Welcome to</p>
                  <h1 className="font-pixel text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Developer Upskill</h1>
                  <p className="font-sans text-pixel-gray-light text-sm md:text-lg mb-6">
                    Start your up-skill journey with resources from Developers all around the World. Learn at your pace and track progress.
                  </p>
                  <div className="flex items-center space-x-3">
                    <a href="#explore" className="inline-flex items-center gap-2 bg-pixel-purple text-white px-5 py-3 rounded-lg font-pixel text-sm hover:bg-pixel-purple-dark focus:outline-none focus:ring-2 focus:ring-pixel-purple/60 transition-all shadow-pixel-button active:shadow-pixel-button-hover active:translate-x-0.5 active:translate-y-0.5">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 2a1 1 0 01.894.553l1.857 3.715 4.1.596a1 1 0 01.554 1.706l-2.967 2.892.701 4.087a1 1 0 01-1.451 1.054L10 15.347l-3.688 1.936a1 1 0 01-1.451-1.054l.701-4.087L2.595 8.57a1 1 0 01.554-1.706l4.1-.596L9.106 2.553A1 1 0 0110 2z"/></svg>
                      Explore Skills
                    </a>
                    <Link to="/leaderboard" className="inline-flex items-center gap-2 bg-slate-700 text-pixel-gray-light px-5 py-3 rounded-lg font-pixel text-sm hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500/60 transition-all shadow-pixel-button">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 21h10v-2H7v2zm5-18C7.48 3 4 6.48 4 11c0 2.83 1.64 5.26 4 6.32V19h8v-1.68c2.36-1.06 4-3.49 4-6.32 0-4.52-3.48-8-8-8z"/></svg>
                      View Leaderboard
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* Featured strip */}
        {exploreSkills.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-pixel-purple shadow-pixel-sm" />
                <h2 className="font-pixel text-xl md:text-2xl font-bold text-white">Featured</h2>
              </div>
              <a href="#explore" className="text-pixel-gray-light text-sm hover:text-white transition-colors">See all</a>
            </div>
            <div className="flex gap-3 overflow-x-auto py-2">
              {exploreSkills.slice(0, 12).map(skill => (
                <Link
                  key={skill.id}
                  to={`/skills/${skill.id}`}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pixel-border bg-pixel-card-bg text-pixel-gray-light hover:text-white hover:border-pixel-purple hover:shadow-pixel-sm focus:outline-none focus:ring-2 focus:ring-pixel-purple/40 transition-all"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-pixel-purple" />
                  <span className="font-sans text-sm">{skill.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Decorative 2D elements */}
        <span className="pointer-events-none absolute -top-6 -right-6 w-28 h-28 rounded-xl bg-pixel-purple/20 blur-xl" />
        <span className="pointer-events-none absolute -bottom-10 -left-10 w-32 h-32 rounded-xl bg-emerald-500/10 blur-2xl" />
        <span className="pointer-events-none absolute top-1/3 right-6 w-3 h-3 rounded-sm bg-pixel-purple/60 shadow-pixel-sm" />

        {/* Quick stats */}
        {(() => {
          const totalSkills = enrolledSkills.length + exploreSkills.length;
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
              <div className="rounded-xl p-5 bg-pixel-card-bg border border-pixel-border shadow-pixel-box">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pixel-gray-light text-sm">My Skills</p>
                    <p className="text-white font-pixel text-2xl">{enrolledSkills.length}</p>
                  </div>
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400">✓</span>
                </div>
              </div>
              <div className="rounded-xl p-5 bg-pixel-card-bg border border-pixel-border shadow-pixel-box">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pixel-gray-light text-sm">Explore</p>
                    <p className="text-white font-pixel text-2xl">{exploreSkills.length}</p>
                  </div>
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400">★</span>
                </div>
              </div>
              <div className="rounded-xl p-5 bg-pixel-card-bg border border-pixel-border shadow-pixel-box">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pixel-gray-light text-sm">Total Skills</p>
                    <p className="text-white font-pixel text-2xl">{totalSkills}</p>
                  </div>
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-pink-600/20 text-pink-400">∞</span>
                </div>
              </div>
            </div>
          );
        })()}

        {user && (
          <div className="mb-16">
            {/* MODIFIED: Added font-pixel, reduced size to 2xl, md:text-3xl */}
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2 h-2 bg-emerald-400 shadow-pixel-sm" />
              <h1 className="font-pixel text-2xl md:text-3xl font-bold text-white">My Current Skills</h1>
            </div>
            {/* MODIFIED: Added font-sans (default), increased size */}
            <p className="font-sans text-base md:text-lg text-pixel-gray-light mb-8">Pick up where you left off.</p>

            {/* Section divider */}
            <div className="h-1 w-28 bg-gradient-to-r from-pixel-purple to-emerald-500 rounded-full mb-6" />
            
            {enrolledSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledSkills.map(skill => (
                  <SkillCard 
                    key={skill.id} 
                    skill={skill} 
                    progress={skill.progress} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-10 bg-pixel-card-bg rounded-xl shadow-pixel-box border border-pixel-border text-pixel-gray-light font-sans">
                <p>You haven't enrolled in any skills yet.</p>
                <p className="mt-2">
                  Find your first skill in the "Explore" section below!
                </p>
              </div>
            )}
          </div>
        )}

        <div id="explore">
          {/* MODIFIED: Added font-pixel, reduced size */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 bg-pixel-purple shadow-pixel-sm" />
            <h1 className="font-pixel text-2xl md:text-3xl font-bold text-white">Explore Skills</h1>
          </div>
          {/* MODIFIED: Added font-sans (default), increased size */}
          <p className="font-sans text-base md:text-lg text-pixel-gray-light mb-8">
            {user 
              ? "Find your next challenge from skills you haven't started." 
              : "Browse skills shared by the community. Start learning something new today!"
            }
          </p>

          {/* Section divider */}
          <div className="h-1 w-28 bg-gradient-to-r from-emerald-500 to-pixel-purple rounded-full mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exploreSkills.length > 0 ? (
                exploreSkills.map(skill => <SkillCard key={skill.id} skill={skill} />)
            ) : (
                <div className="text-center p-10 bg-pixel-card-bg rounded-xl shadow-pixel-box border border-pixel-border text-pixel-gray-light font-sans col-span-full">
                    <p>
                        {user ? "Wow! You've enrolled in every skill available." : "No public skills are available at this time."}
                    </p>
                </div>
            )}
          </div>
        </div>
      </div>
    );
};

export default HomePage;