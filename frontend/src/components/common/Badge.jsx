import React from 'react';

const statusConfig = {
  UPCOMING: {
    bg: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
    dot: 'bg-sky-500',
    label: 'Upcoming',
  },
  DUE_SOON: {
    bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
    dot: 'bg-amber-500 animate-pulse',
    label: 'Due Soon',
  },
  DUE_TODAY: {
    bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/10',
    dot: 'bg-rose-500 animate-ping',
    label: 'Due Today',
  },
  EXPIRED: {
    bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    dot: 'bg-slate-400',
    label: 'Expired',
  },
  LOW: {
    bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    dot: 'bg-slate-400',
    label: 'Low',
  },
  MEDIUM: {
    bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    dot: 'bg-blue-500',
    label: 'Medium',
  },
  HIGH: {
    bg: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/25',
    dot: 'bg-orange-500',
    label: 'High',
  },
  URGENT: {
    bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold',
    dot: 'bg-rose-500 animate-pulse',
    label: 'Urgent',
  },
  admin: {
    bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 font-bold',
    dot: 'bg-purple-500',
    label: 'Admin',
  },
  user: {
    bg: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
    dot: 'bg-sky-500',
    label: 'User',
  },
  ACTIVE: {
    bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    dot: 'bg-emerald-500',
    label: 'Active',
  },
  INACTIVE: {
    bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    dot: 'bg-rose-500',
    label: 'Inactive',
  },
  REMINDER: {
    bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
    dot: 'bg-amber-500',
    label: 'Reminder',
  },
  SYSTEM: {
    bg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    dot: 'bg-indigo-500',
    label: 'System',
  },
};

export const Badge = ({ status, showDot = true, size = 'sm', className = '' }) => {
  const config = statusConfig[status] || {
    bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    dot: 'bg-slate-400',
    label: status ? status.replace('_', ' ') : 'Unknown',
  };

  const sizeClasses = size === 'xs' 
    ? 'px-1.5 py-0.5 text-[10px]' 
    : size === 'md' 
    ? 'px-3 py-1 text-xs' 
    : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.bg} ${sizeClasses} ${className} transition-all duration-150 select-none`}
    >
      {showDot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`inline-flex h-full w-full rounded-full ${config.dot}`} />
        </span>
      )}
      <span>{config.label || (status ? status.replace('_', ' ') : 'Unknown')}</span>
    </span>
  );
};
