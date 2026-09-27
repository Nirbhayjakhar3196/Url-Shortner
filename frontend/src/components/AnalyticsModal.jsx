import React, { useState, useEffect } from 'react';
import { X, BarChart3, Link2, ExternalLink, Calendar, MousePointerClick, Clock, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import api from '../lib/api';

export default function AnalyticsModal({ shortId, isOpen, onClose, onCopySuccess }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && shortId) {
      setLoading(true);
      setError(null);
      api.getAnalytics(shortId)
        .then((data) => {
          setAnalytics(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load URL analytics');
          setLoading(false);
        });
    }
  }, [isOpen, shortId]);

  if (!isOpen) return null;

  const publicShortUrl = api.getPublicShortUrl(shortId);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicShortUrl);
    setCopied(true);
    if (onCopySuccess) onCopySuccess(publicShortUrl);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-[#fdfcf9] border border-[#e2dcd0] rounded-2xl p-6 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#eee9de]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f5f0e6] text-amber-800 flex items-center justify-center border border-[#e4ded2]">
              <BarChart3 className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">URL Analytics</h3>
              <p className="text-[11px] text-zinc-500">Real-time click statistics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-800 rounded-lg hover:bg-[#f2eee5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-500">
            <Loader2 className="w-7 h-7 animate-spin text-amber-700" />
            <p className="text-xs font-bold text-zinc-700">Fetching analytics...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error Loading Analytics</p>
              <p className="text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        ) : analytics ? (
          <div className="space-y-4">
            {/* Title & Short ID header */}
            <div className="bg-[#faf8f4] p-4 rounded-xl border border-[#ded8cb]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Link Title</span>
              <h4 className="text-sm font-bold text-zinc-900 mt-0.5">{analytics.title}</h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded bg-white text-zinc-700 font-mono font-bold border border-[#e2ddd1]">
                  ID: {analytics.shortId}
                </span>
              </div>
            </div>

            {/* Click Count Big Metric */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl border border-[#ded8cb] flex flex-col justify-between shadow-2xs">
                <div className="flex items-center justify-between text-amber-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Total Clicks</span>
                  <MousePointerClick className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <div className="text-2xl font-extrabold text-zinc-900 mt-2">
                  {analytics.clicks ?? 0}
                </div>
                <span className="text-[10px] text-zinc-400 mt-1">Recorded visits</span>
              </div>

              <div className="bg-[#faf8f4] p-3.5 rounded-xl border border-[#ded8cb] flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Created</span>
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <div className="text-xs font-bold text-zinc-800 mt-2 leading-relaxed">
                  {formatDate(analytics.createdAt)}
                </div>
              </div>

              <div className="bg-[#faf8f4] p-3.5 rounded-xl border border-[#ded8cb] flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Last Clicked</span>
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <div className="text-xs font-bold text-zinc-800 mt-2 leading-relaxed">
                  {formatDate(analytics.lastClickedAt)}
                </div>
              </div>
            </div>

            {/* Public Link */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">Public Short Link</label>
              <div className="flex items-center gap-2 bg-[#faf8f4] border border-[#ded8cb] rounded-xl p-2.5">
                <Link2 className="w-4 h-4 text-amber-700 shrink-0 ml-1" />
                <span className="text-xs font-mono font-bold text-zinc-800 truncate flex-1">
                  {publicShortUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#1e2024] hover:bg-[#2e3137] text-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-amber-300" /> : <Copy className="w-3 h-3 text-amber-300" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Destination URL */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">Destination URL</label>
              <div className="flex items-center justify-between gap-2 bg-[#faf8f4] border border-[#ded8cb] rounded-xl p-2.5">
                <span className="text-xs font-mono text-zinc-700 truncate font-medium">
                  {analytics.originalUrl}
                </span>
                <a
                  href={analytics.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-[#ede7da] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-[#ede7da] hover:bg-[#ded7c8] text-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
