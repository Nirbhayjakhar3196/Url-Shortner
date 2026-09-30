import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft, Loader2, AlertCircle, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { useRateLimit } from '../lib/useRateLimit';

export default function VerifyOtpPage({ email, onNavigate, onOtpVerified }) {
  const [currentEmail, setCurrentEmail] = useState(email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState(null);

  const { cooldown, handleRateLimit, isRateLimited } = useRateLimit();
  const {
    cooldown: resendCooldown,
    handleRateLimit: handleResendRateLimit,
    isRateLimited: isResendRateLimited,
  } = useRateLimit();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = currentEmail.trim();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail || !trimmedOtp) {
      setError('Both email and 6-digit OTP are required');
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError('OTP must be exactly 6 digits (e.g. 123456)');
      return;
    }

    setLoading(true);

    try {
      const response = await api.verifyOtp({
        email: trimmedEmail,
        otp: trimmedOtp,
      });

      if (response.resetToken) {
        if (onOtpVerified) {
          onOtpVerified(response.resetToken);
        } else {
          onNavigate('reset-password');
        }
      } else {
        throw new Error('Verification failed: No reset token received.');
      }
    } catch (err) {
      if (err.status === 429) {
        handleRateLimit(err);
        setError(
          err.retryAfter
            ? `Too many requests. Please try again in ${err.retryAfter} seconds.`
            : (err.message || 'Too many OTP attempts. Please request a new OTP.')
        );
      } else if (err.status === 400) {
        setError(err.data?.message || 'Invalid or expired OTP. Please verify the code.');
      } else {
        setError(err.message || 'Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!currentEmail.trim() || resendLoading || isResendRateLimited) return;

    setError(null);
    setResendSuccess(false);
    setResendLoading(true);

    try {
      await api.forgotPassword({ email: currentEmail.trim() });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err) {
      if (err.status === 429) {
        handleResendRateLimit(err);
        setError(
          err.retryAfter
            ? `Too many requests. Please try again in ${err.retryAfter} seconds.`
            : (err.message || 'Too many requests. Please try again later.')
        );
      } else {
        setError(err.message || 'Failed to resend OTP');
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#e2dcd0] rounded-3xl p-8 sm:p-9 shadow-lg relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f5f0e6] text-amber-900 border border-[#e2ddd1] mb-4 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-amber-800" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Enter OTP Code</h1>
          <p className="text-xs text-zinc-500 mt-1">
            We sent a 6-digit verification code to
          </p>
          <p className="text-xs font-semibold text-zinc-800 font-mono mt-0.5">
            {currentEmail || 'your email'}
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
              <p className="font-bold">Verification Failed</p>
              <p className="text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        ) : null}

        {/* Resend success notice */}
        {resendSuccess && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>A new verification code has been dispatched.</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          {!email && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                Email Address <span className="text-amber-700">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  placeholder="nirbhay@example.com"
                  required
                  disabled={loading || isRateLimited}
                  className="w-full bg-[#faf8f4] border border-[#ded8cb] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                6-Digit OTP Code <span className="text-amber-700">*</span>
              </label>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading || isResendRateLimited}
                className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Resending...</span>
                  </>
                ) : isResendRateLimited ? (
                  <span>Resend in {resendCooldown}s</span>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                autoFocus
                disabled={loading || isRateLimited}
                className="w-full bg-[#faf8f4] border border-[#ded8cb] rounded-xl pl-10 pr-4 py-3 text-center text-base font-bold font-mono tracking-widest text-zinc-900 placeholder-zinc-300 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all disabled:opacity-50"
              />
            </div>
            <p className="text-[11px] text-zinc-400 text-center">
              Enter the 6-digit numeric OTP sent to your email inbox
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || isRateLimited || otp.length !== 6}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1e2024] hover:bg-[#2e3137] text-amber-300 rounded-xl text-xs font-bold shadow-md shadow-black/10 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Verifying Code...</span>
              </>
            ) : isRateLimited ? (
              <>
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Retry in {cooldown}s</span>
              </>
            ) : (
              <>
                <span>Verify OTP & Continue</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-zinc-500">
          <button
            type="button"
            onClick={() => onNavigate('forgot-password')}
            className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            Change Email
          </button>

          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-amber-800 hover:text-amber-900 font-bold transition-colors cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
