import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { apiClient } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';

const MyLearningPage = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const response = await apiClient.get('/api/enrollments/');
                setEnrollments(response.data);
            } catch (error) {
                console.error("Failed to fetch enrollments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEnrollments();
    }, []);

    if (loading) return <Spinner />;

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Learning Dashboard</h1>
            {enrollments.length === 0 ? (
                <p className="text-gray-600">You are not enrolled in any skills yet. <Link to="/" className="text-blue-500 hover:underline">Explore skills</Link> to get started!</p>
            ) : (
                <div className="space-y-6">
                    {enrollments.map(enrollment => (
                        <div key={enrollment.id} className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{enrollment.skill.name}</h2>
                            <p className="text-sm text-gray-500 mb-4">Enrolled on: {format(new Date(enrollment.enrolled_on), 'PPP')}</p>
                            <ProgressBar progress={enrollment.progress} />
                             <Link to={`/skills/${enrollment.skill.id}`} className="mt-4 inline-block text-blue-500 hover:underline">
                                Continue Learning &rarr;
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyLearningPage;