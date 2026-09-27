import React from 'react';
import { ArrowRight, Link2, Sparkles, CheckCircle2, MousePointerClick, ShieldCheck, Zap, Globe, Share2, BarChart3, Users, HelpCircle } from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto pt-8 pb-6 px-4">
        {/* Soft Warm Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f0ebd9] border border-[#e0dac8] text-amber-900 text-xs font-bold uppercase tracking-wider mb-6 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Fast, Reliable & Privacy-First Link Shortener</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.15] mb-6">
          Make every link{' '}
          <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-900 bg-clip-text text-transparent">
            clean, memorable & trackable
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-10">
          Transform long, clunky URLs into short links. Share them anywhere across social media, emails, and portfolios while monitoring real-time visitor clicks.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('register')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#1e2024] hover:bg-[#2e3137] text-amber-300 font-bold shadow-xl shadow-black/10 transition-all text-sm cursor-pointer hover:scale-[1.02]"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>

          <button
            onClick={() => onNavigate('login')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-[#f3ede3] text-zinc-800 border border-[#ded7c8] font-bold shadow-2xs transition-colors text-sm cursor-pointer"
          >
            <span>Sign In to Dashboard</span>
          </button>
        </div>

        {/* Visual Link Transformation Card */}
        <div className="mt-14 max-w-2xl mx-auto bg-white border border-[#e2dcd0] rounded-3xl p-6 sm:p-7 shadow-lg text-left">
          <div className="flex items-center justify-between pb-3 border-b border-[#eee8dc] mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Visual Demonstration</span>
            <span className="text-xs text-zinc-400 font-medium">Instant Transformation</span>
          </div>

          <div className="space-y-3.5">
            {/* Long Link */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Before: Cluttered URL</span>
              <div className="mt-1 bg-[#faf8f4] p-3 rounded-xl border border-[#ded8cb] text-xs font-mono text-zinc-500 truncate">
                https://yourdomain.com/products/category/item-detail?ref=social&campaign=summer2026&source=newsletter_promo_long_id_987654321
              </div>
            </div>

            {/* Short Link */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">After: SwiftLink Short URL</span>
              <div className="mt-1 flex items-center justify-between gap-3 bg-[#f6faf5] p-3 rounded-xl border border-emerald-200 text-xs font-mono">
                <div className="flex items-center gap-2 truncate">
                  <Link2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-emerald-900 font-bold truncate">http://localhost:3000/aB3xY9z</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-sans font-bold shrink-0">
                  Ready to Share
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Use SwiftLink / Problems Solved */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">Why shorten your links?</h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-2">Long URLs are hard to read, look spammy, and give you zero visibility into engagement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#e2dcd0] p-6 rounded-2xl shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#f5f0e6] text-amber-900 flex items-center justify-center border border-[#e2ddd1]">
              <Share2 className="w-5 h-5 text-amber-800" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Clean on Socials & Bios</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Short links look clean and professional in social media posts, bios, messages, and portfolios without taking up character space.
            </p>
          </div>

          <div className="bg-white border border-[#e2dcd0] p-6 rounded-2xl shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#eef7ee] text-emerald-900 flex items-center justify-center border border-[#d6ebd6]">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Track Every Single Click</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Know exactly how many times people opened your link and when the last visitor arrived with accurate real-time stats.
            </p>
          </div>

          <div className="bg-white border border-[#e2dcd0] p-6 rounded-2xl shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#fdf5e6] text-amber-950 flex items-center justify-center border border-[#f5e4be]">
              <ShieldCheck className="w-5 h-5 text-amber-800" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Private Link Vault</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              All your created links are securely saved under your private account. Access, inspect, or delete any link anytime.
            </p>
          </div>
        </div>
      </section>

      {/* How to Use This App in 3 Steps */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white border border-[#e2dcd0] rounded-3xl p-8 sm:p-12 space-y-10 shadow-sm">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Quick Guide</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">How to use SwiftLink</h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">Get up and running in under a minute with three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#faf8f4] border border-[#ded8cb] p-6 rounded-2xl relative space-y-3">
              <div className="w-8 h-8 rounded-xl bg-[#1e2024] text-amber-300 flex items-center justify-center font-bold text-xs shadow-xs">
                1
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Paste Long URL</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Add any destination link (portfolio, doc, YouTube video, etc.) and give it a memorable title.
              </p>
            </div>

            <div className="bg-[#faf8f4] border border-[#ded8cb] p-6 rounded-2xl relative space-y-3">
              <div className="w-8 h-8 rounded-xl bg-[#1e2024] text-amber-300 flex items-center justify-center font-bold text-xs shadow-xs">
                2
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Get Short Link</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Click generate to receive a compact short URL. Copy it with one click to your clipboard.
              </p>
            </div>

            <div className="bg-[#faf8f4] border border-[#ded8cb] p-6 rounded-2xl relative space-y-3">
              <div className="w-8 h-8 rounded-xl bg-[#1e2024] text-amber-300 flex items-center justify-center font-bold text-xs shadow-xs">
                3
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Share & Track</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Distribute your link. As visitors open it, watch your live click stats update in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us / Why Choose Us */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-[#f8f5ee] to-[#ede7da] border border-[#ded7c8] rounded-3xl p-8 sm:p-10 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-amber-900 flex items-center justify-center border border-[#ded7c8] shadow-2xs">
              <Globe className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">About SwiftLink</h3>
              <p className="text-xs text-zinc-500">Built for creators, professionals, and teams</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
            SwiftLink was created with a clear objective: provide a clean, fast, and transparent URL shortener without intrusive advertisements, hidden delays, or unnecessary bloat. Whether you are sharing work portfolios, marketing campaigns, or personal projects, SwiftLink gives you total clarity over your links.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 text-xs text-zinc-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Zero interstitial ads or redirect lag</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Accurate, real-time click statistics</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Password-protected account security</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>1-click deletion whenever you want</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="text-center max-w-3xl mx-auto px-4 pb-12">
        <div className="bg-[#1e2024] text-white p-8 sm:p-12 rounded-3xl space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Start shortening your links today</h2>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto">
            Create your account in seconds and manage all your shortened links from your personal dashboard.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold shadow-lg transition-all text-xs sm:text-sm cursor-pointer hover:scale-[1.02]"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
