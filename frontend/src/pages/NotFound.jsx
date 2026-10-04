import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle showLabel />
      </div>
      <div className="text-center max-w-md">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">404</h1>
        <p className="mt-2 text-base font-semibold text-slate-700 dark:text-slate-300">Page Not Found</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          The administration route you requested does not exist or has been relocated.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

