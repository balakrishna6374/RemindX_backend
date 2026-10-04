import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { Badge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TableSkeleton } from '../components/common/Skeleton';
import { Search, Trash2, RefreshCw, Filter, User, X } from 'lucide-react';

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

  // Synchronize state when URL query changes
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

  const deleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      await adminService.deleteEvent(eventToDelete._id);
      setEventToDelete(null);
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const activeUserObj = usersList.find((u) => u._id === selectedUserId);

  return (
    <div className="space-y-4">
      {/* Active User Filter Banner */}
      {selectedUserId && activeUserObj && (
        <div className="flex items-center justify-between p-3.5 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 rounded-xl text-xs text-sky-800 dark:text-sky-300">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>
              Filtering events for: <strong className="font-bold">{activeUserObj.name}</strong> ({activeUserObj.email})
            </span>
          </div>
          <button
            onClick={() => handleUserFilterChange('')}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-300 hover:underline cursor-pointer"
          >
            <X className="h-3.5 w-3.5" /> Clear Filter
          </button>
        </div>
      )}

      {/* Controls & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between gap-3 transition-colors">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search certificates, documents, categories..."
              className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* User Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
              <select
                value={selectedUserId}
                onChange={(e) => handleUserFilterChange(e.target.value)}
                className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                <option value="">All Users</option>
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="DUE_SOON">Due Soon (≤ 3 Days)</option>
                <option value="DUE_TODAY">Due Today</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={fetchEvents}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Events Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Certificate / Event</th>
                  <th className="px-5 py-3.5">Document Owner</th>
                  <th className="px-5 py-3.5">Target Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {events.length > 0 ? (
                  events.map((ev) => (
                    <tr key={ev._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{ev.title}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                          {ev.category} • <span className="italic">{ev.description || 'No notes'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => ev.userId?._id && handleUserFilterChange(ev.userId._id)}
                          className="text-left group cursor-pointer"
                          title="Click to filter by this user"
                        >
                          <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                            {ev.userId?.name || 'User'}
                          </div>
                          <div className="text-[11px] text-slate-400 group-hover:underline">
                            {ev.userId?.email || 'N/A'}
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                        <div>{new Date(ev.eventDate).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400">
                          {ev.daysRemaining === 0
                            ? 'Today'
                            : ev.daysRemaining > 0
                            ? `in ${ev.daysRemaining}d`
                            : `${Math.abs(ev.daysRemaining)}d ago`}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge status={ev.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge status={ev.priority} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setEventToDelete(ev)}
                          title="Delete certificate"
                          className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                      No matching events or certificates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={deleteEvent}
        title="Delete Tracked Document"
        message={`Are you sure you want to permanently delete "${eventToDelete?.title}"?`}
      />
    </div>
  );
};
