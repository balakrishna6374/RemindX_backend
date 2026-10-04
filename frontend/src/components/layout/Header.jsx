import React, { useState } from 'react';
import { Menu, Play, Loader2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { ThemeToggle } from '../common/ThemeToggle';

export const Header = ({ onOpenMobileMenu, title, subtitle }) => {
  const [isTriggering, setIsTriggering] = useState(false);

  const handleManualTrigger = async () => {
    setIsTriggering(true);
    try {
      const res = await adminService.triggerReminders();
      alert(`Reminder Scan Executed: ${res.totalChecked} items checked (${res.remindersSent} reminders, ${res.dueTodaySent} due today, ${res.expiredSent} expired)`);
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">{title || 'CertiAlert Admin'}</h1>
          {subtitle && <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Engine Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Engine Online</span>
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Manual Cron Trigger */}
        <button
          onClick={handleManualTrigger}
          disabled={isTriggering}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-500/20 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isTriggering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 fill-sky-600 dark:fill-sky-400" />}
          <span>{isTriggering ? 'Running...' : 'Run Reminder Check'}</span>
        </button>
      </div>
    </header>
  );
};

