import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const ManageLearningPathPage = () => {
    const { id } = useParams();
    const [path, setPath] = useState(null);
    const [skillsInPath, setSkillsInPath] = useState([]); 
    const [availableSkills, setAvailableSkills] = useState([]); 
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [pathTitle, setPathTitle] = useState('');
    const [pathDescription, setPathDescription] = useState('');
    const [pathIsPublic, setPathIsPublic] = useState(false);

    // 2. Wrap fetchAllData in useCallback
    const fetchAllData = useCallback(async () => {
        try {
            const pathRes = await apiClient.get(`/api/paths/${id}/`);
            setPath(pathRes.data);
            
            setPathTitle(pathRes.data.title);
            setPathDescription(pathRes.data.description);
            setPathIsPublic(pathRes.data.is_public);

            const skillsRes = await apiClient.get('/api/skills/my_skills/');
            
            const skillIdsInPath = pathRes.data.items.map(item => item.skill);
            const skills = skillsRes.data.filter(s => skillIdsInPath.includes(s.id));
            setSkillsInPath(skills);

            const available = skillsRes.data.filter(s => !skillIdsInPath.includes(s.id));
            setAvailableSkills(available);

        } catch (error) {
            console.error("Failed to load data:", error);
            alert("Could not load path. You may not be the owner.");
            navigate('/my-paths');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]); // 3. Add its dependencies

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleUpdatePath = async (e) => {
        e.preventDefault();
        try {
            await apiClient.put(`/api/paths/${id}/`, {
                title: pathTitle,
                description: pathDescription,
                is_public: pathIsPublic
            });
            alert("Learning path details updated!");
        } catch (error) {
            console.error("Failed to update path:", error);
            alert("Error updating path details.");
        }
    };

    const addSkillToPath = (skillToAdd) => {
        setSkillsInPath(prev => [...prev, skillToAdd]);
        setAvailableSkills(prev => prev.filter(s => s.id !== skillToAdd.id));
    };

    const removeSkillFromPath = (skillToRemove) => {
        setSkillsInPath(prev => prev.filter(s => s.id !== skillToRemove.id));
        setAvailableSkills(prev => [...prev, skillToRemove]);
    };

    const handleSavePathSkills = async () => {
        try {
            const skill_ids = skillsInPath.map(s => s.id);
            await apiClient.put(`/api/paths/${id}/manage_skills/`, {
                skill_ids: skill_ids
            });
            alert("Path skill configuration saved successfully!");
        } catch (error) {
            console.error("Failed to save path:", error);
            alert("Error saving path configuration.");
        }
    };

    if (loading) return <Spinner />;
    if (!path) return null;

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Learning Path</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Path Details</h2>
                <form onSubmit={handleUpdatePath} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Path Title</label>
                        <input type="text" value={pathTitle} onChange={(e) => setPathTitle(e.target.value)} required
                               className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea value={pathDescription} onChange={(e) => setPathDescription(e.target.value)}
                                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md" rows="3" />
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" checked={pathIsPublic} onChange={(e) => setPathIsPublic(e.target.checked)}
                               className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                        <label className="ml-2 block text-sm text-gray-900">Make this path public</label>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                        Save Details
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Skills</h2>
                    <div className="space-y-3">
                        {availableSkills.length === 0 && <p>No more skills available to add.</p>}
                        {availableSkills.map(skill => (
                            <div key={skill.id} className="flex justify-between items-center p-3 border rounded-lg">
                                <p className="text-gray-800">{skill.name}</p>
                                <button onClick={() => addSkillToPath(skill)}
                                        className="text-green-500 hover:text-green-700 font-semibold">
                                    Add +
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Skills in this Path</h2>
                    <div className="space-y-3 mb-6">
                        {skillsInPath.length === 0 && <p>No skills added yet.</p>}
                        {skillsInPath.map((skill, index) => (
                            <div key={skill.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                                <div>
                                    <span className="text-lg font-bold text-blue-600 mr-3">{index + 1}.</span>
                                    <span className="text-gray-800">{skill.name}</span>
                                </div>
                                <button onClick={() => removeSkillFromPath(skill)}
                                        className="text-red-500 hover:text-red-700 font-semibold">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleSavePathSkills}
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600">
                        Save Path Skill Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageLearningPathPage;