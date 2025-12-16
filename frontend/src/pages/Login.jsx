import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const redirectByRole = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'commercial':
      return '/commercial';
    case 'saler':
      return '/pos';
    case 'user':
    default:
      return '/shop';
  }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate(redirectByRole(user.role));
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      const to = location.state?.from ? location.state.from : redirectByRole(result.user.role);
      navigate(to, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Background Gradient */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          isDark 
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
        }`}
      />

      {/* Floating Abstract Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Shape 1 */}
        <div 
          className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse ${
            isDark 
              ? 'bg-gold-500' 
              : 'bg-blue-400'
          }`}
          style={{ animationDuration: '8s' }}
        />
        
        {/* Shape 2 */}
        <div 
          className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${
            isDark 
              ? 'bg-gold-400' 
              : 'bg-purple-400'
          }`}
          style={{ animationDuration: '10s', animationDelay: '2s' }}
        />
        
        {/* Shape 3 */}
        <div 
          className={`absolute top-1/2 left-1/2 w-80 h-80 rounded-full blur-3xl opacity-15 animate-pulse ${
            isDark 
              ? 'bg-gold-600' 
              : 'bg-indigo-400'
          }`}
          style={{ animationDuration: '12s', animationDelay: '4s' }}
        />
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 left-4 z-50 p-3 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 ${
          isDark
            ? 'bg-white/10 text-gold-400 hover:bg-white/20 border border-white/20'
            : 'bg-white/80 text-gray-700 hover:bg-white border border-gray-200/50 shadow-lg'
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div 
          className={`backdrop-blur-xl rounded-3xl p-8 md:p-10 transition-all duration-500 ${
            isDark
              ? 'bg-gray-900/40 border border-white/10 shadow-2xl'
              : 'bg-white/70 border border-white/20 shadow-2xl'
          }`}
          style={{ 
            animation: 'fadeInUp 0.6s ease-out',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8 space-y-4">
            <div className="flex justify-center mb-3">
              <div className="h-28 w-28 relative transition-all duration-300">
                <img
                  src="/logo-dark.webp"
                  alt="Les Rois Du Bois Logo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    // Fallback to regular logo if dark version doesn't exist
                    e.target.src = '/logo.webp';
                  }}
                />
              </div>
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${
              isDark
                ? 'from-gold-400 to-gold-600 bg-clip-text text-transparent'
                : 'from-gold-600 to-gold-700 bg-clip-text text-transparent'
            }`}>
              Les Rois Du Bois
            </h1>

          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  isDark
                    ? 'bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-gold-500 focus:ring-gold-500/50'
                    : 'bg-white/60 border-gray-300/60 text-gray-900 placeholder-gray-600 focus:border-gold-500 focus:ring-gold-500/30'
                }`}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  isDark
                    ? 'bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-gold-500 focus:ring-gold-500/50'
                    : 'bg-white/60 border-gray-300/60 text-gray-900 placeholder-gray-600 focus:border-gold-500 focus:ring-gold-500/30'
                }`}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-500 hover:to-gold-600 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-500 hover:to-gold-600 shadow-lg shadow-gold-500/30 hover:shadow-gold-500/50 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? 'جار تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Login;
