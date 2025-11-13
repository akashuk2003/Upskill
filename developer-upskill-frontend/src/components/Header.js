// src/components/Header.js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';

// HamburgerIcon Component (unchanged)
const HamburgerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// CloseIcon Component (unchanged)
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Header = () => {
  const { user, logoutUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="bg-slate-800 border-b border-pixel-border sticky top-0 z-50 shadow-pixel-box">
      <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-lg font-pixel font-bold text-white hover:text-pixel-purple transition-colors">
          Developer Upskill
        </Link>
        
        {/* Desktop Nav Links (Hidden on Mobile) */}
        <div className="hidden md:flex items-center space-x-5">
          <Link to="/" className="text-sm font-pixel text-pixel-gray-light hover:text-pixel-purple transition-colors">Skills</Link>
          <Link to="/paths" className="text-sm font-pixel text-pixel-gray-light hover:text-pixel-purple transition-colors">Paths</Link>
          <Link to="/leaderboard" className="text-sm font-pixel text-pixel-gray-light hover:text-pixel-purple transition-colors">Leaderboard</Link>
        </div>

        {/* --- MODIFIED SECTION --- */}
        {/* Right side: Search + User Area (Desktop) */}
        <div className="hidden md:flex items-center md:space-x-2 lg:space-x-4">
          
          <div className="hidden lg:block">
            <SearchBar /> {/* Show search on large screens to prevent congestion */}
          </div>

          {user ? (
            // Logged-in User Dropdown
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <img 
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name || user.email}&background=random&color=fff`} 
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border border-pixel-border"
                />
                <span className="text-sm font-medium text-pixel-gray-light">
                  {user.name || user.email}
                </span>
                <svg className={`w-4 h-4 text-pixel-gray-light transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-pixel-box ring-1 ring-pixel-border p-2">
                  <Link to="/my-profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-pixel-gray-light rounded-lg hover:bg-slate-700">My Profile</Link>
                  <Link to="/my-learning" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-pixel-gray-light rounded-lg hover:bg-slate-700">My Learning</Link>
                  <Link to="/my-badges" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-pixel-gray-light rounded-lg hover:bg-slate-700">My Badges</Link>
                  <div className="border-t border-pixel-border my-2"></div>
                  <Link to="/my-skills" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-pixel-gray-light rounded-lg hover:bg-slate-700">My Skills (Creator)</Link>
                  <Link to="/my-paths" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-pixel-gray-light rounded-lg hover:bg-slate-700">My Paths (Creator)</Link>
                  <div className="border-t border-pixel-border my-2"></div>
                  <button onClick={() => { setIsDropdownOpen(false); logoutUser(); }} className="block w-full text-left px-4 py-2 text-sm text-red-400 rounded-lg hover:bg-slate-700">Logout</button>
                </div>
              )}
            </div>
          ) : (
            // Logged-out Auth Buttons
            <div className="flex items-center space-x-2">
              <Link to="/login" className="text-xs font-pixel px-3 py-2 bg-pixel-purple text-white rounded-lg hover:bg-pixel-purple-dark transition-colors shadow-pixel-button active:shadow-pixel-button-hover active:translate-x-0.5 active:translate-y-0.5">
                Login
              </Link>
              <Link to="/register" className="hidden lg:inline-block text-xs font-pixel px-3 py-2 bg-slate-700 text-pixel-gray-light rounded-lg hover:bg-slate-600 transition-colors shadow-pixel-button active:shadow-pixel-button-hover active:translate-x-0.5 active:translate-y-0.5">
                Register
              </Link>
            </div>
          )}
        </div>
        {/* --- END OF MODIFIED SECTION --- */}


        {/* Mobile Hamburger Button (Visible on Mobile) */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-pixel-gray-light">
            {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu (Dropdown) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-pixel-border p-4 space-y-2">
          <SearchBar />
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-pixel text-pixel-gray-light hover:bg-slate-700">Skills</Link>
          <Link to="/paths" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-pixel text-pixel-gray-light hover:bg-slate-700">Paths</Link>
          <Link to="/leaderboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-pixel text-pixel-gray-light hover:bg-slate-700">Leaderboard</Link>
          
          <div className="border-t border-pixel-border pt-4 mt-4 space-y-2">
            {user ? (
              <>
                <Link to="/my-profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-pixel-gray-light hover:bg-slate-700">My Profile</Link>
                <Link to="/my-learning" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-pixel-gray-light hover:bg-slate-700">My Learning</Link>
                <Link to="/my-badges" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-pixel-gray-light hover:bg-slate-700">My Badges</Link>
                <Link to="/my-skills" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-pixel-gray-light hover:bg-slate-700">My Skills</Link>
                <Link to="/my-paths" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-pixel-gray-light hover:bg-slate-700">My Paths</Link>
                <button onClick={() => { setIsMobileMenuOpen(false); logoutUser(); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-slate-700">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center text-sm font-pixel px-3 py-2 bg-pixel-purple text-white rounded-lg hover:bg-pixel-purple-dark transition-colors shadow-pixel-button">Login</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center text-sm font-pixel px-3 py-2 bg-slate-700 text-pixel-gray-light rounded-lg hover:bg-slate-600 transition-colors shadow-pixel-button">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;