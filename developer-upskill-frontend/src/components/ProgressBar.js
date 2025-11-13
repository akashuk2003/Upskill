// src/components/ProgressBar.js
import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    // MODIFIED: Removed relative, added padding, updated colors
    <div className="w-full bg-slate-700 rounded-lg h-4 p-0.5 relative overflow-hidden border border-pixel-border shadow-pixel-sm">
      <div 
        className="bg-emerald-500 h-full rounded-md" // Use emerald for "good"
        style={{ width: `${progress}%` }}
      ></div>
      {/* MODIFIED: Positioned text in the center, font-sans */}
      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-sans font-bold leading-none">
        {progress}%
      </span>
    </div>
  );
};

export default ProgressBar;