// src/components/SkillCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

const SkillCard = ({ skill, progress }) => {
    const isEnrolled = progress !== undefined;
    const tags = Array.isArray(skill?.tags) ? skill.tags : [];
    const averageRating = Number.isFinite(skill?.average_rating) ? Math.round(skill.average_rating) : 0;
    const reviewCount = Number.isFinite(skill?.review_count) ? skill.review_count : 0;

    return (
        <div className="bg-pixel-card-bg rounded-xl shadow-pixel-box overflow-hidden border border-pixel-border transform transition-all duration-75 hover:shadow-pixel-button hover:-translate-y-0.5">
          <div className="p-6">
            
            {/* MODIFIED: font-pixel, reduced size to text-lg */}
            <h3 className="font-pixel text-lg font-bold text-white mb-2">{skill.name}</h3>
            {/* MODIFIED: font-sans (default), text-sm */}
            <p className="font-sans text-pixel-gray-light text-sm mb-4">By: {skill.created_by_username}</p>
            {/* MODIFIED: font-sans (default) */}
            <p className="font-sans text-pixel-gray-light mb-4 h-16 overflow-hidden">{skill.description}</p>
            
            <div className="mb-4 min-h-[20px]">
              {tags.map(tag => (
                // MODIFIED: font-sans (default), text-xs
                <span key={tag.id} className="font-sans inline-block bg-slate-700 text-pixel-gray-light text-xs font-medium mr-2 px-3 py-1 rounded-full border border-pixel-border shadow-pixel-sm">
                  {tag.name}
                </span>
              ))}
            </div>
            
            <div className="flex items-center mb-5">
              <span className="text-yellow-400">{'★'.repeat(averageRating)}</span>
              <span className="text-slate-600">{'★'.repeat(5 - averageRating)}</span>
              {/* MODIFIED: font-sans (default), text-sm */}
              <span className="font-sans text-pixel-gray-light text-sm ml-2">({reviewCount} reviews)</span>
            </div>
            
            {isEnrolled && (
                <div className="mb-4">
                    {/* MODIFIED: ProgressBar now uses font-sans internally for the % */}
                    <ProgressBar progress={progress} />
                </div>
            )}
            
            <Link 
                to={`/skills/${skill.id}`} 
                // MODIFIED: font-pixel, text-sm
                className="inline-block w-full text-center bg-pixel-purple text-white px-5 py-3 rounded-lg font-pixel text-sm font-medium hover:bg-pixel-purple-dark transition-colors shadow-pixel-button active:shadow-pixel-button-hover active:translate-x-0.5 active:translate-y-0.5"
            >
              {isEnrolled ? 'Continue' : 'Start Learning'}
            </Link>
          </div>
        </div>
    );
};

export default SkillCard;