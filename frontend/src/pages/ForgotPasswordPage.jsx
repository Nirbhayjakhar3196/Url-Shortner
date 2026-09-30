import React, { useState } from 'react';
import { KeyRound, Mail, ArrowRight, ArrowLeft, Loader2, AlertCircle, Clock } from 'lucide-react';
import api from '../lib/api';
import { useRateLimit } from '../lib/useRateLimit';

export default function ForgotPasswordPage({ onNavigate, onEmailSubmitted, initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { cooldown, handleRateLimit, isRateLimited } = useRateLimit();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Email address is required');
      return;
    }

    setLoading(true);

    try {
      await api.forgotPassword({ email: trimmedEmail });
      // The backend returns a generic message; proceed to OTP verification
      if (onEmailSubmitted) {
        onEmailSubmitted(trimmedEmail);
      } else {
        onNavigate('verify-otp');
      }
    } catch (err) {
      if (err.status === 429) {
        handleRateLimit(err);
        setError(
          err.retryAfter
            ? `Too many requests. Please try again in ${err.retryAfter} seconds.`
            : (err.message || 'Too many requests. Please try again later.')
        );
      } else if (err.status === 400) {
        setError(err.data?.message || 'Invalid email address provided');
      } else {
        setError(err.message || 'Failed to send password reset code. Please try again.');
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
            <KeyRound className="w-5 h-5 text-amber-800" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Forgot Password</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Enter your email to receive a 6-digit verification OTP
          </p>
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
              <p className="font-bold">Request Failed</p>
              <p className="text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        ) : null}

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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nirbhay@example.com"
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
                <span>Sending OTP...</span>
              </>
            ) : isRateLimited ? (
              <>
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Retry in {cooldown}s</span>
              </>
            ) : (
              <>
                <span>Send Verification OTP</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500">
          Remember your password?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3 inline" />
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
