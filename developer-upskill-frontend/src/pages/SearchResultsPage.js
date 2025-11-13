import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import SkillCard from '../components/SkillCard';
import PathCard from '../components/PathCard';

const SearchResultsPage = () => {
    const [results, setResults] = useState({ skills: [], paths: [] });
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }
        
        const fetchResults = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/api/search/?q=${query}`);
                setResults(response.data);
            } catch (error) {
                console.error("Failed to fetch search results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (loading) return <Spinner />;

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Search Results for "{query}"</h1>
            
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.skills.length > 0 ? (
                    results.skills.map(skill => <SkillCard key={skill.id} skill={skill} />)
                ) : (
                    <p>No skills found.</p>
                )}
            </div>

            <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Learning Paths</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.paths.length > 0 ? (
                    results.paths.map(path => <PathCard key={path.id} path={path} />)
                ) : (
                    <p>No learning paths found.</p>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;