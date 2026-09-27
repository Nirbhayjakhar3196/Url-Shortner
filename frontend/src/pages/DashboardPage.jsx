import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Link2, MousePointerClick, TrendingUp, Search, RefreshCw, AlertCircle, Plus, Loader2, Sparkles } from 'lucide-react';
import api from '../lib/api';
import CreateUrlCard from '../components/CreateUrlCard';
import UrlCard from '../components/UrlCard';
import AnalyticsModal from '../components/AnalyticsModal';
import ConfirmModal from '../components/ConfirmModal';

export default function DashboardPage({ onNavigate, showToast }) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search & sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modals state
  const [selectedShortIdForAnalytics, setSelectedShortIdForAnalytics] = useState(null);
  const [urlToDelete, setUrlToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUrls = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await api.getMyUrls();
      const urlList = Array.isArray(response) ? response : (response.urls || []);
      setUrls(urlList);
    } catch (err) {
      setError(err.message || 'Failed to load your shortened URLs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleUrlCreated = (newUrl) => {
    showToast('Short URL created successfully!', 'success');
    fetchUrls(true);
  };

  const handleDeleteConfirm = async () => {
    if (!urlToDelete) return;
    setDeleteLoading(true);

    try {
      await api.deleteUrl(urlToDelete.shortId);
      showToast('Short URL deleted successfully', 'success');
      setUrlToDelete(null);
      setUrls((prev) => prev.filter((u) => u.shortId !== urlToDelete.shortId));
    } catch (err) {
      showToast(err.message || 'Failed to delete short URL', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Compute real metrics
  const totalUrls = urls.length;
  const totalClicks = urls.reduce((sum, u) => sum + (Number(u.clicks) || 0), 0);
  const mostClickedUrl = urls.length > 0
    ? [...urls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0]
    : null;

  // Filter & sort URLs
  const filteredUrls = urls
    .filter((u) => {
      const query = searchQuery.toLowerCase();
      const titleMatch = u.title && u.title.toLowerCase().includes(query);
      const urlMatch = u.originalUrl && u.originalUrl.toLowerCase().includes(query);
      const shortIdMatch = u.shortId && u.shortId.toLowerCase().includes(query);
      return titleMatch || urlMatch || shortIdMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'clicks') return (b.clicks || 0) - (a.clicks || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="space-y-8">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Links Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Shorten URLs, copy shareable links, and monitor real-time visits
          </p>
        </div>

        <button
          onClick={() => fetchUrls(true)}
          disabled={refreshing || loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#f3eee4] text-zinc-700 hover:text-zinc-900 rounded-xl border border-[#ded8cb] text-xs font-bold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh URL list from backend"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-700' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e4ded3] p-5 rounded-2xl flex items-center gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-[#f5f0e6] text-amber-800 flex items-center justify-center border border-[#e4ded2] shrink-0">
            <Link2 className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">Total Short Links</p>
            <p className="text-2xl font-extrabold text-zinc-900 mt-0.5">{totalUrls}</p>
          </div>
        </div>

        <div className="bg-white border border-[#e4ded3] p-5 rounded-2xl flex items-center gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-[#eef7ee] text-emerald-800 flex items-center justify-center border border-[#d6ebd6] shrink-0">
            <MousePointerClick className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">Total Recorded Clicks</p>
            <p className="text-2xl font-extrabold text-zinc-900 mt-0.5">{totalClicks}</p>
          </div>
        </div>

        <div className="bg-white border border-[#e4ded3] p-5 rounded-2xl flex items-center gap-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-[#fdf5e6] text-amber-900 flex items-center justify-center border border-[#f5e4be] shrink-0">
            <TrendingUp className="w-6 h-6 text-amber-700" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">Top Performing</p>
            <p className="text-xs font-bold text-zinc-800 truncate mt-1" title={mostClickedUrl ? mostClickedUrl.title : 'None'}>
              {mostClickedUrl && mostClickedUrl.clicks > 0 ? mostClickedUrl.title : totalUrls > 0 ? 'No clicks recorded' : 'No links yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Create URL Form Card */}
      <CreateUrlCard
        onUrlCreated={handleUrlCreated}
        onCopySuccess={(url) => showToast('Short URL copied to clipboard!', 'info')}
      />

      {/* Search & Sort Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-zinc-900">My Shortened URLs</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eee8dc] text-zinc-700 text-xs font-bold">
              {filteredUrls.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search links..."
                className="w-full bg-white border border-[#ded8cb] rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/10"
              />
            </div>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#ded8cb] text-zinc-800 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-600 font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="clicks">Most Clicks</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-16 bg-white border border-[#e4ded3] rounded-2xl flex flex-col items-center justify-center gap-3 text-zinc-500 shadow-2xs">
            <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
            <p className="text-xs font-bold text-zinc-700">Loading your shortened URLs...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-rose-900">Unable to load URLs</h4>
              <p className="text-xs text-rose-700">{error}</p>
              <button
                onClick={() => fetchUrls()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition-colors mt-2"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        ) : filteredUrls.length === 0 ? (
          /* Empty State */
          <div className="py-16 bg-white border border-[#e4ded3] rounded-2xl text-center px-4 space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#f5f0e6] text-amber-800 flex items-center justify-center mx-auto border border-[#e4ded2]">
              <Link2 className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                {searchQuery ? 'No matching URLs found' : 'No shortened URLs yet'}
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                {searchQuery
                  ? `No links matched "${searchQuery}". Try clearing your search filter.`
                  : 'You haven’t created any shortened links yet. Use the creation card above to generate your first link!'}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-amber-800 hover:text-amber-900 font-bold"
              >
                Clear search filter
              </button>
            )}
          </div>
        ) : (
          /* URLs Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUrls.map((url) => (
              <UrlCard
                key={url._id || url.shortId}
                url={url}
                onOpenAnalytics={(shortId) => setSelectedShortIdForAnalytics(shortId)}
                onDeleteClick={(urlObj) => setUrlToDelete(urlObj)}
                onCopySuccess={(shortUrl) => showToast('Short URL copied to clipboard!', 'info')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      <AnalyticsModal
        shortId={selectedShortIdForAnalytics}
        isOpen={!!selectedShortIdForAnalytics}
        onClose={() => setSelectedShortIdForAnalytics(null)}
        onCopySuccess={(shortUrl) => showToast('Short URL copied to clipboard!', 'info')}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!urlToDelete}
        title="Delete Short URL"
        message={`Are you sure you want to delete "${urlToDelete?.title || 'this link'}"? The public short link will no longer redirect visitors.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setUrlToDelete(null)}
        isLoading={deleteLoading}
      />
    </div>
  );
}
