import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, Bell, Settings as SettingsIcon,
  LogOut, Shield, X, ChevronRight, UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'User Management', href: '/users', icon: Users },
  { name: 'Event Management', href: '/events', icon: CalendarDays },
  { name: 'Notification Logs', href: '/notifications', icon: Bell },
  { name: 'System Settings', href: '/settings', icon: SettingsIcon },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B0F19] text-slate-800 dark:text-slate-200 border-r border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="RemindX"
            className="h-9 w-9 object-contain rounded-xl shadow-md p-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          />
          <div>
            <div className="font-black text-slate-900 dark:text-white text-base leading-none tracking-tight">
              Remind<span className="text-sky-500">X</span>
            </div>
            <div className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mt-1">
              Admin Suite
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3.5 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Core Operations
        </div>
        
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative ${
                  isActive
                    ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-sky-500 shadow-glow-sky" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2.5 overflow-hidden mr-2">
          <div className="h-8 w-8 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold text-xs shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user?.name || 'Admin'}
            </div>
            <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
              {user?.email}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Log out of session"
          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer shrink-0"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-30">
        {navContent}
      </aside>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 shadow-2xl animate-slide-in">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
