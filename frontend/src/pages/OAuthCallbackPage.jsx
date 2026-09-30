import React, { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, ArrowRight, RefreshCw, LogIn } from 'lucide-react';
import api from '../lib/api';
import { setToken, isAuthenticated } from '../lib/auth';

export default function OAuthCallbackPage({ onNavigate, onLoginSuccess, showToast }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Verifying Google authorization...');
  const exchangeAttempted = useRef(false);

  useEffect(() => {
    // If already authenticated and no code in URL, redirect directly to dashboard
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');

    if (!code && !errorParam && isAuthenticated()) {
      window.history.replaceState({}, document.title, '/dashboard');
      if (onNavigate) onNavigate('dashboard');
      return;
    }

    // Avoid double execution in React StrictMode
    if (exchangeAttempted.current) return;
    exchangeAttempted.current = true;

    const processOAuthCallback = async () => {
      // Check if Google returned an error directly
      if (errorParam) {
        setLoading(false);
        const errMsg = errorParam === 'access_denied'
          ? 'Google sign-in was cancelled.'
          : `Google authentication failed: ${errorParam}`;
        setError(errMsg);
        if (showToast) showToast(errMsg, 'error');
        window.history.replaceState({}, document.title, '/login');
        return;
      }

      // Validate presence of authorization code
      if (!code) {
        setLoading(false);
        const errMsg = 'Authentication failed: Missing authorization code from Google.';
        setError(errMsg);
        if (showToast) showToast(errMsg, 'error');
        window.history.replaceState({}, document.title, '/login');
        return;
      }

      try {
        setStatusMessage('Exchanging authorization code for application session...');

        // Exchange code with backend
        const response = await api.exchangeGoogleCode(code);

        // Verify token in response
        if (response && response.token) {
          // Store token using existing mechanism
          setToken(response.token);

          // Update browser URL to /dashboard so refreshing the page stays on dashboard
          window.history.replaceState({}, document.title, '/dashboard');

          if (showToast) {
            showToast(response.message || 'Signed in with Google successfully!', 'success');
          }

          // Update auth state and redirect to dashboard
          if (onLoginSuccess) {
            onLoginSuccess(response.token);
          } else {
            onNavigate('dashboard');
          }
        } else {
          throw new Error('No authentication token returned by the server.');
        }
      } catch (err) {
        setLoading(false);

        // Clean up URL
        window.history.replaceState({}, document.title, '/login');

        let errorMessage = 'An unexpected error occurred during Google sign-in.';

        if (err.status === 400) {
          errorMessage = err.data?.message || 'Invalid or missing Google exchange request.';
        } else if (err.status === 401) {
          errorMessage = err.data?.message || 'The Google authorization code is invalid or has expired. Please sign in again.';
        } else if (err.status === 429) {
          errorMessage = err.retryAfter
            ? `Too many authentication requests. Please try again in ${err.retryAfter} seconds.`
            : (err.message || 'Too many requests. Please try again later.');
        } else if (err.status === 500) {
          errorMessage = err.data?.message || 'Server error while verifying Google login. Please try again.';
        } else if (!err.status) {
          // Network failure
          errorMessage = err.message || 'Unable to connect to the authentication server. Please check your network connection.';
        } else {
          errorMessage = err.message || errorMessage;
        }

        setError(errorMessage);
        if (showToast) {
          showToast(errorMessage, 'error');
        }
      }
    };

    processOAuthCallback();
  }, [onNavigate, onLoginSuccess, showToast]);

  const handleRetryGoogleLogin = () => {
    window.location.href = api.getGoogleAuthUrl();
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#e2dcd0] rounded-3xl p-8 sm:p-9 shadow-lg relative overflow-hidden">
        {loading ? (
          /* Loading State */
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#f5f0e6] text-amber-900 border border-[#e2ddd1] mb-6 shadow-2xs relative">
              <Loader2 className="w-7 h-7 text-amber-800 animate-spin" />
            </div>

            <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight mb-2">
              Authenticating with Google
            </h1>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-6">
              {statusMessage}
            </p>

            <div className="w-full bg-[#f4eee3] h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-600 h-full w-2/3 rounded-full animate-pulse"></div>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 mb-4 shadow-2xs">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                Authentication Failed
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Unable to complete Google sign-in
              </p>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Error Details</p>
                <p className="text-rose-700 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleRetryGoogleLogin}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1e2024] hover:bg-[#2e3137] text-amber-300 rounded-xl text-xs font-bold shadow-md shadow-black/10 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <RefreshCw className="w-4 h-4 text-amber-300" />
                <span>Try Google Sign-In Again</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#faf8f4] hover:bg-[#f2ece0] border border-[#ded8cb] text-zinc-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Return to Email Sign In</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto text-zinc-400" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
