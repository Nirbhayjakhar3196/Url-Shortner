import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

export default function RegisterPage({ onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
      setError(err.message || 'Registration failed. Please try again.');
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

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Registration Error</p>
              <p className="text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
                className="w-full bg-[#faf8f4] border border-[#ded8cb] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1e2024] hover:bg-[#2e3137] text-amber-300 rounded-xl text-xs font-bold shadow-md shadow-black/10 transition-all mt-6 disabled:opacity-50 cursor-pointer hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Creating Account...</span>
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
