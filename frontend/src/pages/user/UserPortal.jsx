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
  Clock, AlertTriangle, CheckCircle2, Trash2, Edit3, Loader2,
  Sparkles, RefreshCw, X, FileText, ArrowUpDown, ChevronRight,
  Inbox, CheckCheck, Award, Layers, Shield, Send, Smartphone,
  Zap, BellRing, Radio, Check
} from 'lucide-react';
import { TelegramAlertsCard } from '../../components/common/TelegramAlertsCard';

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
  const [notifSettings, setNotifSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('expiry-asc');

  // Dispatch and scan states
  const [dispatchingId, setDispatchingId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [bannerFeedback, setBannerFeedback] = useState({ text: '', type: '' });

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isTelegramOpen, setIsTelegramOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  // Form inputs state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    category: 'GOVERNMENT',
    priority: 'HIGH',
    autoNotify: true,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, summaryRes, notifsRes, unreadRes, settingsRes] = await Promise.all([
        userService.getEvents({
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
        }),
        userService.getEventSummary(),
        userService.getNotifications({ limit: 20 }),
        userService.getUnreadNotificationsCount(),
        userService.getNotificationSettings().catch(() => null),
      ]);
      setEvents(eventsRes.data || []);
      setSummary(summaryRes);
      setNotifications(notifsRes || []);
      setUnreadNotifsCount(unreadRes?.unreadCount || 0);
      if (settingsRes?.data) setNotifSettings(settingsRes.data);
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
      autoNotify: true,
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
      autoNotify: ev.autoNotify !== false,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleQuickPresetDate = (monthsToAdd) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsToAdd);
    setFormData((prev) => ({
      ...prev,
      eventDate: d.toISOString().split('T')[0],
    }));
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

  // Manual 1-click notification dispatch for a single document
  const handleDispatchSingle = async (ev) => {
    setDispatchingId(ev._id);
    setBannerFeedback({ text: '', type: '' });
    try {
      const res = await userService.dispatchManualAlert(ev._id);
      setBannerFeedback({
        text: `⚡ Manual alert dispatched for "${ev.title}" to your Telegram and Email!`,
        type: 'success',
      });
      // Refresh unread notifications
      const notifsRes = await userService.getNotifications({ limit: 20 });
      const unreadRes = await userService.getUnreadNotificationsCount();
      setNotifications(notifsRes || []);
      setUnreadNotifsCount(unreadRes?.unreadCount || 0);
    } catch (err) {
      setBannerFeedback({
        text: err.response?.data?.message || err.message || `Failed to dispatch alert for "${ev.title}".`,
        type: 'error',
      });
    } finally {
      setDispatchingId(null);
    }
  };

  // Manual Batch Scan for all due documents
  const handleManualScanAll = async () => {
    setIsScanning(true);
    setBannerFeedback({ text: '', type: '' });
    try {
      const res = await userService.triggerManualScan();
      const s = res.data || {};
      const sentCount = (s.remindersSent || 0) + (s.dueTodaySent || 0) + (s.expiredSent || 0);
      setBannerFeedback({
        text: `⚡ Manual scan cycle finished: Checked ${s.totalChecked || 0} document(s). Dispatched ${sentCount} live notification alert(s)!`,
        type: 'success',
      });
      fetchData();
    } catch (err) {
      setBannerFeedback({
        text: err.response?.data?.message || err.message || 'Manual scan failed.',
        type: 'error',
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Toggle Automated Daily Reminders (Auto-Cron)
  const handleToggleAutoReminders = async () => {
    const nextVal = !(notifSettings?.autoRemindersEnabled ?? true);
    try {
      const res = await userService.updateNotificationSettings({ autoRemindersEnabled: nextVal });
      setNotifSettings((prev) => ({ ...prev, autoRemindersEnabled: nextVal }));
      setBannerFeedback({
        text: `Automated daily reminder schedule is now ${nextVal ? 'ACTIVATED (08:00 AM Daily)' : 'PAUSED'}.`,
        type: 'info',
      });
    } catch (err) {
      alert(err.message || 'Failed to update settings');
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
      const notifsRes = await userService.getNotifications({ limit: 20 });
      setNotifications(notifsRes || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Sort events
  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy === 'expiry-asc') {
      return (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0);
    }
    if (sortBy === 'expiry-desc') {
      return (b.daysRemaining ?? 0) - (a.daysRemaining ?? 0);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'priority') {
      const pMap = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    }
    return 0;
  });

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Industrial Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/logo.png"
              alt="RemindX Logo"
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-xl shadow-md p-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <div className="font-black text-slate-900 dark:text-white text-sm sm:text-base leading-tight tracking-tight flex items-center gap-1.5 truncate">
                <span>RemindX</span>
                <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Vault
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                <span className="hidden sm:inline">Logged in as </span>
                <span className="font-bold text-sky-600 dark:text-sky-400">{user?.name || user?.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Telegram Alerts Trigger */}
            <button
              type="button"
              onClick={() => setIsTelegramOpen(true)}
              className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200 dark:border-sky-500/30 transition-all cursor-pointer shadow-sm"
              title="Configure Telegram Alerts"
            >
              <Send className="h-4 w-4 sm:h-3.5 sm:w-3.5 -rotate-12" />
              <span className="hidden sm:inline">Telegram</span>
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setIsNotifsOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
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
              className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl border border-rose-200/60 dark:border-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-6 space-y-6 overflow-hidden">
        
        {/* Banner Feedback Alert */}
        {bannerFeedback.text && (
          <div
            className={`flex items-center justify-between gap-3 p-4 rounded-2xl border text-xs font-semibold shadow-sm transition-all ${
              bannerFeedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : bannerFeedback.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
                : 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30 text-sky-800 dark:text-sky-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {bannerFeedback.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : bannerFeedback.type === 'error' ? (
                <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : (
                <Zap className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
              )}
              <span>{bannerFeedback.text}</span>
            </div>
            <button
              onClick={() => setBannerFeedback({ text: '', type: '' })}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Welcome & Quick Action Hero */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white p-6 sm:p-7 rounded-2xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-bold text-sky-100 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" /> Certificate & Document Lifecycle Suite
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Member'}!
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/80 max-w-xl">
              Track deadlines, monitor compliance renewals, and receive timely multi-channel reminder dispatches.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-md hover:bg-sky-50 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 text-sky-600" /> Track New Document
            </button>
          </div>
        </div>

        {/* Notification Dispatch & Automation Control Center */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Automatic Mode Status */}
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                notifSettings?.autoRemindersEnabled !== false
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                <Radio className={`h-5 w-5 ${notifSettings?.autoRemindersEnabled !== false ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Automated Expiry Dispatch
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    notifSettings?.autoRemindersEnabled !== false
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {notifSettings?.autoRemindersEnabled !== false ? 'Active (08:00 AM Daily)' : 'Paused'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Sends automated Telegram & Email alerts 24h before expiry and on the due date.
                </p>
              </div>
            </div>

            {/* Actions: Toggle Automation & Manual Scan Button */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleToggleAutoReminders}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  notifSettings?.autoRemindersEnabled !== false
                    ? 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    : 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                }`}
              >
                {notifSettings?.autoRemindersEnabled !== false ? 'Pause Auto-Cron' : 'Resume Auto-Cron'}
              </button>

              <button
                type="button"
                onClick={handleManualScanAll}
                disabled={isScanning}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isScanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 fill-current" />}
                <span>{isScanning ? 'Scanning & Dispatching...' : 'Run Manual Dispatch Scan'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Portfolio</div>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{summary?.total ?? events.length}</div>
              <div className="text-[10px] text-slate-400">Registered records</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200/60 dark:border-rose-500/20 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Expires Today</div>
              <div className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">{summary?.dueToday ?? 0}</div>
              <div className="text-[10px] text-rose-500/80 font-semibold">Immediate attention</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200/60 dark:border-amber-500/20 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Due Soon (≤ 3d)</div>
              <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{summary?.dueSoon ?? 0}</div>
              <div className="text-[10px] text-slate-400">Upcoming renewals</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Expired Items</div>
              <div className="mt-1 text-2xl font-black text-slate-500 dark:text-slate-400">{summary?.expired ?? 0}</div>
              <div className="text-[10px] text-slate-400">Past target date</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search certificates, policy numbers, or document names..."
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 sm:flex-none rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                <option value="expiry-asc">Expiry: Closest First</option>
                <option value="expiry-desc">Expiry: Furthest First</option>
                <option value="priority">Priority: Highest First</option>
                <option value="title">Title: A to Z</option>
              </select>

              <button
                onClick={fetchData}
                title="Refresh Documents"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Filter Status Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Status:</span>
            {[
              { label: 'All Items', value: '' },
              { label: 'Due Today', value: 'DUE_TODAY' },
              { label: 'Due Soon', value: 'DUE_SOON' },
              { label: 'Upcoming', value: 'UPCOMING' },
              { label: 'Expired', value: 'EXPIRED' },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.value
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Certificates Grid Layout */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        ) : sortedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedEvents.map((ev) => {
              const daysRemaining = ev.daysRemaining ?? 0;
              let daysText = '';
              let badgeColor = '';
              if (ev.status === 'DUE_TODAY') {
                daysText = 'Expires Today!';
                badgeColor = 'text-rose-600 dark:text-rose-400 font-black';
              } else if (daysRemaining === 1) {
                daysText = 'Expires Tomorrow';
                badgeColor = 'text-amber-600 dark:text-amber-400 font-bold';
              } else if (daysRemaining > 1) {
                daysText = `${daysRemaining} days remaining`;
                badgeColor = daysRemaining <= 7 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-600 dark:text-slate-300 font-semibold';
              } else {
                daysText = `Expired ${Math.abs(daysRemaining)} days ago`;
                badgeColor = 'text-slate-400';
              }

              const isDispatching = dispatchingId === ev._id;

              return (
                <div
                  key={ev._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-sky-500/30 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-50 dark:bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-200/60 dark:border-sky-500/20">
                        {ev.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge status={ev.status} />
                        <Badge status={ev.priority} />
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {ev.title}
                    </h3>

                    {ev.description && (
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>
                    )}

                    {/* Auto-Alert status tag */}
                    <div className="mt-2.5 flex items-center gap-2 text-[10px]">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold ${
                        ev.autoNotify !== false
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        <Radio className="h-2.5 w-2.5" />
                        {ev.autoNotify !== false ? 'Auto-Alerts ON' : 'Auto-Alerts OFF'}
                      </span>
                      {ev.lastManualDispatchedAt && (
                        <span className="text-slate-400">
                          Last sent: {new Date(ev.lastManualDispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {new Date(ev.eventDate).toLocaleDateString()}
                        </div>
                        <div className={`text-[11px] ${badgeColor}`}>{daysText}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Manual Dispatch Button */}
                      <button
                        type="button"
                        onClick={() => handleDispatchSingle(ev)}
                        disabled={isDispatching}
                        title="Send instant notification to Telegram & Email right now"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        {isDispatching ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Zap className="h-3 w-3 fill-current text-sky-500" />
                        )}
                        <span>{isDispatching ? 'Sending...' : 'Send Alert'}</span>
                      </button>

                      <button
                        onClick={() => openEditModal(ev)}
                        title="Edit Certificate"
                        className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEventToDelete(ev)}
                        title="Delete Certificate"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 mb-3">
              <FileText className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">No Tracked Items Found</h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You do not have any certificates or reminders matching your filters. Register a new document to get started.
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Track Document Now
            </button>
          </div>
        )}
      </main>

      {/* Add / Edit Certificate Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingEvent ? 'Edit Tracked Document' : 'Add New Document / Certificate'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Document / Certificate Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Driver's License, Passport, Vehicle Insurance, AWS Certification..."
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                {PRIORITIES.map((pri) => (
                  <option key={pri} value={pri}>{pri}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Target Expiry / Renewal Date *
              </label>
              {/* Quick Date Presets */}
              <div className="flex items-center gap-1 text-[10px]">
                <span className="text-slate-400">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDate(1)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-bold hover:bg-sky-50 cursor-pointer"
                >
                  +1M
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDate(6)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-bold hover:bg-sky-50 cursor-pointer"
                >
                  +6M
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDate(12)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-bold hover:bg-sky-50 cursor-pointer"
                >
                  +1Y
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDate(36)}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-bold hover:bg-sky-50 cursor-pointer"
                >
                  +3Y
                </button>
              </div>
            </div>
            <input
              type="date"
              required
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Description / Policy / Registration Notes
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Policy reference #, registration authority, login link or renewal instruction..."
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Automatic Expiry Alerts Toggle in Form */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-sky-500" />
                <span>Automatic Scheduled Alerts (Auto-Cron)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Automatically send Telegram & Email alerts 24h before expiry and on the due date.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.autoNotify}
                onChange={(e) => setFormData({ ...formData, autoNotify: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-sky-500"></div>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editingEvent ? 'Save Changes' : 'Save Document'}
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
            <span className="text-xs text-slate-500">Automated reminder triggers and renewal alerts</span>
            {unreadNotifsCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-bold cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n._id} className="py-3 flex items-start gap-3">
                  <div className="mt-0.5">
                    <Badge status={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                <Inbox className="h-6 w-6 mx-auto mb-1 text-slate-300 dark:text-slate-600" />
                No notifications logged yet.
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Telegram Alerts Config Modal */}
      <Modal
        isOpen={isTelegramOpen}
        onClose={() => setIsTelegramOpen(false)}
        title="Telegram Expiry Alerts"
      >
        <TelegramAlertsCard />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDeleteEvent}
        title="Delete Document"
        message={`Are you sure you want to permanently delete "${eventToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default UserPortal;
