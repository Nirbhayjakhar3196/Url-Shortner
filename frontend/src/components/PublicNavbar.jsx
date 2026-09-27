import React, { useState } from 'react';
import { Link2, LogIn, UserPlus, Menu, X } from 'lucide-react';

export default function PublicNavbar({ activePage, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e8e4db] bg-[#f8f6f0]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1e2024] text-amber-300 flex items-center justify-center shadow-md shadow-black/10 group-hover:scale-105 transition-transform">
              <Link2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-lg font-bold text-[#1a1a1e] tracking-tight">
                SwiftLink
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#eee8dc] text-amber-900 border border-[#ded7c8]">
                URL Shortener
              </span>
            </div>
          </button>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activePage === 'landing' ? 'text-zinc-900 bg-[#ede7da]' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate('login')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePage === 'login'
                  ? 'bg-white text-zinc-900 shadow-xs border border-[#e2ddd1]'
                  : 'text-zinc-700 hover:text-zinc-900 hover:bg-[#ede7da]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => onNavigate('register')}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-[#1e2024] hover:bg-[#2d3036] text-amber-300 shadow-md shadow-black/10 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-300" />
              <span>Get Started</span>
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-700 hover:bg-[#ede7da] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#e8e4db] bg-[#fdfcf9] px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-700 hover:bg-[#f1ebe0]"
          >
            Home
          </button>
          <button
            onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-700 hover:bg-[#f1ebe0]"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1e2024] text-amber-300"
          >
            <UserPlus className="w-4 h-4" />
            <span>Get Started</span>
          </button>
        </div>
      )}
    </header>
  );
}
