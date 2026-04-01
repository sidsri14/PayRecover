import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { ShieldCheck, Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token. Please check your email link.');
        return;
      }

      try {
        const { data } = await api.get(`/auth/verify-email?token=${token}`);
        if (data.success) {
          setStatus('success');
          setMessage(data.data.message || 'Your email has been successfully verified.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error || err.message || 'Verification failed.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cream dark:bg-stone-900 transition-colors">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-stone-800 border border-warm-border dark:border-stone-700 rounded-2xl p-10 shadow-card">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-emerald-600 dark:bg-emerald-700 p-3.5 rounded-xl shadow-md mb-6">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
              PayRecover
            </h1>
          </div>

          <div className="text-center">
            {status === 'loading' && (
              <div className="py-8 space-y-6">
                <div className="flex justify-center">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin opacity-40" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-stone-700 dark:text-stone-200">Verifying Account...</h2>
                  <p className="text-sm text-stone-400 mt-2">Checking your secure token...</p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="py-2 animate-in fade-in zoom-in duration-500">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl inline-block mb-6 shadow-sm">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-3">Email Verified!</h2>
                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-10">
                  {message} Your account is now fully active, and you can access all PayRecover features.
                </p>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  Sign In Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl inline-block mb-6 shadow-sm">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-3">Verification Failed</h2>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium bg-red-50/50 dark:bg-red-900/10 p-3 rounded-lg mb-8 leading-tight">
                  {message}
                </p>
                <div className="space-y-4">
                  <Link 
                    to="/register"
                    className="block w-full bg-stone-700 hover:bg-stone-600 dark:bg-stone-700 dark:hover:bg-stone-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm"
                  >
                    Try Registering Again
                  </Link>
                  <Link 
                    to="/login"
                    className="block w-full text-sm font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
