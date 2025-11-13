// src/pages/LearningPathsPage.js
import React, { useState, useEffect } from 'react';
import { apiClient } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import PathCard from '../components/PathCard';

const LearningPathsPage = () => {
    const [paths, setPaths] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchPaths = async () => {
        try {
          const response = await apiClient.get('/api/paths/');
          setPaths(response.data);
        } catch (error) {
          console.error("Failed to fetch paths:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPaths();
    }, []);
  
    if (loading) return <Spinner />;
  
    return (
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Learning Paths</h1>
        {/* NEW: Description */}
        <p className="text-lg text-slate-600 mb-8">Follow guided roadmaps that bundle multiple skills together to achieve a larger goal.</p>

        <div className="space-y-6">
          {paths.map(path => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>
      </div>
    );
};

export default LearningPathsPage;