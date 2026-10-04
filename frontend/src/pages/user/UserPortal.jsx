import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Skeleton } from '../../components/common/Skeleton';
import {
  ShieldCheck, Plus, Calendar, Bell, LogOut, Search, Filter,
  Clock, AlertTriangle, CheckCircle2, Trash2, Edit3, Loader2, Sparkles, RefreshCw, X
} from 'lucide-react';

const CATEGORIES = [
  'GOVERNMENT', 'LICENSE', 'DOCUMENT', 'INSURANCE', 'SUBSCRIPTION',
  'FINANCIAL', 'VEHICLE', 'HEALTH', 'EDUCATION', 'APPOINTMENT', 'WARRANTY', 'OTHER'
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const UserPortal = () => {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  // Form inputs state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    category: 'GOVERNMENT',
    priority: 'HIGH',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, summaryRes, notifsRes, unreadRes] = await Promise.all([
        userService.getEvents({
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
        }),
        userService.getEventSummary(),
        userService.getNotifications({ limit: 15 }),
        userService.getUnreadNotificationsCount(),
      ]);
      setEvents(eventsRes.data || []);
      setSummary(summaryRes);
      setNotifications(notifsRes || []);
      setUnreadNotifsCount(unreadRes?.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, categoryFilter]);

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      eventDate: new Date().toISOString().split('T')[0],
      category: 'GOVERNMENT',
      priority: 'HIGH',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (ev) => {
    setEditingEvent(ev);
    const dateStr = ev.eventDate ? new Date(ev.eventDate).toISOString().split('T')[0] : '';
    setFormData({
      title: ev.title,
      description: ev.description || '',
      eventDate: dateStr,
      category: ev.category || 'OTHER',
      priority: ev.priority || 'MEDIUM',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.eventDate) {
      setFormError('Please provide a certificate title and target expiry date.');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingEvent) {
        await userService.updateEvent(editingEvent._id, formData);
      } else {
        await userService.createEvent(formData);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to save certificate data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      await userService.deleteEvent(eventToDelete._id);
      setEventToDelete(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await userService.markAllNotificationsRead();
      setUnreadNotifsCount(0);
      const notifsRes = await userService.getNotifications({ limit: 15 });
      setNotifications(notifsRes || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Mobile-Friendly Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/25">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">CertiAlert</div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Welcome, <span className="font-bold text-sky-600 dark:text-sky-400">{user?.name || 'User'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setIsNotifsOpen(true)}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Logout */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Tracked</div>
            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{summary?.total ?? events.length}</div>
            <div className="mt-0.5 text-[11px] text-slate-400">Certificates & items</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Expires Today</div>
            <div className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">{summary?.dueToday ?? 0}</div>
            <div className="mt-0.5 text-[11px] text-rose-500/80 font-medium">Action required</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Due Soon (≤ 3d)</div>
            <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{summary?.dueSoon ?? 0}</div>
            <div className="mt-0.5 text-[11px] text-slate-400">Upcoming renewals</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Expired</div>
            <div className="mt-1 text-2xl font-black text-slate-500 dark:text-slate-400">{summary?.expired ?? 0}</div>
            <div className="mt-0.5 text-[11px] text-slate-400">Passed deadline</div>
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your certificates, licenses, policies..."
                className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add New Document
            </button>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Status:</span>
            {[
              { label: 'All', value: '' },
              { label: 'Due Today', value: 'DUE_TODAY' },
              { label: 'Due Soon', value: 'DUE_SOON' },
              { label: 'Upcoming', value: 'UPCOMING' },
              { label: 'Expired', value: 'EXPIRED' },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === tab.value
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={fetchData}
                title="Refresh"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Certificates List / Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => {
              const daysRemaining = ev.daysRemaining;
              let daysText = '';
              if (ev.status === 'DUE_TODAY') daysText = 'Expires Today!';
              else if (daysRemaining === 1) daysText = 'Expires Tomorrow';
              else if (daysRemaining > 1) daysText = `Expires in ${daysRemaining} days`;
              else if (daysRemaining < 0) daysText = `Expired ${Math.abs(daysRemaining)} days ago`;

              return (
                <div
                  key={ev._id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                        {ev.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge status={ev.status} />
                        <Badge status={ev.priority} />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {ev.title}
                    </h3>

                    {ev.description && (
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {ev.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <div>
                        <div className="font-semibold">{new Date(ev.eventDate).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400">{daysText}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(ev)}
                        title="Edit Certificate"
                        className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEventToDelete(ev)}
                        title="Delete Certificate"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 mb-3">
              <Calendar className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">No Certificates or Reminders Found</h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You don't have any tracked items matching your search. Click below to add your first document or certificate.
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Document Now
            </button>
          </div>
        )}
      </main>

      {/* Add / Edit Certificate Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingEvent ? 'Edit Tracked Document' : 'Add New Certificate / Reminder'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Document / Certificate Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Income Certificate, Driving License, Passport..."
              className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                {PRIORITIES.map((pri) => (
                  <option key={pri} value={pri}>{pri}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Target Expiry / Renewal Date *
            </label>
            <input
              type="date"
              required
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Policy / Application Notes
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Renewal reference ID, verification link or additional notes..."
              className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editingEvent ? 'Save Changes' : 'Save Certificate'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Notifications Drawer / Modal */}
      <Modal
        isOpen={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
        title="Your Reminder Notifications"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">Scheduled reminders and alerts</span>
            {unreadNotifsCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n._id} className="py-3 flex items-start gap-3">
                  <div className="mt-1">
                    <Badge status={n.type} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">No notifications yet.</div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDeleteEvent}
        title="Delete Document"
        message={`Are you sure you want to permanently delete "${eventToDelete?.title}"?`}
      />
    </div>
  );
};
