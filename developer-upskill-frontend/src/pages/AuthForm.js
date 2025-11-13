// src/pages/AuthForm.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthForm = ({ isLogin }) => {
    const [email, setEmail] = useState(''); 
    const [name, setName] = useState(''); 
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const { loginUser, registerUser } = useAuth();
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (isLogin) {
        loginUser(email, password); 
      } else {
        if (password !== password2) {
            alert("Passwords don't match!");
            return;
        }
        registerUser(name, email, password); 
      }
    };
  
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative cartoonish elements */}
        <span className="pointer-events-none absolute -top-8 -left-8 w-40 h-40 rounded-xl bg-pixel-purple/20 blur-2xl" />
        <span className="pointer-events-none absolute bottom-10 -right-10 w-48 h-48 rounded-xl bg-emerald-500/10 blur-3xl" />
        <span className="pointer-events-none absolute top-24 right-16 w-3 h-3 rounded-sm bg-pixel-purple/70 shadow-pixel-sm" />
        <span className="pointer-events-none absolute bottom-24 left-12 w-2.5 h-2.5 rounded-sm bg-emerald-500/70 shadow-pixel-sm" />

        {/* Mascot */}
        <div className="absolute -top-6 right-6 select-none" aria-hidden="true">
          <div className="w-14 h-14 rounded-xl bg-slate-800 border border-pixel-border shadow-pixel-box flex items-center justify-center animate-bounce">
            <span className="text-2xl">🤖</span>
          </div>
        </div>

        {/* Card */}
        <div className="max-w-md w-full space-y-8 bg-pixel-card-bg p-8 md:p-10 rounded-xl shadow-pixel-box border border-pixel-border">
          <div className="text-center">
            <h2 className="text-3xl font-pixel font-bold tracking-wide text-white">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-2 text-pixel-gray-light font-sans text-sm">
              {isLogin ? 'Sign in to continue your journey' : 'Join and start leveling up'}
            </p>
            <div className="mx-auto mt-4 h-1 w-20 bg-gradient-to-r from-pixel-purple to-emerald-500 rounded-full" />
          </div>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-3">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="sr-only">Your Name</label>
                  <input
                    id="name" name="name" type="text" required
                    className="w-full px-3 py-3 rounded-lg border border-pixel-border bg-slate-700 text-pixel-gray-light placeholder-pixel-gray-light text-sm font-sans focus:outline-none focus:ring-1 focus:ring-pixel-purple focus:border-pixel-purple shadow-pixel-sm transition-all"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="sr-only">Email Address</label>
                <input
                  id="email" name="email" type="email" required 
                  className="w-full px-3 py-3 rounded-lg border border-pixel-border bg-slate-700 text-pixel-gray-light placeholder-pixel-gray-light text-sm font-sans focus:outline-none focus:ring-1 focus:ring-pixel-purple focus:border-pixel-purple shadow-pixel-sm transition-all"
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password" name="password" type="password" required
                  className="w-full px-3 py-3 rounded-lg border border-pixel-border bg-slate-700 text-pixel-gray-light placeholder-pixel-gray-light text-sm font-sans focus:outline-none focus:ring-1 focus:ring-pixel-purple focus:border-pixel-purple shadow-pixel-sm transition-all"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {!isLogin && (
                <div> 
                  <label htmlFor="password2" className="sr-only">Confirm Password</label>
                  <input
                    id="password2" name="password2" type="password" required
                    className="w-full px-3 py-3 rounded-lg border border-pixel-border bg-slate-700 text-pixel-gray-light placeholder-pixel-gray-light text-sm font-sans focus:outline-none focus:ring-1 focus:ring-pixel-purple focus:border-pixel-purple shadow-pixel-sm transition-all"
                    placeholder="Confirm Password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                  />
                </div>
              )}
            </div>
 
            <div>
              <button
                type="submit"
                className="w-full py-3 px-4 text-sm font-pixel rounded-lg text-white bg-pixel-purple hover:bg-pixel-purple-dark transition-colors shadow-pixel-button active:shadow-pixel-button-hover active:translate-x-0.5 active:translate-y-0.5"
              >
                {isLogin ? 'Sign in' : 'Register'}
              </button>
            </div>
          </form>
          <div className="text-sm text-center">
            <p className="text-pixel-gray-light font-sans">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Link to={isLogin ? "/register" : "/login"} className="font-pixel text-pixel-purple hover:text-pixel-purple-dark">
                {isLogin ? "Register here" : "Sign in here"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
};

export default AuthForm;