import React, { useState } from 'react';
import { Link2, ExternalLink, Copy, Check, BarChart3, Trash2, Calendar, MousePointerClick, Clock } from 'lucide-react';
import api from '../lib/api';

export default function UrlCard({ url, onOpenAnalytics, onDeleteClick, onCopySuccess }) {
  const [copied, setCopied] = useState(false);

  const publicShortUrl = api.getPublicShortUrl(url.shortId);

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
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatLastClicked = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
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
    <div className="bg-white hover:bg-[#fffefa] border border-[#e4ded3] hover:border-[#d4cca9] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
      <div>
        {/* Header with Title & Click Badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-zinc-900 truncate group-hover:text-amber-900 transition-colors">
              {url.title || 'Untitled Link'}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fdf6e6] border border-[#f5e6be] text-amber-900 text-xs font-bold shrink-0">
            <MousePointerClick className="w-3.5 h-3.5 text-amber-700" />
            <span>{url.clicks ?? 0} {url.clicks === 1 ? 'click' : 'clicks'}</span>
          </div>
        </div>

        {/* Short Link Box with 1-click copy */}
        <div className="flex items-center gap-2 bg-[#f9f7f2] p-2.5 rounded-xl border border-[#ded8cb] my-3">
          <Link2 className="w-4 h-4 text-amber-700 shrink-0 ml-1" />
          <span className="text-xs font-mono font-bold text-zinc-800 truncate flex-1 select-all">
            {publicShortUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              copied
                ? 'bg-emerald-700 text-white'
                : 'bg-white hover:bg-[#eee8dc] text-zinc-800 border border-[#d8d2c4]'
            }`}
            title="Copy short link"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <a
            href={publicShortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-[#eee8dc] transition-colors shrink-0"
            title="Open short link (records click & redirects)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Destination URL */}
        <div className="text-xs text-zinc-500 truncate flex items-center gap-1.5 mb-4">
          <span className="text-zinc-400 font-semibold shrink-0">To:</span>
          <span className="truncate font-mono text-zinc-700 font-medium" title={url.originalUrl}>
            {url.originalUrl}
          </span>
        </div>
      </div>

      {/* Footer with Metadata & Actions */}
      <div className="pt-3 border-t border-[#eee9df] flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title="Created date">
            <Calendar className="w-3 h-3 text-zinc-400" />
            {formatDate(url.createdAt)}
          </span>
          <span className="flex items-center gap-1" title="Last clicked">
            <Clock className="w-3 h-3 text-zinc-400" />
            {formatLastClicked(url.lastClickedAt)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => onOpenAnalytics(url.shortId)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-zinc-800 hover:text-black bg-[#f2ede4] hover:bg-[#e7e1d5] border border-[#ded8cc] rounded-lg transition-colors cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-800" />
            <span>Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => onDeleteClick(url)}
            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete URL"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
