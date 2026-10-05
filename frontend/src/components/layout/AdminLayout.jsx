import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles = {
  '/dashboard': { title: 'Dashboard Overview', subtitle: 'Real-time metrics, active documents, and system performance' },
  '/users': { title: 'User Management', subtitle: 'Manage platform accounts, security status, and event ownership' },
  '/events': { title: 'Event Management', subtitle: 'System-wide certificates, renewals, and expiration timeline' },
  '/notifications': { title: 'Notification Logs', subtitle: 'Audit trail of in-app and email reminder transmissions' },
  '/settings': { title: 'System & Security Settings', subtitle: 'Manage administrator credentials, reset passwords, and system security' },
};

export const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const meta = pageTitles[location.pathname] || { title: 'RemindX Administration' };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden lg:pl-64">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

