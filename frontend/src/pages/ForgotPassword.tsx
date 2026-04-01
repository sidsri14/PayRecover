import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { ShieldAlert, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/request-password-reset', { email });
      if (data.success) {
        setSubmitted(true);
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
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
              PayRecover
            </h1>
          </div>

          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-lg font-semibold text-stone-700 dark:text-stone-200 mb-2">Forgot Password?</h2>
                <p className="text-sm text-stone-400">Enter your email and we'll send you a link to reset your password.</p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl mb-6 flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-300 leading-tight">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                    <input
                      type="email"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-warm-border dark:border-stone-600 bg-cream dark:bg-stone-700 text-sm font-medium placeholder:text-stone-300 outline-none focus:border-stone-400 transition-all text-stone-700 dark:text-stone-200"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl inline-block mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-3">Check Your Email</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-8">
                If an account exists for <strong>{email}</strong>, we've sent instructions to reset your password.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Didn't receive it? Try again
              </button>
            </div>
          )}

          <footer className="mt-8 text-center border-t border-warm-border dark:border-stone-700 pt-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
