import React, { useState, useEffect } from 'react';
import { History, BarChart3, Link2, ExternalLink, Calendar, MousePointerClick, Clock, Copy, Check, Trash2, RefreshCw, Loader2, AlertCircle, Search } from 'lucide-react';
import api from '../lib/api';
import ConfirmModal from '../components/ConfirmModal';

export default function HistoryPage({ onNavigate, showToast }) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Selected link for deep analytics
  const [selectedShortId, setSelectedShortId] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Delete modal
  const [urlToDelete, setUrlToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUrls = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await api.getMyUrls();
      const urlList = Array.isArray(response) ? response : (response.urls || []);
      setUrls(urlList);

      if (urlList.length > 0 && !selectedShortId) {
        loadAnalytics(urlList[0].shortId);
      }
    } catch (err) {
      setError(err.message || 'Failed to load URL creation history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAnalytics = async (shortId) => {
    setSelectedShortId(shortId);
    setAnalyticsLoading(true);
    try {
      const data = await api.getAnalytics(shortId);
      setAnalyticsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleCopy = (shortId) => {
    const publicUrl = api.getPublicShortUrl(shortId);
    navigator.clipboard.writeText(publicUrl);
    setCopiedId(shortId);
    showToast('Short URL copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteConfirm = async () => {
    if (!urlToDelete) return;
    setDeleteLoading(true);

    try {
      await api.deleteUrl(urlToDelete.shortId);
      showToast('Short URL deleted successfully', 'success');
      setUrls((prev) => prev.filter((u) => u.shortId !== urlToDelete.shortId));
      if (selectedShortId === urlToDelete.shortId) {
        setSelectedShortId(null);
        setAnalyticsData(null);
      }
      setUrlToDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete URL', 'error');
    } finally {
      setDeleteLoading(false);
    }
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

  const formatDateTime = (dateString) => {
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

  const filteredUrls = urls.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.title && u.title.toLowerCase().includes(q)) ||
      (u.originalUrl && u.originalUrl.toLowerCase().includes(q)) ||
      (u.shortId && u.shortId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <History className="w-7 h-7 text-amber-800" />
            Link History & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Complete audit trail of created links and real-time backend click metrics
          </p>
        </div>

        <button
          onClick={() => fetchUrls(true)}
          disabled={refreshing || loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#f3eee4] text-zinc-700 hover:text-zinc-900 rounded-xl border border-[#ded8cb] text-xs font-bold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-700' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh History'}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 bg-white border border-[#e4ded3] rounded-2xl flex flex-col items-center justify-center gap-3 text-zinc-500 shadow-2xs">
          <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
          <p className="text-xs font-bold text-zinc-700">Loading link history...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-rose-900">Failed to load history</h4>
            <p className="text-xs text-rose-700">{error}</p>
            <button
              onClick={() => fetchUrls()}
              className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold"
            >
              Retry
            </button>
          </div>
        </div>
      ) : urls.length === 0 ? (
        <div className="py-16 bg-white border border-[#e4ded3] rounded-2xl text-center px-4 space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#f5f0e6] text-amber-800 flex items-center justify-center mx-auto border border-[#e4ded2]">
            <History className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900">No Link History Available</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              You haven't shortened any links yet. Head over to the Dashboard to create your first link.
            </p>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 bg-[#1e2024] text-amber-300 rounded-xl text-xs font-bold shadow-md shadow-black/10 transition-colors cursor-pointer"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* History List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-zinc-900">Created Links ({urls.length})</h2>
              <div className="relative w-48 sm:w-60">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter history..."
                  className="w-full bg-white border border-[#ded8cb] rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-600 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredUrls.map((url) => {
                const isSelected = selectedShortId === url.shortId;

                return (
                  <div
                    key={url._id || url.shortId}
                    onClick={() => loadAnalytics(url.shortId)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#fffef8] border-amber-600/60 shadow-sm ring-2 ring-amber-500/10'
                        : 'bg-white hover:bg-[#fffdf8] border-[#e4ded3] hover:border-[#d4cca9]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-zinc-900 truncate">
                            {url.title || 'Untitled Link'}
                          </h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#f3eee4] text-zinc-700">
                            {url.shortId}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-500 truncate mt-1 font-mono">
                          {url.originalUrl}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fdf6e6] text-amber-900 text-xs font-bold shrink-0 border border-[#f5e6be]">
                        <MousePointerClick className="w-3 h-3 text-amber-700" />
                        <span>{url.clicks ?? 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#eee9df] text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        {formatDate(url.createdAt)}
                      </span>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleCopy(url.shortId)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#f3efe7] hover:bg-[#e8e2d4] text-zinc-800 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          {copiedId === url.shortId ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === url.shortId ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setUrlToDelete(url)}
                          className="p-1 hover:text-rose-600 rounded hover:bg-rose-50 text-zinc-400 transition-colors cursor-pointer"
                          title="Delete URL"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Analytics Details Panel */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 bg-white border border-[#e4ded3] rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#eee9df]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#f5f0e6] text-amber-800 flex items-center justify-center border border-[#e4ded2]">
                    <BarChart3 className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Selected Link Stats</h3>
                    <p className="text-[11px] text-zinc-500">Real-time data from backend</p>
                  </div>
                </div>

                {analyticsData && (
                  <button
                    onClick={() => loadAnalytics(analyticsData.shortId)}
                    disabled={analyticsLoading}
                    className="p-1.5 text-zinc-500 hover:text-zinc-800 rounded-lg hover:bg-[#f3eee4] transition-colors cursor-pointer"
                    title="Refresh analytics"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? 'animate-spin text-amber-700' : ''}`} />
                  </button>
                )}
              </div>

              {analyticsLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-500">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-700" />
                  <p className="text-xs font-bold text-zinc-700">Fetching real-time stats...</p>
                </div>
              ) : analyticsData ? (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">Title</span>
                    <h4 className="text-base font-bold text-zinc-900 mt-0.5">{analyticsData.title}</h4>
                  </div>

                  {/* Clicks Big Metric */}
                  <div className="bg-[#faf8f4] p-4 rounded-xl border border-[#e4ded2]">
                    <div className="flex items-center justify-between text-amber-900">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Total Recorded Clicks</span>
                      <MousePointerClick className="w-4 h-4 text-amber-700" />
                    </div>
                    <div className="text-3xl font-extrabold text-zinc-900 mt-2">
                      {analyticsData.clicks ?? 0}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#faf8f4] p-3.5 rounded-xl border border-[#e4ded2]">
                      <div className="flex items-center gap-1.5 text-zinc-600 text-xs font-bold uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Created</span>
                      </div>
                      <p className="text-xs text-zinc-800 font-bold mt-2 leading-tight">
                        {formatDateTime(analyticsData.createdAt)}
                      </p>
                    </div>

                    <div className="bg-[#faf8f4] p-3.5 rounded-xl border border-[#e4ded2]">
                      <div className="flex items-center gap-1.5 text-zinc-600 text-xs font-bold uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Last Clicked</span>
                      </div>
                      <p className="text-xs text-zinc-800 font-bold mt-2 leading-tight">
                        {formatDateTime(analyticsData.lastClickedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Public Link Box */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">Public Short URL</label>
                    <div className="flex items-center gap-2 bg-[#faf8f4] p-2.5 rounded-xl border border-[#ded8cb]">
                      <Link2 className="w-4 h-4 text-amber-700 shrink-0 ml-1" />
                      <span className="text-xs font-mono font-bold text-zinc-800 truncate flex-1 select-all">
                        {api.getPublicShortUrl(analyticsData.shortId)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(analyticsData.shortId)}
                        className="flex items-center gap-1 px-3 py-1 bg-[#1e2024] text-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        {copiedId === analyticsData.shortId ? <Check className="w-3 h-3 text-amber-300" /> : <Copy className="w-3 h-3 text-amber-300" />}
                        <span>{copiedId === analyticsData.shortId ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Original URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">Destination URL</label>
                    <div className="flex items-center justify-between gap-2 bg-[#faf8f4] p-2.5 rounded-xl border border-[#ded8cb]">
                      <span className="text-xs font-mono text-zinc-700 truncate">
                        {analyticsData.originalUrl}
                      </span>
                      <a
                        href={analyticsData.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-[#ede7da] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-400 text-xs">
                  Select a link from the history list to inspect real click metrics.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!urlToDelete}
        title="Delete Short URL"
        message={`Are you sure you want to delete "${urlToDelete?.title || 'this link'}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setUrlToDelete(null)}
        isLoading={deleteLoading}
      />
    </div>
  );
}
