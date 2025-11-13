import React from 'react';
import { Link } from 'react-router-dom';

const PathCard = ({ path }) => (
    <div className="bg-pixel-card-bg rounded-xl shadow-pixel-box overflow-hidden border border-pixel-border transform transition-all duration-75 hover:shadow-pixel-button hover:-translate-y-0.5">
        <div className="p-6">
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-pixel text-lg font-bold text-white pr-3">{path.title}</h3>
                <span className={`font-pixel text-[10px] px-2 py-1 rounded-md border border-pixel-border shadow-pixel-sm ${path.is_public ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-pixel-gray-light'}`}>
                    {path.is_public ? 'Public' : 'Private'}
                </span>
            </div>
            <p className="font-sans text-pixel-gray-light text-sm mb-3">By: {path.created_by_username}</p>
            <p className="font-sans text-pixel-gray-light mb-4 h-16 overflow-hidden">{path.description}</p>
            <Link 
                to={`/paths/${path.id}`}
                className="inline-block bg-pixel-purple text-white px-4 py-2 rounded-lg font-pixel text-sm hover:bg-pixel-purple-dark transition-colors shadow-pixel-button active:shadow-pixel-button-hover active:translate-x-0.5 active:translate-y-0.5"
            >
                View Path
            </Link>
        </div>
    </div>
);

export default PathCard;