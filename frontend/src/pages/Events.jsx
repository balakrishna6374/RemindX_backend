import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { Badge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TableSkeleton } from '../components/common/Skeleton';
import {
  Search, Trash2, RefreshCw, Filter, User, X,
  CalendarDays, FileText, CheckCircle2, Clock, Flame,
  LayoutGrid, List, AlertTriangle, Zap, Loader2, Send
} from 'lucide-react';

const STATUS_TABS = [
  { label: 'All Documents', value: '' },
  { label: 'Due Today', value: 'DUE_TODAY' },
  { label: 'Due Soon', value: 'DUE_SOON' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Expired', value: 'EXPIRED' },
];

export const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId') || '';

  const [events, setEvents] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(userIdParam);
  const [isLoading, setIsLoading] = useState(true);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  
  // Manual dispatch states
  const [dispatchingId, setDispatchingId] = useState(null);
  const [isBatchScanning, setIsBatchScanning] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  useEffect(() => {
    setSelectedUserId(userIdParam);
  }, [userIdParam]);

  const fetchUsersList = async () => {
    try {
      const res = await adminService.getUsers({ limit: 100 });
      setUsersList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getEvents({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        userId: selectedUserId || undefined,
      });
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [search, statusFilter, selectedUserId]);

  const handleUserFilterChange = (uid) => {
    setSelectedUserId(uid);
    if (uid) {
      setSearchParams({ userId: uid });
    } else {
      setSearchParams({});
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await adminService.deleteEvent(eventToDelete._id);
      setEvents((prev) => prev.filter((e) => e._id !== eventToDelete._id));
      setEventToDelete(null);
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleManualDispatch = async (ev) => {
    setDispatchingId(ev._id);
    setFeedback({ text: '', type: '' });
    try {
      await adminService.dispatchAlert(ev._id);
      setFeedback({
        text: `⚡ Live alert successfully dispatched for "${ev.title}" to recipient's Telegram & Email!`,
        type: 'success',
      });
    } catch (err) {
      setFeedback({
        text: err.response?.data?.message || err.message || `Failed to dispatch alert for "${ev.title}".`,
        type: 'error',
      });
    } finally {
      setDispatchingId(null);
    }
  };

  const handleRunBatchPipeline = async () => {
    setIsBatchScanning(true);
    setFeedback({ text: '', type: '' });
    try {
      const res = await adminService.triggerReminders();
      const s = res.data || {};
      const sentCount = (s.remindersSent || 0) + (s.dueTodaySent || 0) + (s.expiredSent || 0);
      setFeedback({
        text: `⚡ Batch Reminder Pipeline Completed: Scanned ${s.totalChecked || 0} documents. Dispatched ${sentCount} multi-channel notifications!`,
        type: 'success',
      });
      fetchEvents();
    } catch (err) {
      setFeedback({
        text: err.response?.data?.message || err.message || 'Batch reminder run failed.',
        type: 'error',
      });
    } finally {
      setIsBatchScanning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Event & Certificate Management
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            System-wide registry of active certificates, licenses, and manual/automatic dispatch schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Run Batch Pipeline Button */}
          <button
            type="button"
            onClick={handleRunBatchPipeline}
            disabled={isBatchScanning}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isBatchScanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 fill-current" />}
            <span>{isBatchScanning ? 'Running Pipeline...' : 'Run Batch Dispatch'}</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={fetchEvents}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.text && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-2xl border text-xs font-semibold shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback({ text: '', type: '' })}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter Control Center */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.label}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                    : 'bg-slate-100 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & User Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search Box */}
          <div className="sm:col-span-2 relative">
            <Search className="absolute inset-y-0 left-0 pl-3.5 my-auto h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by certificate title or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            />
          </div>

          {/* User Select Filter */}
          <div className="relative">
            <select
              value={selectedUserId}
              onChange={(e) => handleUserFilterChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">All User Accounts</option>
              {usersList.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            {selectedUserId && (
              <button
                onClick={() => handleUserFilterChange('')}
                className="absolute inset-y-0 right-2 my-auto p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
          <TableSkeleton rows={6} cols={5} />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center space-y-3">
          <CalendarDays className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Matching Certificates Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms, status filter, or clearing the selected user account.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden w-full max-w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-3.5 px-6">Certificate & Category</th>
                  <th className="py-3.5 px-6">Account Owner</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Target Expiry</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {events.map((ev) => (
                  <tr
                    key={ev._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {ev.title}
                          </div>
                          <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                            {ev.category}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">
                      <div>{ev.userId?.name || 'Unknown User'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{ev.userId?.email || 'N/A'}</div>
                    </td>

                    <td className="py-4 px-6">
                      <Badge status={ev.priority} size="xs" />
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-700 dark:text-slate-300">
                      {new Date(ev.eventDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="py-4 px-6">
                      <Badge status={ev.status} />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleManualDispatch(ev)}
                          disabled={dispatchingId === ev._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                          title="Manually dispatch notification to Telegram & Email"
                        >
                          {dispatchingId === ev._id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Zap className="h-3 w-3 fill-current text-sky-500" />
                          )}
                          <span>{dispatchingId === ev._id ? 'Sending...' : 'Dispatch'}</span>
                        </button>

                        <button
                          onClick={() => setEventToDelete(ev)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="h-10 w-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Badge status={ev.status} />
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {ev.description || 'No additional description provided.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Target Deadline</div>
                  <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(ev.eventDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleManualDispatch(ev)}
                    disabled={dispatchingId === ev._id}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {dispatchingId === ev._id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Zap className="h-3 w-3 fill-current text-sky-500" />
                    )}
                    <span>{dispatchingId === ev._id ? 'Sending...' : 'Dispatch'}</span>
                  </button>

                  <button
                    onClick={() => setEventToDelete(ev)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!eventToDelete}
        title="Remove Tracked Document?"
        message={`Are you sure you want to delete "${eventToDelete?.title}"? This record and associated reminder logs will be permanently removed.`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleDeleteEvent}
        onCancel={() => setEventToDelete(null)}
      />

    </div>
  );
};

export default Events;
