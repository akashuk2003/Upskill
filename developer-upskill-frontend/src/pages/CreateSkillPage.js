// src/pages/CreateSkillPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../context/AuthContext';

const CreateSkillPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const payload = { name, description, is_public: isPublic };
            const res = await apiClient.post('/api/skills/', payload);
            const created = res.data;
            if (created && created.id) {
                // Send the user to manage the new skill
                navigate(`/skills/${created.id}/manage`);
            } else {
                navigate('/my-skills');
            }
        } catch (err) {
            const message = err?.response?.data?.error || err?.message || 'Failed to create skill';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 max-w-2xl">
            <h1 className="font-pixel text-3xl font-bold text-white mb-2">Create a New Skill</h1>
            <p className="font-sans text-lg text-pixel-gray-light mb-8">Define the basics. You can add resources after creating.</p>

            <form onSubmit={handleSubmit} className="bg-pixel-card-bg p-6 rounded-xl shadow-pixel-box border border-pixel-border space-y-5">
                {error && (
                    <div className="text-red-400 font-sans text-sm">{error}</div>
                )}

                <div>
                    <label className="block font-sans text-sm text-pixel-gray-light mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-pixel-border focus:outline-none focus:ring-2 focus:ring-pixel-purple"
                        placeholder="e.g. JavaScript Fundamentals"
                    />
                </div>

                <div>
                    <label className="block font-sans text-sm text-pixel-gray-light mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-pixel-border focus:outline-none focus:ring-2 focus:ring-pixel-purple"
                        placeholder="What will learners achieve?"
                    />
                </div>

                <div className="flex items-center space-x-3">
                    <input
                        id="isPublic"
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="h-4 w-4"
                    />
                    <label htmlFor="isPublic" className="font-sans text-sm text-pixel-gray-light">
                        Make this skill public
                    </label>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                    >
                        {submitting ? 'Creating...' : 'Create Skill'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateSkillPage;


