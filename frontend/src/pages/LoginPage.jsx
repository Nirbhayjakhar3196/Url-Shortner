import React, { useState } from 'react';
import { LogIn, Mail, Lock, ArrowRight, Loader2, AlertCircle, Clock } from 'lucide-react';
import api from '../lib/api';
import { setToken } from '../lib/auth';
import { useRateLimit } from '../lib/useRateLimit';

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { cooldown, handleRateLimit, isRateLimited } = useRateLimit();

  // Check for error parameters returned from OAuth flow
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      const errorMap = {
        google_login_failed: 'Google sign-in was cancelled or encountered an error.',
        invalid_google_response: 'Invalid authentication response received from Google.',
        invalid_state: 'Security validation failed (OAuth state mismatch). Please try again.',
        missing_google_identity: 'Could not verify your identity with Google.',
        invalid_google_account: 'Google account is missing verified email information.',
      };
      setError(errorMap[errorParam] || `Google Sign-In Error: ${errorParam}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGoogleLogin = () => {
    // Navigate the browser directly to backend Google OAuth endpoint (no AJAX)
    window.location.href = api.getGoogleAuthUrl();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Both email and password are required');
      return;
    }

    setLoading(true);

    try {
      const response = await api.login({
        email: trimmedEmail,
        password: password,
      });

      if (response.token) {
        setToken(response.token);
        if (onLoginSuccess) {
          onLoginSuccess(response.token);
        } else {
          onNavigate('dashboard');
        }
      } else {
        throw new Error('No authentication token returned by server');
      }
    } catch (err) {
      if (err.status === 429) {
        handleRateLimit(err);
        setError(
          err.retryAfter
            ? `Too many requests. Please try again in ${err.retryAfter} seconds.`
            : (err.message || 'Too many requests. Please try again later.')
        );
      } else if (err.status === 400 || err.status === 401) {
        setError(err.data?.message || 'Invalid credentials');
      } else {
        setError(err.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#e2dcd0] rounded-3xl p-8 sm:p-9 shadow-lg relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f5f0e6] text-amber-900 border border-[#e2ddd1] mb-4 shadow-2xs">
            <LogIn className="w-5 h-5 text-amber-800" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Welcome back</h1>
          <p className="text-xs text-zinc-500 mt-1">Sign in to manage your shortened links & analytics</p>
        </div>

        {/* Rate Limit Alert */}
        {isRateLimited ? (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-bold">Rate Limit Active</p>
              <p className="text-amber-800 mt-0.5">
                Too many requests. Please try again in {cooldown} seconds.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Sign In Failed</p>
              <p className="text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        ) : null}

        {/* Google OAuth Action */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-[#faf8f4] border border-[#ded8cb] hover:border-zinc-400 text-zinc-800 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-[1.01]"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#ded8cb]" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-white px-3 text-zinc-400 font-semibold">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Email Address <span className="text-amber-700">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="nirbhay@example.com"
                required
                disabled={loading}
                className="w-full bg-[#faf8f4] border border-[#ded8cb] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                Password <span className="text-amber-700">*</span>
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors cursor-pointer hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading || isRateLimited}
                className="w-full bg-[#faf8f4] border border-[#ded8cb] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isRateLimited}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1e2024] hover:bg-[#2e3137] text-amber-300 rounded-xl text-xs font-bold shadow-md shadow-black/10 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Signing In...</span>
              </>
            ) : isRateLimited ? (
              <>
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Retry in {cooldown}s</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-xs text-zinc-500">
          <div>
            Forgot your password?{' '}
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-amber-800 hover:text-amber-900 font-bold transition-colors cursor-pointer"
            >
              Reset it here
            </button>
          </div>
          <div>
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-amber-800 hover:text-amber-900 font-bold transition-colors cursor-pointer"
            >
              Sign Up here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
