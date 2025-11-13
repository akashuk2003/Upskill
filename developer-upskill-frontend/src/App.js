// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';

// --- THIS IS THE FIX ---
// Notice there are NO curly braces around the page names
import HomePage from './pages/HomePage';
import AuthForm from './pages/AuthForm';
import SkillDetailPage from './pages/SkillDetailPage';
import MyLearningPage from './pages/MyLearningPage';
import ProfilePage from './pages/ProfilePage';
import MyBadgesPage from './pages/MyBadgesPage';
import GlobalLeaderboardPage from './pages/GlobalLeaderboardPage';
import LearningPathsPage from './pages/LearningPathsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import MySkillsPage from './pages/MySkillsPage';
import CreateSkillPage from './pages/CreateSkillPage';
import ManageSkillPage from './pages/ManageSkillPage';
import MyLearningPathsPage from './pages/MyLearningPathsPage';
import CreateLearningPathPage from './pages/CreateLearningPathPage';
import ManageLearningPathPage from './pages/ManageLearningPathPage';
import LearningPathDetailPage from './pages/LearningPathDetailPage'; // <-- 1. IMPORT


function App() {
  return (
    <Router>
      <AuthProvider>
      <div className="flex flex-col min-h-screen bg-slate-900 antialiased"> {/* Changed bg-slate-50 to bg-slate-900 */}
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<AuthForm isLogin={true} />} />
              <Route path="/register" element={<AuthForm isLogin={false} />} />
              
              {/* Core Skill Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/skills/:id" element={<SkillDetailPage />} />
              
              {/* Protected Learner Routes */}
              <Route path="/my-learning" element={<ProtectedRoute><MyLearningPage /></ProtectedRoute>} />
              <Route path="/my-profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/my-badges" element={<ProtectedRoute><MyBadgesPage /></ProtectedRoute>} />
              
              {/* Protected Creator Routes */}
              <Route path="/my-skills" element={<ProtectedRoute><MySkillsPage /></ProtectedRoute>} />
              <Route path="/create-skill" element={<ProtectedRoute><CreateSkillPage /></ProtectedRoute>} />
              <Route path="/skills/:id/manage" element={<ProtectedRoute><ManageSkillPage /></ProtectedRoute>} />
              <Route path="/my-paths" element={<ProtectedRoute><MyLearningPathsPage /></ProtectedRoute>} />
              <Route path="/create-path" element={<ProtectedRoute><CreateLearningPathPage /></ProtectedRoute>} />
              <Route path="/paths/:id/manage" element={<ProtectedRoute><ManageLearningPathPage /></ProtectedRoute>} />

              {/* Public Routes */}
              <Route path="/leaderboard" element={<GlobalLeaderboardPage />} />
              <Route path="/paths" element={<LearningPathsPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/paths/:id" element={<LearningPathDetailPage />} /> {/* <-- 2. ADD THIS ROUTE */}

            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;