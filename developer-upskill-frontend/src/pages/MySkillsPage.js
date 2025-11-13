// src/pages/MySkillsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const MySkillsPage = () => {
    const [mySkills, setMySkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMySkills = async () => {
            try {
                const response = await apiClient.get('/api/skills/my_skills/');
                setMySkills(response.data);
            } catch (error) {
                console.error("Failed to fetch skills:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMySkills();
    }, []);

    if (loading) return <Spinner />;

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Created Skills</h1>
                    {/* NEW: Description */}
                    <p className="text-lg text-slate-600">This is your creator dashboard. Manage your skills or create a new one.</p>
                </div>
                <Link to="/create-skill" className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                    Create New Skill
                </Link>
            </div>
            <div className="space-y-6">
                {mySkills.length === 0 ? (
                    <p className="text-slate-600">You haven't created any skills yet.</p>
                ) : (
                    mySkills.map(skill => (
                        <div key={skill.id} className="bg-white p-6 rounded-xl shadow-lg flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">{skill.name}</h2>
                                <p className="text-sm text-slate-500 mb-2">
                                    {skill.is_public ? 
                                        <span className="font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">Public</span> : 
                                        <span className="font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">Private</span>
                                    }
                                </p>
                                <p className="text-slate-700">{skill.description}</p>
                            </div>
                            <Link to={`/skills/${skill.id}/manage`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                Manage &rarr;
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MySkillsPage;