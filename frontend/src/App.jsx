import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PublicNavbar from './components/PublicNavbar';
import Toast from './components/Toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import { getCurrentUser, isAuthenticated, removeToken } from './lib/auth';
import { Menu, Link2 } from 'lucide-react';

const pageToPath = {
  landing: '/',
  login: '/login',
  register: '/register',
  'forgot-password': '/forgot-password',
  'verify-otp': '/verify-otp',
  'reset-password': '/reset-password',
  dashboard: '/dashboard',
  history: '/history',
  'oauth-callback': '/oauth/callback',
};

const getInitialPage = () => {
  const path = window.location.pathname;
  if (path === '/oauth/callback' || path === '/oauth/callback/') {
    const params = new URLSearchParams(window.location.search);
    const hasCode = params.get('code') || params.get('error');
    if (hasCode) {
      return 'oauth-callback';
    }
    // If no code and already authenticated, stay on dashboard
    if (isAuthenticated()) {
      return 'dashboard';
    }
    return 'login';
  }
  if (path === '/login') return isAuthenticated() ? 'dashboard' : 'login';
  if (path === '/register') return isAuthenticated() ? 'dashboard' : 'register';
  if (path === '/forgot-password') return 'forgot-password';
  if (path === '/verify-otp') return 'verify-otp';
  if (path === '/reset-password') return 'reset-password';
  if (path === '/dashboard' || path === '/history') {
    return isAuthenticated() ? path.replace('/', '') : 'login';
  }
  return isAuthenticated() ? 'dashboard' : 'landing';
};

export default function App() {
  const [activePage, setActivePage] = useState(getInitialPage);
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [toast, setToast] = useState({ message: null, type: 'info' });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // In-memory state for password reset flow (not stored permanently)
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: null, type: 'info' });
    }, 4000);
  };

  useEffect(() => {
    const authStatus = isAuthenticated();
    setIsAuth(authStatus);

    const path = window.location.pathname;
    if (path === '/oauth/callback' || path === '/oauth/callback/') {
      const params = new URLSearchParams(window.location.search);
      const hasCode = params.get('code') || params.get('error');
      if (hasCode) {
        setActivePage('oauth-callback');
      } else if (authStatus) {
        setActivePage('dashboard');
        window.history.replaceState({}, '', '/dashboard');
      } else {
        setActivePage('login');
        window.history.replaceState({}, '', '/login');
      }
    } else if (authStatus) {
      if (activePage === 'landing' || activePage === 'login' || activePage === 'register') {
        setActivePage('dashboard');
        window.history.replaceState({}, '', '/dashboard');
      }
    }

    const handlePopState = () => {
      setActivePage(getInitialPage());
      setIsAuth(isAuthenticated());
    };

    const handleUnauthorized = () => {
      removeToken();
      setIsAuth(false);
      setActivePage('login');
      window.history.replaceState({}, '', '/login');
      showToast('Session expired. Please sign in again.', 'error');
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const handleNavigate = (page, replace = false) => {
    if ((page === 'dashboard' || page === 'history') && !isAuthenticated()) {
      showToast('Please sign in to access your dashboard.', 'info');
      setActivePage('login');
      window.history.replaceState({}, '', '/login');
      return;
    }
    setActivePage(page);
    const targetPath = pageToPath[page] || '/';
    if (window.location.pathname !== targetPath) {
      if (replace) {
        window.history.replaceState({}, '', targetPath);
      } else {
        window.history.pushState({}, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setIsAuth(true);
    showToast('Welcome back! Signed in successfully.', 'success');
    handleNavigate('dashboard', true);
  };

  const handleLogout = () => {
    removeToken();
    setIsAuth(false);
    showToast('Logged out successfully.', 'info');
    handleNavigate('landing', true);
  };

  const isDashboardView = isAuth && (activePage === 'dashboard' || activePage === 'history');

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1a1a1e] font-sans selection:bg-amber-400 selection:text-black">
      {/* Toast Notification */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null, type: 'info' })}
        />
      )}

      {isDashboardView ? (
        /* Authenticated View: Left Sidebar Layout */
        <div className="flex min-h-screen">
          {/* Left Sidebar */}
          <Sidebar
            activePage={activePage}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            isMobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />

          {/* Main Content Pane with left padding for Sidebar */}
          <div className="flex-1 flex flex-col md:pl-64 min-w-0">
            {/* Mobile Header with Hamburger Toggle */}
            <header className="sticky top-0 z-30 flex md:hidden items-center justify-between h-16 px-4 bg-[#fdfcf9] border-b border-[#e8e4db]">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="p-2 -ml-1 text-zinc-700 hover:bg-[#ede7da] rounded-xl cursor-pointer"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1e2024] text-amber-300 flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-amber-300" />
                  </div>
                  <span className="font-bold text-sm text-zinc-900">SwiftLink</span>
                </div>
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-[#eee8dc] px-2.5 py-1 rounded-full border border-[#ded7c8]">
                {activePage === 'dashboard' ? 'Dashboard' : 'History'}
              </span>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8">
              {activePage === 'dashboard' && (
                <DashboardPage
                  onNavigate={handleNavigate}
                  showToast={showToast}
                />
              )}
              {activePage === 'history' && (
                <HistoryPage
                  onNavigate={handleNavigate}
                  showToast={showToast}
                />
              )}
            </main>
          </div>
        </div>
      ) : (
        /* Public View: Top Navbar Layout */
        <div className="min-h-screen flex flex-col">
          <PublicNavbar
            activePage={activePage}
            onNavigate={handleNavigate}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activePage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
            {activePage === 'login' && (
              <LoginPage
                onNavigate={handleNavigate}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
            {activePage === 'register' && (
              <RegisterPage onNavigate={handleNavigate} />
            )}
            {activePage === 'forgot-password' && (
              <ForgotPasswordPage
                initialEmail={resetEmail}
                onNavigate={handleNavigate}
                onEmailSubmitted={(email) => {
                  setResetEmail(email);
                  handleNavigate('verify-otp');
                }}
              />
            )}
            {activePage === 'verify-otp' && (
              <VerifyOtpPage
                email={resetEmail}
                onNavigate={handleNavigate}
                onOtpVerified={(token) => {
                  setResetToken(token);
                  handleNavigate('reset-password');
                }}
              />
            )}
            {activePage === 'reset-password' && (
              <ResetPasswordPage
                email={resetEmail}
                resetToken={resetToken}
                onNavigate={handleNavigate}
                onPasswordResetSuccess={() => {
                  setResetEmail('');
                  setResetToken('');
                  showToast('Password reset successfully! Please sign in with your new password.', 'success');
                  handleNavigate('login');
                }}
              />
            )}
            {activePage === 'oauth-callback' && (
              <OAuthCallbackPage
                onNavigate={handleNavigate}
                onLoginSuccess={handleLoginSuccess}
                showToast={showToast}
              />
            )}
          </main>

          <footer className="border-t border-[#e8e4db] bg-[#f2eee5] py-8 text-center text-xs text-zinc-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="font-medium text-zinc-600">© {new Date().getFullYear()} SwiftLink. Clean URL Shortening & Analytics.</p>
              <div className="flex items-center gap-4 text-zinc-500">
                <span>Fast Redirection</span>
                <span>•</span>
                <span>Real-Time Clicks</span>
                <span>•</span>
                <span>JWT Security</span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
