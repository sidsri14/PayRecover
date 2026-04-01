import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import toast from 'react-hot-toast';
import { ShieldCheck, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing security token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      if (data.success) {
        setSuccess(true);
        toast.success('Password reset successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cream dark:bg-stone-900 transition-colors">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 rounded-2xl p-10 shadow-card">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-emerald-600 dark:bg-emerald-700 p-3.5 rounded-xl shadow-md mb-6">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
              PayRecover
            </h1>
          </div>

          {!success ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-lg font-semibold text-stone-700 dark:text-stone-200 mb-2">Create New Password</h2>
                <p className="text-sm text-stone-400">Set a secure password for your account.</p>
              </div>

              {error && (
                <div role="alert" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl mb-6 flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-300 leading-tight">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                    <input
                      type="password"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-warm-border dark:border-stone-600 bg-cream dark:bg-stone-700 text-sm font-medium outline-none focus:border-stone-400 transition-all text-stone-700 dark:text-stone-200"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 ml-1">Minimum 8 characters</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                    <input
                      type="password"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-warm-border dark:border-stone-600 bg-cream dark:bg-stone-700 text-sm font-medium outline-none focus:border-stone-400 transition-all text-stone-700 dark:text-stone-200"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin" />
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl inline-block mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-3">Password Secured!</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-10">
                Your password has been successfully updated. You can now use your new password to sign in.
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-stone-700 hover:bg-stone-600 dark:bg-stone-600 dark:hover:bg-stone-500 text-white font-semibold py-3.5 rounded-xl transition-all"
              >
                Sign In Now
              </button>
            </div>
          )}

          {!success && (
            <footer className="mt-8 text-center border-t border-warm-border dark:border-stone-700 pt-6">
              <Link to="/login" className="text-sm font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
                Back to Sign In
              </Link>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
