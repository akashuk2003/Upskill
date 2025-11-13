import React, { useState, useEffect, useCallback } from 'react'; // 1. Import useCallback
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const ManageSkillPage = () => {
    const { id } = useParams();
    const [skill, setSkill] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
  
    const [skillName, setSkillName] = useState('');
    const [skillDescription, setSkillDescription] = useState('');
    const [skillIsPublic, setSkillIsPublic] = useState(false);
  
    const [resTitle, setResTitle] = useState('');
    const [resUrl, setResUrl] = useState('');
    const [resType, setResType] = useState('ARTICLE');
    const [resXp, setResXp] = useState(10);
  
  // --- NEW: State for the module title ---
  const [resModule, setResModule] = useState('');
  
    // 2. Wrap fetchSkill in useCallback
    const fetchSkill = useCallback(async () => {
        try {
            const response = await apiClient.get(`/api/skills/${id}/`);
            setSkill(response.data);
            setSkillName(response.data.name);
            setSkillDescription(response.data.description);
            setSkillIsPublic(response.data.is_public);
        } catch (error) {
            console.error("Failed to fetch skill:", error);
            alert("Could not load skill. You may not be the owner.");
            navigate('/my-skills');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]); // 3. Add its dependencies
  
    useEffect(() => {
        fetchSkill();
    }, [fetchSkill]); // 4. Use fetchSkill as the dependency
  const handleUpdateSkill = async (e) => {
      e.preventDefault();
      const tag_names = skill.tags.map(tag => tag.name);
      try {
          await apiClient.put(`/api/skills/${id}/`, {
              name: skillName,
              description: skillDescription,
              is_public: skillIsPublic,
              tag_names: tag_names
          });
          alert("Skill details updated successfully!");
          fetchSkill(); 
      } catch (error) {
          console.error("Failed to update skill:", error);
          alert("Error updating skill.");
      }
  };

  const handleAddResource = async (e) => {
      e.preventDefault();
      try {
          await apiClient.post('/api/resources/', {
              title: resTitle,
              url: resUrl,
              resource_type: resType,
              xp: resXp,
              skill: id, 
              order: (skill.resources.length || 0) + 1,
              module_title: resModule // --- NEW: Send the module title ---
          });
          setResTitle('');
          setResUrl('');
          setResXp(10);
          setResModule(''); // --- NEW: Clear the module state ---
          fetchSkill();
      } catch (error) {
          console.error("Failed to add resource:", error);
          alert("Error adding resource. Check console.");
      }
  };

  const handleDeleteResource = async (resourceId) => {
      if (!window.confirm("Are you sure you want to delete this resource?")) return;
      try {
          await apiClient.delete(`/api/resources/${resourceId}/`);
          fetchSkill(); 
      } catch (error) {
          console.error("Failed to delete resource:", error);
          alert("Error deleting resource.");
      }
  };

  if (loading) return <Spinner />;
  if (!skill) return null;

  return (
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Manage Skill</h1>
              <form onSubmit={handleUpdateSkill} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Skill Name</label>
                      <input type="text" value={skillName} onChange={(e) => setSkillName(e.target.value)} required
                             className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea value={skillDescription} onChange={(e) => setSkillDescription(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md" rows="5" />
                  </div>
                  <div className="flex items-center">
                      <input type="checkbox" checked={skillIsPublic} onChange={(e) => setSkillIsPublic(e.target.checked)}
                             className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                      <label className="ml-2 block text-sm text-gray-900">Make this skill public</label>
                  </div>
                  <button type="submit" className="w-full bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600">
                      Save Changes
                  </button>
              </form>
          </div>

          <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Add New Resource</h2>
                  <form onSubmit={handleAddResource} className="space-y-4">
                      {/* --- NEW: Module Title Input --- */}
                      <div>
                          <label className="block text-sm font-medium text-slate-700">Module Title (Optional)</label>
                          <input 
                              type="text" 
                              value={resModule} 
                              onChange={(e) => setResModule(e.target.value)}
                              placeholder="e.g., Module 1: Python Basics"
                              className="mt-1 block w-full p-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700">Lesson Title</label>
                          <input type="text" value={resTitle} onChange={(e) => setResTitle(e.target.value)} required
                                 className="mt-1 block w-full p-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700">URL</label>
                          <input type="url" value={resUrl} onChange={(e) => setResUrl(e.target.value)} required
                                 className="mt-1 block w-full p-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      <div className="flex gap-4">
                          <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700">Type</label>
                              <select value={resType} onChange={(e) => setResType(e.target.value)}
                                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                  <option value="ARTICLE">Article</option>
                                  <option value="YOUTUBE_VIDEO">YouTube Video</option>
                                  <option value="STUDY_MATERIAL">Study Material</option>
                              </select>
                          </div>
                          <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700">XP</label>
                              <input type="number" value={resXp} onChange={(e) => setResXp(parseInt(e.target.value))} required
                                     className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                          </div>
                      </div>
                      <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                          Add Resource
                      </button>
                  </form>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Resources</h2>
                  <div className="space-y-4">
                      {skill.resources.length === 0 && <p>No resources added yet.</p>}
                      {skill.resources.map(resource => (
                          <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                  <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{resource.resource_type}</span>
                                  <p className="text-lg font-medium text-gray-800">{resource.title}</p>
                              </div>
                              <button onClick={() => handleDeleteResource(resource.id)}
                                      className="text-red-500 hover:text-red-700 font-semibold">
                                  Delete
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );
};

export default ManageSkillPage;