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
    const cashierId = localStorage.getItem('cashierId');
    
    // For cashiers: use cashierId (no token, always logged in)
    if (cashierId && !token) {
      fetchCashier(cashierId);
    } else if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCashier = async (cashierId) => {
    try {
      const response = await api.get(`/auth/cashier/${cashierId}`);
      setUser(response.data.user);
      // Ensure cashierId is stored
      localStorage.setItem('cashierId', cashierId);
    } catch (error) {
      // If cashier not found or unauthorized, clear cashierId
      if (error.response?.status === 404 || error.response?.status === 403) {
        localStorage.removeItem('cashierId');
        setUser(null);
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
        // Backend is not available - keep cashierId, keep trying
        console.warn('Backend not available, keeping cashierId for retry');
        // Don't clear user if we have a cashierId - might be temporary backend issue
        const storedCashierId = localStorage.getItem('cashierId');
        if (!storedCashierId) {
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

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
      
      // Check if user is a cashier
      const cashierRoles = ['cashier', 'store_cashier', 'saler'];
      const isCashier = cashierRoles.includes(loggedUser.role);
      
      if (isCashier) {
        // For cashiers: store ID instead of token (no expiration, always logged in)
        localStorage.setItem('cashierId', loggedUser.id);
        localStorage.removeItem('token'); // Remove token if exists
        setUser(loggedUser);
        toast.success('تم تسجيل الدخول بنجاح - ستبقى متصلاً دائماً');
      } else {
        // For other roles: use token
        localStorage.setItem('token', token);
        localStorage.removeItem('cashierId'); // Remove cashierId if exists
        setUser(loggedUser);
        toast.success('تم تسجيل الدخول بنجاح');
      }
      
      return { success: true, user: loggedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'تعذر تسجيل الدخول';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    // Clear both token and cashierId
    localStorage.removeItem('token');
    localStorage.removeItem('cashierId');
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
