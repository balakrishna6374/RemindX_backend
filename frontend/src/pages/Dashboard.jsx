import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import {
  Users, CalendarDays, AlertTriangle, Bell, RefreshCw, ArrowRight,
  TrendingUp, Clock, CheckCircle2, ShieldCheck, Flame, ChevronRight, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 rounded-3xl text-center space-y-3 max-w-lg mx-auto mt-12">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Error Loading Metrics</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-rose-500 cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { users, events, notifications, distributions, recent } = stats;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        
        {/* Card 1: Tracked Certificates */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Certificates
            </span>
            <div className="h-10 w-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {events.totalEvents}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{events.upcomingEvents} active & upcoming</span>
            </div>
          </div>
        </div>

        {/* Card 2: Due Today */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Expires Today
            </span>
            <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-2xl flex items-center justify-center font-bold ${events.dueToday > 0 ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${events.dueToday > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {events.dueToday}
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              {events.dueSoonEvents} expiring in ≤3d
            </div>
          </div>
        </div>

        {/* Card 3: Platform Users */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Registered Users
            </span>
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {users.totalUsers}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{users.activeUsers} active</span>
            </div>
          </div>
        </div>

        {/* Card 4: Automated Alerts */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Alerts Dispatched
            </span>
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Bell className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {notifications.totalNotifications}
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              {notifications.unreadNotifications} unread in inbox
            </div>
          </div>
        </div>

      </div>

      {/* Distributions & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Category Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown of active certificates by compliance domain
              </p>
            </div>
            <Link
              to="/events"
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
            >
              Explore <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {Object.entries(distributions.byCategory || {}).map(([cat, count]) => {
              const total = events.totalEvents || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{cat}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono font-medium">
                      {count} items ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(distributions.byCategory || {}).length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">No category data recorded yet.</div>
            )}
          </div>
        </div>

        {/* Priority Urgency Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Priority Urgency
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Severity levels assigned to tracked records
            </p>

            <div className="space-y-3">
              {Object.entries(distributions.byPriority || {}).map(([pri, count]) => (
                <div
                  key={pri}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <Badge status={pri} size="xs" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{pri}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                    {count}
                  </span>
                </div>
              ))}
              {Object.keys(distributions.byPriority || {}).length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">No priority data.</div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Auto-escalation</span>
            <span className="font-bold text-emerald-500">Enabled</span>
          </div>
        </div>

      </div>

      {/* Recent Expiration Audit Trail */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Tracked Certificates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live audit stream of registered certificates and their target expiration timelines
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 shrink-0"
          >
            <span>View All Records</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {recent.events && recent.events.length > 0 ? (
            recent.events.map((ev) => (
              <div
                key={ev._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {ev.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{ev.category}</span>
                      <span>•</span>
                      <span>Owner: <strong className="text-slate-800 dark:text-slate-200">{ev.userId?.name || 'User'}</strong> ({ev.userId?.email || 'N/A'})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:text-right shrink-0">
                  <Badge status={ev.status} />
                  <div className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                    {new Date(ev.eventDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">No active events recorded.</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
