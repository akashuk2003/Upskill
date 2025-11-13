// src/context/AuthContext.js
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'; // 1. Import useCallback
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Spinner from '../components/Spinner';

// --- Configuration ---
const API_BASE_URL = 'http://127.0.0.1:8000'; 

// --- API Service ---
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Auth Context ---
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

  // 2. Wrap logoutUser in useCallback
  const logoutUser = useCallback(() => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    navigate('/login');
  }, [navigate]); // 3. Add its dependency
  
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

  }, [authTokens, loading, logoutUser]); // 4. Add logoutUser to the dependency array

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

export const useAuth = () => useContext(AuthContext);