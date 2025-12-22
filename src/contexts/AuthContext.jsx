import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/apiConfig';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Initialize: Check token and load user
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          
          // Verify token với server
          try {
            const data = await api.get(API_ENDPOINTS.AUTH.ME);
            if (data.success) {
              setUser(data.data.user);
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data.user));
            }
          } catch (error) {
            // Token không hợp lệ, clear và logout
            logout();
          }
        } catch (error) {
          console.error('Error loading user:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for unauthorized events
    const handleUnauthorized = () => {
      logout();
      navigate('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  /**
   * Login
   * @param {string} identifier - Email or username
   * @param {string} password - Password
   */
  const login = async (identifier, password) => {
    try {
      // Determine if it's email or username
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const loginData = isEmail 
        ? { email: identifier, password }
        : { username: identifier, password };
      
      const data = await api.post(API_ENDPOINTS.AUTH.LOGIN, loginData, false);
      
      if (data.success) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data.user));
        setUser(data.data.user);
        setIsAuthenticated(true);
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error || data.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Register
   */
  const register = async (userData) => {
    try {
      const data = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData, false);
      
      if (data.success) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data.user));
        setUser(data.data.user);
        setIsAuthenticated(true);
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error || data.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Logout
   */
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  /**
   * Get current user information
   */
  const getCurrentUser = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.AUTH.ME);
      if (data.success) {
        setUser(data.data.user);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data.user));
        return { success: true, user: data.data.user };
      }
      return { success: false, error: data.error || data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Update user information
   */
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    getCurrentUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

