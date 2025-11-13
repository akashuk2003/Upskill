import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../context/AuthContext';

const CreateLearningPathPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/api/paths/', {
                title,
                description,
                is_public: isPublic,
            });
            navigate(`/paths/${response.data.id}/manage`);
        } catch (error) {
            console.error("Failed to create path:", error);
            alert("Error creating path.");
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create a New Learning Path</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Path Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                           className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                              className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div className="flex items-center">
                    <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
                           className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                    <label className="ml-2 block text-sm text-gray-900">Make this path public</label>
                </div>
                <button type="submit" className="w-full bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600">
                    Create Path
                </button>
            </form>
        </div>
    );
};

export default CreateLearningPathPage;