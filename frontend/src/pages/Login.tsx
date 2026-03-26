import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success && data.data.token) {
        localStorage.setItem('token', data.data.token);
        // We do a hard reload to reset the app state with new auth context
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-100">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">Welcome Back</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account? <Link to="/register" className="text-primary-600 hover:text-primary-500 font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
