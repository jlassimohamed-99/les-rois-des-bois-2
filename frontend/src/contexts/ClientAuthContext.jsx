import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import clientApi from '../utils/clientAxios';
import axios from 'axios';
import toast from 'react-hot-toast';

const ClientAuthContext = createContext();

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useClientAuth must be used within ClientAuthProvider');
  }
  return context;
};

export const ClientAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        clientApi.defaults.headers.common.Authorization = `Bearer ${token}`;
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        const response = await clientApi.get('/auth/me');
        const u = response.data.user || {};
        setUser({ ...u, role: u.role || 'client' });
      } catch (error) {
        localStorage.removeItem('token');
        delete clientApi.defaults.headers.common.Authorization;
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await clientApi.post('/auth/login', { email, password });
      const { token, user: loggedUser } = response.data;
      localStorage.setItem('token', token);
      clientApi.defaults.headers.common.Authorization = `Bearer ${token}`;
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser({ ...(loggedUser || {}), role: loggedUser?.role || 'client' });
      try {
        const meRes = await clientApi.get('/auth/me');
        const u = meRes.data.user || {};
        setUser({ ...u, role: u.role || 'client' });
      } catch (err) {
        // ignore
      }
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
    delete clientApi.defaults.headers.common.Authorization;
    delete axios.defaults.headers.common.Authorization;
    setUser(null);
    toast.success('تم تسجيل الخروج');
    window.location.href = '/login';
  };

  const updateProfile = async (data) => {
    try {
      const response = await clientApi.put('/auth/profile', data);
      setUser(response.data.user);
      toast.success('تم تحديث الملف الشخصي');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'تعذر تحديث الملف الشخصي';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
};
