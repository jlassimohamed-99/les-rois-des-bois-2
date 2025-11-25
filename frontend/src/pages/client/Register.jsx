import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClientAuth } from '../../contexts/ClientAuthContext';

const ClientRegister = () => {
  const { register } = useClientAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(form.name, form.email, form.password, form.phone);
    setLoading(false);
    if (result.success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create account</h1>
          <p className="text-gray-600 dark:text-gray-400">Join us to save your cart and track orders.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Phone</label>
            <input
              required
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-600 text-white py-3 rounded-xl font-semibold hover:bg-gold-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-600 font-semibold hover:text-gold-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ClientRegister;
