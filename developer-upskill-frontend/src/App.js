import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, Navigate, useSearchParams } from 'react-router-dom'; // Added useSearchParams
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { format } from 'date-fns';

// --- Configuration ---
const API_BASE_URL = 'http://127.0.0.1:8000'; 

// --- API Service & Auth Setup ---

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null);
  const [user, setUser] = useState(() => localStorage.getItem('authTokens') ? jwtDecode(localStorage.getItem('authTokens')) : null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loginUser = async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login/', { email, password });
      if (response.status === 200) {
        setAuthTokens(response.data);
        setUser(jwtDecode(response.data.access));
        localStorage.setItem('authTokens', JSON.stringify(response.data));
        navigate('/');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.detail || 'Please check your email and password.';
        alert(`Login failed: ${errorMessage}`);
      } else {
        alert('Login failed. The server may be down. Please try again later.');
      }
    }
  };
  
  const registerUser = async (name, email, password) => {
      try {
        await apiClient.post('/api/auth/register/', { name, email, password });
        navigate('/login');
        alert('Registration successful! Please log in.');
      } catch (error) {
        if (error.response && error.response.data) {
          alert(`Registration failed: ${JSON.stringify(error.response.data)}`);
        } else {
          alert('Registration failed. The server may be unreachable.');
        }
      }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    navigate('/login');
  };
  
  const contextData = {
    user,
    authTokens,
    loginUser,
    logoutUser,
    registerUser,
  };

  useEffect(() => {
    const updateToken = async () => {
      if (authTokens) {
        try {
          const response = await apiClient.post('/api/auth/token/refresh/', { refresh: authTokens.refresh });
          if (response.status === 200) {
            setAuthTokens(response.data);
            setUser(jwtDecode(response.data.access));
            localStorage.setItem('authTokens', JSON.stringify(response.data));
          } else {
            logoutUser();
          }
        } catch (error) {
          logoutUser();
        }
      }
      setLoading(false);
    };

    const interval = setInterval(() => {
        if(authTokens){
            updateToken();
        }
    }, 1000 * 60 * 4); 
    
    if (loading) {
        if (authTokens) {
            updateToken();
        } else {
            setLoading(false);
        }
    }

    return () => clearInterval(interval);

  }, [authTokens, loading]);

  useEffect(() => {
    const interceptor = apiClient.interceptors.request.use(
      config => {
        if (authTokens) {
          config.headers.Authorization = `Bearer ${authTokens.access}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    return () => apiClient.interceptors.request.eject(interceptor);
  }, [authTokens]);


  return (
    <AuthContext.Provider value={contextData}>
      {loading ? <Spinner /> : children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// --- Protected Route Component ---
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// --- UI Components ---

const Spinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// NEW: SearchBar Component
const SearchBar = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${query}`);
            setQuery('');
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex items-center">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search skills & paths..."
                className="px-3 py-1 border border-gray-300 rounded-l-md text-sm"
            />
            <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 text-sm">
                Search
            </button>
        </form>
    );
};

const Header = () => {
  const { user, logoutUser } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800">Developer Upskill</Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-800 hover:text-blue-500">Skills</Link>
          <Link to="/paths" className="text-gray-800 hover:text-blue-500">Paths</Link>
          <Link to="/leaderboard" className="text-gray-800 hover:text-blue-500">Leaderboard</Link>
          {user && (
            <>
              <Link to="/my-learning" className="text-gray-800 hover:text-blue-500">My Learning</Link>
              <Link to="/my-skills" className="text-gray-800 hover:text-blue-500">My Skills</Link>
              <Link to="/my-paths" className="text-gray-800 hover:text-blue-500">My Paths</Link> {/* NEW */}
              <Link to="/my-badges" className="text-gray-800 hover:text-blue-500">My Badges</Link>
              <Link to="/my-profile" className="text-gray-800 hover:text-blue-500">Profile</Link>
            </>
          )}
        </div>

        <SearchBar /> {/* NEW */}

        <div>
          {user ? (
            <>
              <span className="mx-2 text-gray-600">Hello, {user.name || user.email}</span>
              <button onClick={logoutUser} className="mx-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mx-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Login</Link>
              <Link to="/register" className="mx-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

const ProgressBar = ({ progress }) => (
  <div>
    <div className="relative pt-1">
      <div className="flex mb-2 items-center justify-between">
        <div>
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
            Progress
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold inline-block text-blue-600">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
        <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"></div>
      </div>
    </div>
  </div>
);

// --- Pages ---

// SkillCard Component
const SkillCard = ({ skill }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{skill.name}</h3>
        <p className="text-gray-600 text-sm mb-4">By: {skill.created_by_username}</p>
        <p className="text-gray-700 mb-4 h-16 overflow-hidden">{skill.description}</p>
        <div className="mb-4 min-h-[20px]">
          {skill.tags.map(tag => (
            <span key={tag.id} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
              {tag.name}
            </span>
          ))}
        </div>
        <div className="flex items-center mb-4">
          <span className="text-yellow-500">{'★'.repeat(Math.round(skill.average_rating))}{'☆'.repeat(5 - Math.round(skill.average_rating))}</span>
          <span className="text-gray-600 text-sm ml-2">({skill.review_count} reviews)</span>
        </div>
        <Link to={`/skills/${skill.id}`} className="inline-block bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors">
          Start Learning
        </Link>
      </div>
    </div>
);

// NEW: PathCard Component
const PathCard = ({ path }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{path.title}</h3>
            <p className="text-gray-600 text-sm mb-4">By: {path.created_by_username}</p>
            <p className="text-gray-700 mb-4 h-16 overflow-hidden">{path.description}</p>
            {/* <Link to={`/paths/${path.id}`} className="inline-block bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition-colors">
                View Path
            </Link> */}
        </div>
    </div>
);


// HomePage (fetches Skills)
const HomePage = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchSkills = async () => {
        try {
          const response = await apiClient.get('/api/skills/');
          setSkills(response.data);
        } catch (error) {
          console.error("Failed to fetch skills:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSkills();
    }, []);
  
    if (loading) return <Spinner />;
  
    return (
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Skills</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
        </div>
      </div>
    );
  };

// SkillDetailPage
const SkillDetailPage = () => {
    const { id } = useParams();
    const [skill, setSkill] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    
    const [comments, setComments] = useState([]);
    const [reviews, setReviews] = useState([]);
  
    const fetchSkillData = async () => {
      setLoading(true);
      try {
        const skillRes = await apiClient.get(`/api/skills/${id}/`);
        setSkill(skillRes.data);
  
        if (user) {
          const enrollmentsRes = await apiClient.get('/api/enrollments/');
          const currentEnrollment = enrollmentsRes.data.find(e => e.skill.id === parseInt(id));
          if (currentEnrollment) {
            setEnrollment(currentEnrollment);
          }
        }
        
        const commentsRes = await apiClient.get(`/api/skills/${id}/comments/`);
        setComments(commentsRes.data);
  
        const reviewsRes = await apiClient.get(`/api/skills/${id}/reviews/`);
        setReviews(reviewsRes.data);
  
      } catch (error) {
        console.error("Failed to fetch skill details:", error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchSkillData();
    }, [id, user]);
  
    const handleEnroll = async () => {
      try {
        await apiClient.post(`/api/skills/${id}/enroll/`);
        alert('Successfully enrolled!');
        fetchSkillData(); // Refresh data
      } catch (error) {
        console.error("Enrollment failed:", error);
        alert('Enrollment failed. You may already be enrolled.');
      }
    };
  
    const handleCompleteResource = async (resourceId) => {
      try {
        const response = await apiClient.post(`/api/resources/${resourceId}/complete/`);
        alert(`Resource completed! Your new progress is ${response.data.progress}%. XP: ${response.data.total_xp}`);
        fetchSkillData(); // Refresh data
      } catch (error) {
        console.error("Failed to complete resource:", error);
        alert('Failed to mark as complete. Are you enrolled?');
      }
    };
  
    if (loading) return <Spinner />;
    if (!skill) return <p>Skill not found.</p>;
  
    const isEnrolled = !!enrollment;
  
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          {/* Skill Header */}
          <div className="flex justify-between items-start mb-6">
              <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">{skill.name}</h1>
                  <p className="text-gray-600">By {skill.created_by_username}</p>
              </div>
              {user && !isEnrolled && (
                  <button onClick={handleEnroll} className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600">
                      Enroll in Skill
                  </button>
              )}
          </div>
          <p className="text-gray-700 my-6">{skill.description}</p>
          
          {isEnrolled && <ProgressBar progress={enrollment.progress} />}
  
          {/* Resources List */}
          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Skill Resources</h2>
          <div className="space-y-4">
            {skill.resources.map(resource => (
              <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{resource.resource_type}</span>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-blue-600 hover:underline ml-3">
                    {resource.title}
                  </a>
                </div>
                {isEnrolled && (
                  <button 
                    onClick={() => handleCompleteResource(resource.id)}
                    className={`px-3 py-1 text-xs rounded-full bg-indigo-500 text-white hover:bg-indigo-600`}>
                    Mark as Complete
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Reviews Section */}
          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Reviews</h2>
          <div className="space-y-4">
            {reviews.length > 0 ? reviews.map(review => (
               <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                 <p className="font-semibold">{review.username} - {'★'.repeat(review.rating)}</p>
                 <p className="text-gray-700">{review.comment}</p>
               </div>
            )) : <p>No reviews yet. Be the first!</p>}
          </div>
  
          {/* Comments Section */}
          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Comments</h2>
          <div className="space-y-4">
            {comments.length > 0 ? comments.map(comment => (
               <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                 <p className="font-semibold">{comment.username}</p>
                 <p className="text-gray-700">{comment.content}</p>
               </div>
            )) : <p>No comments yet.</p>}
          </div>
        </div>
      </div>
    );
  };

// MyLearningPage
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

// AuthForm
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              {!isLogin && (
                <div>
                  <input
                    id="name" name="name" type="text" required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div> 
                <input
                  id="email" name="email" type="email" required 
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isLogin ? 'rounded-t-md' : ''} ${!isLogin ? '' : 'rounded-b-md'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div> 
                <input
                  id="password" name="password" type="password" required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isLogin ? 'rounded-b-md' : ''} ${!isLogin && !password2 ? 'rounded-b-md' : ''} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {!isLogin && (
                <div> 
                  <input
                    id="password2" name="password2" type="password" required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLogin ? 'Sign in' : 'Register'}
              </button>
            </div>
          </form>
          <div className="text-sm text-center">
            {isLogin ? (
              <p>Don't have an account? <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Register here</Link></p>
            ) : (
              <p>Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Sign in here</Link></p>
            )}
          </div>
        </div>
      </div>
    );
};

// --- OTHER PAGES TO TEST APIS ---

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);
  
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/api/auth/profile/');
        setProfile(response.data);
        setName(response.data.name);
        setBio(response.data.profile.bio);
        setAvatarUrl(response.data.profile.avatar_url);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchProfile();
    }, []);
  
    const handleUpdate = async (e) => {
      e.preventDefault();
      try {
        const response = await apiClient.put('/api/auth/profile/', {
          name: name,
          profile: {
            bio: bio,
            avatar_url: avatarUrl
          }
        });
        setProfile(response.data); 
        alert('Profile updated!');
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    };
  
    if (loading) return <Spinner />;
    if (!profile) return <p>Could not load profile.</p>;
  
    return (
      <div className="container mx-auto px-6 py-8 max-w-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>
        <form onSubmit={handleUpdate} className="bg-white p-8 rounded-lg shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={profile.email} disabled className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
            <input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Total XP: {profile.profile.total_xp}</p>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600">Save Changes</button>
        </form>
      </div>
    );
};
  
const GlobalLeaderboardPage = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchLeaderboard = async () => {
        try {
          const response = await apiClient.get('/api/leaderboard/');
          setLeaders(response.data);
        } catch (error) {
          console.error("Failed to fetch leaderboard:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchLeaderboard();
    }, []);
  
    if (loading) return <Spinner />;
  
    return (
      <div className="container mx-auto px-6 py-8 max-w-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Global Leaderboard</h1>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <ol className="list-decimal list-inside space-y-4">
            {leaders.map((leader, index) => (
              <li key={index} className="text-lg">
                <span className="font-bold text-gray-800">{index + 1}. {leader.username}</span>
                <span className="text-blue-600 float-right">{leader.total_xp} XP</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
};
  
const MyBadgesPage = () => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchBadges = async () => {
        try {
          const response = await apiClient.get('/api/my-badges/');
          setBadges(response.data);
        } catch (error) {
          console.error("Failed to fetch badges:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchBadges();
    }, []);
  
    if (loading) return <Spinner />;
  
    return (
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Badges 🏆</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {badges.length === 0 && <p>You haven't earned any badges yet. Complete a skill to get your first!</p>}
          {badges.map(userBadge => (
            <div key={userBadge.id} className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-xl font-bold text-gray-800">{userBadge.badge.title}</h2>
              <p className="text-gray-600 text-sm mb-2">{userBadge.badge.description}</p>
              <p className="text-xs text-gray-500">Earned on: {format(new Date(userBadge.earned_on), 'PPP')}</p>
            </div>
          ))}
        </div>
      </div>
    );
};
  
const LearningPathsPage = () => {
    const [paths, setPaths] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchPaths = async () => {
        try {
          // This fetches all *public* paths
          const response = await apiClient.get('/api/paths/');
          setPaths(response.data);
        } catch (error) {
          console.error("Failed to fetch paths:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPaths();
    }, []);
  
    if (loading) return <Spinner />;
  
    return (
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Learning Paths</h1>
        <div className="space-y-6">
          {paths.map(path => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>
      </div>
    );
};

// --- CREATOR PAGES ---

const MySkillsPage = () => {
    const [mySkills, setMySkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMySkills = async () => {
            try {
                const response = await apiClient.get('/api/skills/my_skills/');
                setMySkills(response.data);
            } catch (error) {
                console.error("Failed to fetch skills:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMySkills();
    }, []);

    if (loading) return <Spinner />;

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Created Skills</h1>
                <Link to="/create-skill" className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600">
                    Create New Skill
                </Link>
            </div>
            <div className="space-y-6">
                {mySkills.length === 0 ? (
                    <p className="text-gray-600">You haven't created any skills yet.</p>
                ) : (
                    mySkills.map(skill => (
                        <div key={skill.id} className="bg-white p-6 rounded-lg shadow-lg flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{skill.name}</h2>
                                <p className="text-sm text-gray-500 mb-2">
                                    {skill.is_public ? 
                                        <span className="text-green-600 font-semibold">Public</span> : 
                                        <span className="text-red-600 font-semibold">Private</span>
                                    }
                                </p>
                                <p className="text-gray-700">{skill.description}</p>
                            </div>
                            <Link to={`/skills/${skill.id}/manage`} className="inline-block text-blue-500 hover:underline">
                                Manage &rarr;
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const CreateSkillPage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [tags, setTags] = useState(''); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const tag_names = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            const response = await apiClient.post('/api/skills/', {
                name,
                description,
                is_public: isPublic,
                tag_names
            });
            navigate(`/skills/${response.data.id}/manage`);
        } catch (error) {
            console.error("Failed to create skill:", error);
            alert("Error creating skill. Check console for details.");
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create a New Skill</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Skill Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                           className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                              className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                    <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                           className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                           placeholder="e.g. python, django, api" />
                </div>
                <div className="flex items-center">
                    <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
                           className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                    <label className="ml-2 block text-sm text-gray-900">Make this skill public</label>
                </div>
                <button type="submit" className="w-full bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600">
                    Create Skill
                </button>
            </form>
        </div>
    );
};

const ManageSkillPage = () => {
    const { id } = useParams();
    const [skill, setSkill] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Form state for new resource
    const [resTitle, setResTitle] = useState('');
    const [resUrl, setResUrl] = useState('');
    const [resType, setResType] = useState('ARTICLE');
    const [resXp, setResXp] = useState(10);

    const fetchSkill = async () => {
        try {
            const response = await apiClient.get(`/api/skills/${id}/`);
            setSkill(response.data);
        } catch (error) {
            console.error("Failed to fetch skill:", error);
            alert("Could not load skill. You may not be the owner.");
            navigate('/my-skills');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkill();
    }, [id]);

    const handleAddResource = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/api/resources/', {
                title: resTitle,
                url: resUrl,
                resource_type: resType,
                xp: resXp,
                skill: id, 
                order: (skill.resources.length || 0) + 1
            });
            setResTitle('');
            setResUrl('');
            setResXp(10);
            fetchSkill();
        } catch (error) {
            console.error("Failed to add resource:", error);
            alert("Error adding resource. Check console.");
        }
    };

    const handleDeleteResource = async (resourceId) => {
        if (!window.confirm("Are you sure you want to delete this resource?")) return;
        try {
            await apiClient.delete(`/api/resources/${resourceId}/`);
            fetchSkill(); 
        } catch (error) {
            console.error("Failed to delete resource:", error);
            alert("Error deleting resource.");
        }
    };

    if (loading) return <Spinner />;
    if (!skill) return null;

    return (
        <div className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{skill.name}</h1>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <p className="text-gray-700">{skill.description}</p>
                    <p className="mt-4">
                        {skill.is_public ? 
                            <span className="text-green-600 font-semibold">Public</span> : 
                            <span className="text-red-600 font-semibold">Private</span>
                        }
                    </p>
                </div>
            </div>

            <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Resource</h2>
                    <form onSubmit={handleAddResource} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" value={resTitle} onChange={(e) => setResTitle(e.target.value)} required
                                   className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">URL</label>
                            <input type="url" value={resUrl} onChange={(e) => setResUrl(e.target.value)} required
                                   className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select value={resType} onChange={(e) => setResType(e.target.value)}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                    <option value="ARTICLE">Article</option>
                                    <option value="YOUTUBE_VIDEO">YouTube Video</option>
                                    <option value="STUDY_MATERIAL">Study Material</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">XP</label>
                                <input type="number" value={resXp} onChange={(e) => setResXp(parseInt(e.target.value))} required
                                       className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                        </div>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600">
                            Add Resource
                        </button>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Resources</h2>
                    <div className="space-y-4">
                        {skill.resources.length === 0 && <p>No resources added yet.</p>}
                        {skill.resources.map(resource => (
                            <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{resource.resource_type}</span>
                                    <p className="text-lg font-medium text-gray-800">{resource.title}</p>
                                </div>
                                <button onClick={() => handleDeleteResource(resource.id)}
                                        className="text-red-500 hover:text-red-700 font-semibold">
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- NEW SEARCH & PATH MANAGEMENT PAGES ---

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

const MyLearningPathsPage = () => {
    const [myPaths, setMyPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // Get user to filter

    useEffect(() => {
        const fetchMyPaths = async () => {
            try {
                const response = await apiClient.get('/api/paths/');
                // Filter for paths created by the current user
                const userPaths = response.data.filter(path => path.created_by_username === user.email); // Use email or name, matching backend
                setMyPaths(userPaths);
            } catch (error) {
                console.error("Failed to fetch paths:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyPaths();
    }, [user]);

    if (loading) return <Spinner />;

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Learning Paths</h1>
                <Link to="/create-path" className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600">
                    Create New Path
                </Link>
            </div>
            <div className="space-y-6">
                {myPaths.length === 0 ? (
                    <p className="text-gray-600">You haven't created any learning paths yet.</p>
                ) : (
                    myPaths.map(path => (
                        <div key={path.id} className="bg-white p-6 rounded-lg shadow-lg flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{path.title}</h2>
                                <p className="text-gray-700">{path.description}</p>
                            </div>
                            <Link to={`/paths/${path.id}/manage`} className="inline-block text-blue-500 hover:underline">
                                Manage &rarr;
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const CreateLearningPathPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/api/paths/', {
                title,
                description,
                is_public: isPublic,
            });
            navigate(`/paths/${response.data.id}/manage`);
        } catch (error) {
            console.error("Failed to create path:", error);
            alert("Error creating path.");
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create a New Learning Path</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Path Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                           className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                              className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div className="flex items-center">
                    <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
                           className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                    <label className="ml-2 block text-sm text-gray-900">Make this path public</label>
                </div>
                <button type="submit" className="w-full bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600">
                    Create Path
                </button>
            </form>
        </div>
    );
};

const ManageLearningPathPage = () => {
    const { id } = useParams();
    const [path, setPath] = useState(null);
    const [skillsInPath, setSkillsInPath] = useState([]); // Array of skill *objects*
    const [availableSkills, setAvailableSkills] = useState([]); // Array of skill *objects*
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch path details and all available skills
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Fetch path details
                const pathRes = await apiClient.get(`/api/paths/${id}/`);
                setPath(pathRes.data);
                
                // 2. Fetch all user-created skills
                const skillsRes = await apiClient.get('/api/skills/my_skills/');
                
                // 3. Set skillsInPath from path data
                // pathRes.data.items is [{skill: 1, skill_name: '...'}, {skill: 2, ...}]
                // We need the full skill objects for easier management
                const skillIdsInPath = pathRes.data.items.map(item => item.skill);
                const skills = skillsRes.data.filter(s => skillIdsInPath.includes(s.id));
                setSkillsInPath(skills);

                // 4. Set availableSkills (all skills NOT already in the path)
                const available = skillsRes.data.filter(s => !skillIdsInPath.includes(s.id));
                setAvailableSkills(available);

            } catch (error) {
                console.error("Failed to load data:", error);
                alert("Could not load path. You may not be the owner.");
                navigate('/my-paths');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id, navigate]);

    const addSkillToPath = (skillToAdd) => {
        // Add to skillsInPath
        setSkillsInPath(prev => [...prev, skillToAdd]);
        // Remove from availableSkills
        setAvailableSkills(prev => prev.filter(s => s.id !== skillToAdd.id));
    };

    const removeSkillFromPath = (skillToRemove) => {
        // Remove from skillsInPath
        setSkillsInPath(prev => prev.filter(s => s.id !== skillToRemove.id));
        // Add back to availableSkills
        setAvailableSkills(prev => [...prev, skillToRemove]);
    };

    const handleSavePath = async () => {
        try {
            const skill_ids = skillsInPath.map(s => s.id);
            await apiClient.put(`/api/paths/${id}/manage_skills/`, {
                skill_ids: skill_ids
            });
            alert("Learning path saved successfully!");
        } catch (error) {
            console.error("Failed to save path:", error);
            alert("Error saving path.");
        }
    };

    if (loading) return <Spinner />;
    if (!path) return null;

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage: {path.title}</h1>
            <p className="text-gray-700 mb-6">{path.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Add Skills */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Skills</h2>
                    <div className="space-y-3">
                        {availableSkills.length === 0 && <p>No more skills available to add.</p>}
                        {availableSkills.map(skill => (
                            <div key={skill.id} className="flex justify-between items-center p-3 border rounded-lg">
                                <p className="text-gray-800">{skill.name}</p>
                                <button onClick={() => addSkillToPath(skill)}
                                        className="text-green-500 hover:text-green-700 font-semibold">
                                    Add +
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 2: Skills in Path */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Skills in this Path</h2>
                    <div className="space-y-3 mb-6">
                        {skillsInPath.length === 0 && <p>No skills added yet.</p>}
                        {skillsInPath.map((skill, index) => (
                            <div key={skill.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                                <div>
                                    <span className="text-lg font-bold text-blue-600 mr-3">{index + 1}.</span>
                                    <span className="text-gray-800">{skill.name}</span>
                                </div>
                                <button onClick={() => removeSkillFromPath(skill)}
                                        className="text-red-500 hover:text-red-700 font-semibold">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleSavePath}
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600">
                        Save Path Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-gray-100">
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

            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;