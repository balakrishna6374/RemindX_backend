import React, { useState } from 'react';
import { Menu, Play, Loader2, CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { ThemeToggle } from '../common/ThemeToggle';

export const Header = ({ onOpenMobileMenu, title, subtitle }) => {
  const [isTriggering, setIsTriggering] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  const handleManualTrigger = async () => {
    setIsTriggering(true);
    setScanResult(null);
    setScanError(null);
    try {
      const res = await adminService.triggerReminders();
      setScanResult(res);
      setTimeout(() => setScanResult(null), 6000);
    } catch (err) {
      setScanError(err.message || 'Scan trigger failed');
      setTimeout(() => setScanError(null), 6000);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#0B0F19]/85 backdrop-blur-xl px-3 sm:px-6 lg:px-8 transition-colors duration-200 w-full max-w-full">
        
        {/* Left: Mobile Toggle & Page Headings */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">
              {title || 'Admin'}
            </h1>
            {subtitle && (
              <p className="hidden sm:block text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Status Badges & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Live Engine Status Pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Engine Active</span>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Manual Reminder Scan Action */}
          <button
            onClick={handleManualTrigger}
            disabled={isTriggering}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 rounded-xl disabled:opacity-50 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {isTriggering ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-sky-500 text-sky-500" />
            )}
            <span className="hidden sm:inline">{isTriggering ? 'Scanning DB...' : 'Scan Expirations'}</span>
            <span className="sm:hidden">{isTriggering ? '...' : 'Scan'}</span>
          </button>
        </div>
      </header>

      {/* Floating Scan Toast Banner */}
      {scanResult && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full bg-slate-900/95 text-white border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-fade-in flex items-start gap-3">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-sm text-white">Expiration Scan Complete</div>
            <div className="mt-1 text-slate-300">
              Scanned <span className="font-bold text-white">{scanResult.totalChecked} items</span> across all users.
            </div>
            <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] font-semibold">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {scanResult.remindersSent} Reminders
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {scanResult.dueTodaySent} Due Today
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-300">
                {scanResult.expiredSent} Expired
              </span>
            </div>
          </div>
        </div>
      )}

      {scanError && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full bg-rose-950/95 text-rose-200 border border-rose-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <div className="text-xs">{scanError}</div>
        </div>
      )}
    </>
  );
};

export default Header;
