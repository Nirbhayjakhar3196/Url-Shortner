import React, { useState, useEffect } from 'react';
import { Link2, LayoutDashboard, History, LogIn, UserPlus, LogOut, Menu, X } from 'lucide-react';
import { getCurrentUser, removeToken } from '../lib/auth';
import api from '../lib/api';

export default function Navbar({ activePage, onNavigate, onLogout }) {
  const [user, setUser] = useState(getCurrentUser());
  const [apiOnline, setApiOnline] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync user state on mount and when activePage transitions
  useEffect(() => {
    setUser(getCurrentUser());

    api.getHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));

    const checkUser = () => setUser(getCurrentUser());
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [activePage]);

  const handleLogout = () => {
    removeToken();
    setUser(null);
    if (onLogout) onLogout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
              className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-indigo-400 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  SwiftLink
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  URL Shortener
                </span>
              </div>
            </button>

            {/* API Health Pulse */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${apiOnline === true ? 'bg-emerald-400 animate-pulse' : apiOnline === false ? 'bg-rose-500' : 'bg-amber-400'}`} />
              <span>{apiOnline === true ? 'API Connected' : apiOnline === false ? 'API Offline' : 'Connecting...'}</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-2">
            {user ? (
              /* LOGGED IN: Only show Dashboard, History, User Badge, and Logout */
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'dashboard'
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>

                <button
                  onClick={() => onNavigate('history')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'history'
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History & Analytics
                </button>

                <div className="h-5 w-px bg-slate-800 mx-2" />

                {/* User info badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold uppercase text-[10px]">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <span className="font-semibold text-slate-200">{user.name}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors ml-1 cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              /* LOGGED OUT: Show Home, Sign In, and Get Started */
              <>
                <button
                  onClick={() => onNavigate('landing')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'landing' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Home
                </button>

                <button
                  onClick={() => onNavigate('login')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'login'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>

                <button
                  onClick={() => onNavigate('register')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-md shadow-indigo-500/25 transition-all ml-1 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Get Started
                </button>
              </>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-2 animate-in fade-in">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 border-b border-slate-800/80 mb-2">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold uppercase text-xs">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div>
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>

              <button
                onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  activePage === 'dashboard' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={() => { onNavigate('history'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  activePage === 'history' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <History className="w-4 h-4" />
                History & Analytics
              </button>

              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900"
              >
                Home
              </button>
              <button
                onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white"
              >
                <UserPlus className="w-4 h-4" />
                Get Started
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
