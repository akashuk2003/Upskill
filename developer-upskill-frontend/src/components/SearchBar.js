// src/components/SearchBar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- 1. MOVED PHRASES OUTSIDE ---
// This ensures the array isn't re-created on every render
const phrases = [
  'Search skills & paths',
  'Try "React"',
  'Try "Python"',
  'Try "Design Patterns"'
];

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Animated placeholder (typewriter) state
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Stop animating while the user is typing
    if (query) return;

    const currentPhrase = phrases[phraseIndex % phrases.length];

    const baseTypeSpeed = 90;
    const baseDeleteSpeed = 45;
    const endPauseMs = 1000;
    const startPauseMs = 400;

    let timeoutId;

    if (!isDeleting && charIndex <= currentPhrase.length) {
      // Typing forward
      timeoutId = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
        if (charIndex + 1 === currentPhrase.length) {
          // Pause at end before deleting
          setTimeout(() => setIsDeleting(true), endPauseMs);
        }
      }, baseTypeSpeed);
    } else if (isDeleting && charIndex >= 0) {
      // Deleting backward
      timeoutId = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
        if (charIndex - 1 <= 0) {
          // Pause before moving to next phrase
          setTimeout(() => {
            setIsDeleting(false);
            setPhraseIndex((phraseIndex + 1) % phrases.length);
          }, startPauseMs);
        }
      }, baseDeleteSpeed);
    }

    return () => clearTimeout(timeoutId);
    
    // --- 2. ADDED `phrases` TO DEPENDENCY ARRAY ---
  }, [query, charIndex, isDeleting, phraseIndex, phrases]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${query.trim()}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center space-x-2">
      <input
        type="text"
        placeholder={displayText || 'Search skills & paths'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-64 p-2.5 rounded-lg border border-pixel-border bg-slate-700 text-pixel-gray-light text-sm font-pixel placeholder-pixel-gray-light placeholder:text-xs focus:ring-1 focus:ring-pixel-purple focus:border-pixel-purple focus:outline-none shadow-pixel-sm" // Dark input, pixel font, small shadow, smaller placeholder
      />
      <button 
        type="submit" 
        className="bg-pixel-purple text-white px-5 py-2.5 rounded-lg font-pixel text-sm hover:bg-pixel-purple-dark transition-colors shadow-pixel-button active:shadow-pixel-button-hover active:translate-x-0.5 active:translate-y-0.5"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;