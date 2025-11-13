// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { apiClient } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);
  
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/api/auth/profile/');
        setProfile(response.data);
        setName(response.data.name);
        setBio(response.data.profile.bio || ''); // Ensure bio is not null
        setAvatarUrl(response.data.profile.avatar_url || ''); // Ensure avatar is not null
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchProfile();
    }, []);
  
    const handleUpdate = async (e) => {
      e.preventDefault();
      try {
        const response = await apiClient.put('/api/auth/profile/', {
          name: name,
          profile: {
            bio: bio,
            avatar_url: avatarUrl
          }
        });
        setProfile(response.data); 
        alert('Profile updated!');
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    };
  
    if (loading) return <Spinner />;
    if (!profile) return <p>Could not load profile.</p>;
  
    return (
      <div className="container mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Account Settings</h1>
        
        {/* MODIFIED: Wrapped in a modern card */}
        <form onSubmit={handleUpdate} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
          
          {/* Avatar Preview Section */}
          <div className="flex items-center space-x-4">
            <img 
              src={avatarUrl || `https://ui-avatars.com/api/?name=${name || 'User'}&background=random`} 
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <label htmlFor="avatarUrl" className="block text-sm font-medium text-slate-700">Avatar URL</label>
              <input 
                type="text" 
                id="avatarUrl"
                value={avatarUrl} 
                onChange={(e) => setAvatarUrl(e.target.value)} 
                placeholder="https://your-image-url.com/avatar.png"
                className="mt-1 block w-full p-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
            <input 
              type="text" 
              id="name"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="mt-1 block w-full p-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <input 
              type="email" 
              id="email"
              value={profile.email} 
              disabled 
              className="mt-1 block w-full p-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" 
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700">Bio</label>
            <textarea 
              id="bio"
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              rows="4"
              className="mt-1 block w-full p-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Tell us a little about yourself..."
            />
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-slate-700">
              Total XP: 
              <span className="text-lg font-bold text-indigo-600 ml-2">{profile.profile.total_xp}</span>
            </p>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    );
};

export default ProfilePage;