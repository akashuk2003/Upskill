// src/pages/LearningPathDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient, useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

// --- THIS IS THE FIX ---
// Remove the curly braces {} from these imports
import PathSkillItem from '../components/PathSkillItem'; 
import LockIcon from '../components/icons/LockIcon';
import CheckIcon from '../components/icons/CheckIcon';
// --- END OF FIX ---

const LearningPathDetailPage = () => {
    const [path, setPath] = useState(null);
    const [skillItems, setSkillItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const { user } = useAuth();

    const fetchPathData = useCallback(async () => {
        setLoading(true);
        try {
            const pathResponse = await apiClient.get(`/api/paths/${id}/`);
            const pathData = pathResponse.data;
            
            let enrollments = [];
            if (user) {
                const enrollmentResponse = await apiClient.get('/api/enrollments/');
                enrollments = enrollmentResponse.data || [];
            }
            
            const progressMap = new Map(enrollments.map(e => [e.skill.id, e.progress]));

            let previousSkillCompleted = true; 
            
            const itemsWithStatus = pathData.items.map(item => {
                const progress = progressMap.get(item.skill) || 0;
                let status = 'locked';

                if (previousSkillCompleted) {
                    status = 'unlocked';
                }
                
                if (progress === 100) {
                    status = 'completed';
                }

                previousSkillCompleted = (progress === 100);

                return { ...item, status, progress };
            });

            setPath(pathData);
            setSkillItems(itemsWithStatus); 

        } catch (error) {
            console.error("Failed to fetch learning path data:", error);
        } finally {
            setLoading(false);
        }
    }, [id, user]); 

    useEffect(() => {
        fetchPathData();
    }, [fetchPathData]);

    if (loading) return <Spinner />;
    if (!path) return <p className="text-white text-center py-10">Learning Path not found.</p>;

    return (
        <div className="container mx-auto max-w-2xl px-6 py-12">
            {/* Path Header */}
            <div className="mb-8">
                <h1 className="font-pixel text-3xl font-bold text-white mb-2">{path.title}</h1>
                <p className="font-sans text-lg text-pixel-gray-light mb-2">
                    A guided path by: {path.created_by_username || 'Unknown Creator'}
                </p>
                <p className="font-sans text-lg text-pixel-gray-light">{path.description}</p>
            </div>

            {/* Skills List */}
            <div className="bg-pixel-card-bg p-6 rounded-xl shadow-pixel-box border border-pixel-border">
                <h2 className="font-pixel text-2xl font-bold text-white mb-6">Skills in this Path</h2>
                <div className="space-y-4">
                    {skillItems.length > 0 ? (
                        skillItems.map(item => (
                            <PathSkillItem key={item.skill} item={item} />
                        ))
                    ) : (
                        <p className="font-sans text-pixel-gray-light">This path doesn't have any skills yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LearningPathDetailPage;