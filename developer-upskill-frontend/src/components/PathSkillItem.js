// src/components/PathSkillItem.js
import React from 'react';
import { Link } from 'react-router-dom';
import LockIcon from './icons/LockIcon';
import CheckIcon from './icons/CheckIcon';
import ProgressBar from './ProgressBar';

const PathSkillItem = ({ item }) => {
    
    // 1. Locked State
    if (item.status === 'locked') {
        return (
            <div className="flex items-center p-4 border border-pixel-border rounded-lg bg-slate-800 opacity-50 cursor-not-allowed">
                <LockIcon className="w-6 h-6 text-slate-500 mr-4" />
                <span className="text-lg font-pixel font-medium text-slate-500">
                    {item.skill_name}
                </span>
            </div>
        );
    }

    // 2. Completed State
    if (item.status === 'completed') {
        return (
            <div className="flex items-center justify-between p-4 border border-pixel-border rounded-lg bg-slate-800">
                <div className="flex items-center">
                    <CheckIcon className="w-6 h-6 text-emerald-500 mr-4" />
                    <span className="text-lg font-pixel font-medium text-slate-400 line-through">
                        {item.skill_name}
                    </span>
                </div>
                <span className="font-sans text-sm font-medium text-emerald-500">Completed</span>
            </div>
        );
    }

    // 3. Unlocked State (In Progress or Not Started)
    return (
        <Link 
            to={`/skills/${item.skill}`} 
            className="block p-4 border border-pixel-border rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors hover:shadow-pixel-sm"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <span className="text-lg font-pixel font-bold text-pixel-purple mr-4">
                        {item.order + 1}.
                    </span>
                    <span className="text-lg font-pixel font-medium text-white">
                        {item.skill_name}
                    </span>
                </div>
                {item.progress > 0 && (
                    <span className="font-sans text-sm font-medium text-pixel-gray-light">
                        {item.progress === 100 ? 'Completed' : 'In Progress'}
                    </span>
                )}
            </div>
            
            {/* Show progress bar if started */}
            {item.progress > 0 && <ProgressBar progress={item.progress} />}
        </Link>
    );
};

export default PathSkillItem;