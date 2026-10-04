import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { Users, CalendarDays, AlertTriangle, Bell, RefreshCw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 rounded-xl">
        Error loading dashboard metrics: {error}
      </div>
    );
  }

  const { users, events, notifications, distributions, recent } = stats;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">System Dashboard Overview</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Live metrics directly calculated from MongoDB database</p>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Live Metrics
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Platform Users</span>
            <Users className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{users.totalUsers}</div>
          <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">{users.activeUsers} active accounts</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Expires Today</span>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-orange-600 dark:text-orange-400">{events.dueToday}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{events.dueSoonEvents} due soon (≤ 3 days)</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Tracked Certificates</span>
            <CalendarDays className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{events.totalEvents}</div>
          <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">{events.upcomingEvents} upcoming events</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Notifications Logged</span>
            <Bell className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{notifications.totalNotifications}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{notifications.unreadNotifications} pending / unread</div>
        </div>
      </div>

      {/* Category and Priority Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Certificates by Category
          </h3>
          <div className="space-y-2.5">
            {Object.entries(distributions.byCategory || {}).map(([cat, count]) => (
              <div key={cat} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{cat}</span>
                <span className="font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{count}</span>
              </div>
            ))}
            {Object.keys(distributions.byCategory || {}).length === 0 && (
              <p className="text-xs text-slate-400 py-2">No category data recorded.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Certificates by Priority
          </h3>
          <div className="space-y-2.5">
            {Object.entries(distributions.byPriority || {}).map(([pri, count]) => (
              <div key={pri} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{pri}</span>
                <span className="font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{count}</span>
              </div>
            ))}
            {Object.keys(distributions.byPriority || {}).length === 0 && (
              <p className="text-xs text-slate-400 py-2">No priority data recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Certificates Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recent Tracked Certificates & Expirations
          </h3>
          <Link
            to="/events"
            className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-500 font-semibold flex items-center gap-1 transition-colors"
          >
            View All Documents <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {recent.events && recent.events.length > 0 ? (
            recent.events.map((ev) => (
              <div key={ev._id} className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white text-xs">{ev.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Category: <span className="font-medium text-slate-700 dark:text-slate-300">{ev.category}</span> • Owner: <span className="font-medium text-slate-700 dark:text-slate-300">{ev.userId?.name || 'User'}</span> ({ev.userId?.email || 'N/A'})
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:text-right">
                  <Badge status={ev.status} />
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {new Date(ev.eventDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">No recent events found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

