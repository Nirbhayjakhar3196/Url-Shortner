import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import api from '../lib/api';
import { useRateLimit } from '../lib/useRateLimit';

export default function RegisterPage({ onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { cooldown, handleRateLimit, isRateLimited } = useRateLimit();

  const handleGoogleLogin = () => {
    window.location.href = api.getGoogleAuthUrl();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setError('All fields (Name, Email, and Password) are required');
      return;
    }

    setLoading(true);

    try {
      const response = await api.register({
        name: trimmedName,
        email: trimmedEmail,
        password: password,
      });

      setSuccessMessage(response.message || 'User registered successfully! You can now log in.');
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      if (err.status === 429) {
        handleRateLimit(err);
        setError(
          err.retryAfter
            ? `Too many requests. Please try again in ${err.retryAfter} seconds.`
            : (err.message || 'Too many requests. Please try again later.')
        );
      } else if (err.status === 409) {
        setError(err.data?.message || 'An account with this email already exists. Please sign in or use another email.');
      } else if (err.status === 400) {
        setError(err.data?.message || 'Invalid registration details. Please verify your inputs.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
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
            <UserPlus className="w-5 h-5 text-amber-800" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Create your account</h1>
          <p className="text-xs text-zinc-500 mt-1">Start shortening links & tracking real-time clicks</p>
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
              <p className="font-bold">Registration Error</p>
              <p className="text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        ) : null}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-emerald-900">Account Created Successfully!</p>
              <p className="text-emerald-700 mt-0.5">{successMessage}</p>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

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
            <span className="bg-white px-3 text-zinc-400 font-semibold">Or register with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Full Name <span className="text-amber-700">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nirbhay"
                required
                disabled={loading || isRateLimited}
                className="w-full bg-[#faf8f4] border border-[#ded8cb] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Email Address <span className="text-amber-700">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nirbhay@example.com"
                required
                disabled={loading || isRateLimited}
                className="w-full bg-[#faf8f4] border border-[#ded8cb] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Password <span className="text-amber-700">*</span>
            </label>
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
                <span>Creating Account...</span>
              </>
            ) : isRateLimited ? (
              <>
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Retry in {cooldown}s</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-amber-800 hover:text-amber-900 font-bold transition-colors cursor-pointer"
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
}
