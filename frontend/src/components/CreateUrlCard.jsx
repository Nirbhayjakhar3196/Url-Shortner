import React, { useState } from 'react';
import { PlusCircle, Link2, Type, ArrowRight, Check, Copy, ExternalLink, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import api from '../lib/api';

export default function CreateUrlCard({ onUrlCreated, onCopySuccess }) {
  const [title, setTitle] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedUrl = originalUrl.trim();

    if (!trimmedTitle || !trimmedUrl) {
      setError('Both title and destination URL are required');
      return;
    }

    try {
      const urlObj = new URL(trimmedUrl);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        setError('Only HTTP and HTTPS URLs are allowed');
        return;
      }
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setLoading(true);

    try {
      const result = await api.createUrl({
        title: trimmedTitle,
        originalUrl: trimmedUrl,
      });

      setCreatedResult(result);
      setTitle('');
      setOriginalUrl('');
      if (onUrlCreated) onUrlCreated(result);
    } catch (err) {
      setError(err.message || 'Unable to create short URL. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdResult) return;
    const urlToCopy = createdResult.shortUrl || api.getPublicShortUrl(createdResult.shortId);
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    if (onCopySuccess) onCopySuccess(urlToCopy);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-[#e4ded3] rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#f5f1e8] text-amber-800 flex items-center justify-center border border-[#e2dcce] shrink-0">
          <Sparkles className="w-4 h-4 text-amber-700" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Create Short URL</h2>
          <p className="text-xs text-zinc-500">Generate a clean, trackable short link with custom title</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Title Input */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Link Title <span className="text-amber-600">*</span>
            </label>
            <div className="relative">
              <Type className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Portfolio"
                required
                disabled={loading}
                className="w-full bg-[#faf8f4] border border-[#ded8cb] rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Original URL Input */}
          <div className="md:col-span-8 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Destination URL <span className="text-amber-600">*</span>
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/very-long-url-path"
                required
                disabled={loading}
                className="w-full bg-[#faf8f4] border border-[#ded8cb] rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-zinc-500 font-medium">
            Requires valid <code className="text-zinc-700 font-mono bg-[#f2eee5] px-1.5 py-0.5 rounded">http://</code> or <code className="text-zinc-700 font-mono bg-[#f2eee5] px-1.5 py-0.5 rounded">https://</code> URL
          </span>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1e2024] hover:bg-[#2d3036] text-amber-300 rounded-xl text-xs font-bold shadow-md shadow-black/10 transition-all disabled:opacity-50 cursor-pointer hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Shorten Link</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Banner when created */}
      {createdResult && (
        <div className="mt-6 p-4.5 rounded-xl bg-[#f6faf5] border border-emerald-300/80 text-emerald-900 animate-in fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider">Short Link Created Successfully!</span>
            </div>
            <button
              onClick={() => setCreatedResult(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-emerald-200">
            <div className="truncate">
              <p className="text-xs text-zinc-500 font-medium truncate">{createdResult.title}</p>
              <p className="text-sm font-mono text-emerald-700 font-bold truncate mt-0.5">
                {createdResult.shortUrl || api.getPublicShortUrl(createdResult.shortId)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>

              <a
                href={createdResult.shortUrl || api.getPublicShortUrl(createdResult.shortId)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-[#f3efe6] hover:bg-[#e8e2d4] text-zinc-700 rounded-lg transition-colors"
                title="Test Short URL"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
