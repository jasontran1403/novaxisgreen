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

// Helper để lấy token & user đúng theo trạng thái impersonate
const getAuthToken = () => {
  const impersonateToken = localStorage.getItem('impersonate_token');
  if (impersonateToken) return impersonateToken;
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

const getSavedUser = () => {
  const impersonateUserStr = localStorage.getItem('impersonate_user');
  if (impersonateUserStr) {
    try {
      return JSON.parse(impersonateUserStr);
    } catch {
      return null;
    }
  }

  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

const isImpersonating = () => !!localStorage.getItem('impersonate_token');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser());
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();

      if (!token) {
        setLoading(false);
        return;
      }

      // Có token → coi như đã auth ngay lập tức (tránh flash màn hình)
      setIsAuthenticated(true);

      // Lấy user từ storage làm fallback ban đầu
      const savedUser = getSavedUser();
      if (savedUser) {
        setUser(savedUser);
      }

      // Luôn verify với /me (vì backend hỗ trợ trả về user đúng theo token)
      try {
        const data = await api.get(API_ENDPOINTS.AUTH.ME);

        if (data.success) {
          const freshUser = data.data.user;
          setUser(freshUser);

          // Lưu lại user mới nhất vào storage phù hợp
          if (isImpersonating()) {
            const token = localStorage.getItem('impersonate_token');
            const user = localStorage.getItem('impersonate_user');
            localStorage.setItem('user', user);
            localStorage.setItem('token', token);
          } else {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
          }
        } else {
          logout();
        }
      } catch (error) {
        console.warn('Verify /me failed:', error.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const handleUnauthorized = () => {
      logout();
      navigate('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  const login = async (identifier, password, twoFACode) => {
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

      // Chuẩn bị payload
      const loginData = isEmail
        ? { email: identifier, password }
        : { username: identifier, password };

      // Nếu có twoFACode (và không rỗng), thêm vào payload
      if (twoFACode && twoFACode.trim() !== '') {
        loginData.twoFACode = twoFACode.trim();   // hoặc đổi tên field nếu backend dùng tên khác
      }

      // Gửi request
      const data = await api.post(API_ENDPOINTS.AUTH.LOGIN, loginData, false);

      if (data.success) {
        // Clear impersonate khi login mới
        localStorage.removeItem('impersonate_token');
        localStorage.removeItem('impersonate_user');

        localStorage.setItem(STORAGE_KEYS.TOKEN, data.data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data.user));
        setUser(data.data.user);
        setIsAuthenticated(true);

        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error || data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'An error occurred during login'
      };
    }
  };

  const register = async (userData) => {
    try {
      const data = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData, false);

      if (data.success) {
        localStorage.removeItem('impersonate_token');
        localStorage.removeItem('impersonate_user');

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

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('impersonate_token');
    localStorage.removeItem('impersonate_user');
    localStorage.removeItem('isImpersonated');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const getCurrentUser = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.AUTH.ME);
      if (data.success) {
        const freshUser = data.data.user;
        setUser(freshUser);

        if (isImpersonating()) {
          localStorage.setItem('impersonate_user', JSON.stringify(freshUser));
        } else {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
        }

        return { success: true, user: freshUser };
      }
      return { success: false, error: data.error || data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    const storageKey = isImpersonating() ? 'impersonate_user' : STORAGE_KEYS.USER;
    localStorage.setItem(storageKey, JSON.stringify(userData));
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
    isImpersonating,  // Để các component khác kiểm tra nếu cần
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};