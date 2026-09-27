import React, { useState, useEffect } from 'react';
import { Link2, LayoutDashboard, History, LogOut, ChevronRight, X, Sparkles } from 'lucide-react';
import { getCurrentUser, removeToken } from '../lib/auth';
import api from '../lib/api';

export default function Sidebar({ activePage, onNavigate, onLogout, isMobileOpen, onMobileClose }) {
  const [user, setUser] = useState(getCurrentUser());
  const [apiOnline, setApiOnline] = useState(null);

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

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Manage & create links',
    },
    {
      id: 'history',
      label: 'History & Analytics',
      icon: History,
      description: 'Click insights & audit trail',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#fdfcf9] border-r border-[#e8e4db] flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Logo */}
        <div>
          <div className="h-18 px-5 flex items-center justify-between border-b border-[#ece8df]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1e2024] text-amber-300 flex items-center justify-center shadow-md shadow-black/10">
                <Link2 className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="text-base font-bold text-[#1a1a1e] tracking-tight">
                  SwiftLink
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-amber-800/80">
                  URL Shortener
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onMobileClose}
              className="md:hidden p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-[#f3efe6] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="p-4 space-y-1.5">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-600">
              Workspace
            </span>

            <nav className="mt-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      if (onMobileClose) onMobileClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-[#ede8dc] text-[#1c1d21] shadow-xs font-bold'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-[#f3efe6]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-amber-700' : 'text-zinc-600 group-hover:text-zinc-700'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section: API Status, User info & Logout */}
        <div className="p-4 border-t border-[#ece8df] space-y-3 bg-[#faf7f0]/60">
          {/* API Health Pulse Status Indicator */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#e8e4db] shadow-2xs text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiOnline === true
                    ? 'bg-emerald-500 animate-pulse'
                    : apiOnline === false
                    ? 'bg-rose-500'
                    : 'bg-amber-400'
                }`}
              />
              <span className="font-semibold text-zinc-700 text-[11px]">
                {apiOnline === true ? 'Backend Online' : apiOnline === false ? 'Backend Offline' : 'Connecting...'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-600 uppercase">Port 3000</span>
          </div>

          {/* User Profile Card */}
          {user && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#e8e4db] shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#efe9dc] text-amber-800 flex items-center justify-center font-bold text-xs uppercase border border-[#e0dacd] shrink-0">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-900 truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-zinc-600 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
