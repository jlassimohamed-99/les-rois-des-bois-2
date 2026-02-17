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
    
    // For cashiers: if cashierId exists, try to fetch cashier first
    // If that fails or cashierId doesn't exist, try token
    if (cashierId) {
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
      console.log('✅ [AUTH] Cashier authenticated via ID:', cashierId);
    } catch (error) {
      // If cashier not found or unauthorized, try token as fallback
      if (error.response?.status === 404 || error.response?.status === 403) {
        console.warn('⚠️ [AUTH] Cashier ID invalid, trying token fallback');
        const token = localStorage.getItem('token');
        if (token) {
          // Try to fetch user with token
          await fetchUser();
        } else {
          localStorage.removeItem('cashierId');
          setUser(null);
        }
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
        // Backend is not available - keep cashierId, try token as fallback
        console.warn('⚠️ [AUTH] Backend not available, trying token fallback');
        const token = localStorage.getItem('token');
        if (token) {
          await fetchUser();
        } else {
          // Keep cashierId for retry when backend comes back
          const storedCashierId = localStorage.getItem('cashierId');
          if (!storedCashierId) {
            setUser(null);
          }
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
        // For cashiers: store BOTH ID and token (token for API calls, ID for persistence)
        // This ensures they stay logged in even if token expires
        localStorage.setItem('cashierId', loggedUser.id);
        localStorage.setItem('token', token); // Keep token for API calls
        setUser(loggedUser);
        toast.success('تم تسجيل الدخول بنجاح - ستبقى متصلاً دائماً');
      } else {
        // For other roles: use token only
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
