import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      // If 401/403, token is invalid - clear it
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        setUser(null);
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
        // Backend is not available - don't clear token, keep trying
        // This is a connection error, not an auth error
        console.warn('Backend not available, keeping token for retry');
        // Don't clear user if we have a token - might be temporary backend issue
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
        }
        // Keep loading false so UI can render, but user might still be null
        // This allows the app to work even if backend is temporarily down
      }
      // Do not clear token for other errors to allow client auth to reuse it
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: loggedUser } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(loggedUser);
      toast.success('تم تسجيل الدخول بنجاح');
      return { success: true, user: loggedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'تعذر تسجيل الدخول';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('تم تسجيل الخروج');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
