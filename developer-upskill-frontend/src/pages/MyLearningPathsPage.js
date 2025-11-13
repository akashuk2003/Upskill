// src/pages/MyLearningPathsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../context/AuthContext'; // No longer need useAuth
import Spinner from '../components/Spinner';

const MyLearningPathsPage = () => {
    const [myPaths, setMyPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    // const { user } = useAuth(); // We don't need this anymore

    useEffect(() => {
        const fetchMyPaths = async () => {
            try {
                // --- THIS IS THE FIX ---
                // We call the new dedicated endpoint
                const response = await apiClient.get('/api/paths/my_paths/');
                
                // We no longer need to filter! The API does it for us.
                setMyPaths(response.data || []); // Ensure it's an array

            } catch (error) {
                console.error("Failed to fetch paths:", error);
                setMyPaths([]); // Set to empty on error
            } finally {
                setLoading(false);
            }
        };
        fetchMyPaths();
    }, []); // 3. Removed 'user' from dependency array

    if (loading) return <Spinner />;

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="font-pixel text-3xl font-bold text-white mb-2">My Learning Paths</h1>
                    <p className="font-sans text-lg text-pixel-gray-light">Combine your skills into guided roadmaps for other users to follow.</p>
                </div>
                <Link to="/create-path" className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                    Create New Path
                </Link>
            </div>
            <div className="space-y-6">
                {myPaths.length === 0 ? (
                    <p className="font-sans text-pixel-gray-light">You haven't created any learning paths yet.</p>
                ) : (
                    // This will now correctly map over the 8 paths from your API
                    myPaths.map(path => (
                        <div key={path.id} className="bg-pixel-card-bg p-6 rounded-xl shadow-lg border border-pixel-border flex justify-between items-center">
                            <div>
                                <h2 className="font-pixel text-2xl font-bold text-white mb-2">{path.title}</h2>
                                <p className="font-sans text-pixel-gray-light">{path.description}</p>
                            </div>
                            <Link to={`/paths/${path.id}/manage`} className="font-medium text-pixel-purple hover:text-pixel-purple-dark">
                                Manage &rarr;
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyLearningPathsPage;