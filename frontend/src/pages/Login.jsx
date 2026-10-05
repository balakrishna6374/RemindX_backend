import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import {
  Lock, Mail, Eye, EyeOff, AlertCircle, Loader2,
  ShieldCheck, Bell, Sparkles, CheckCircle2, ArrowRight, User
} from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin@123');
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'user'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePersonaSelect = (role) => {
    setActiveTab(role);
    setError('');
    if (role === 'admin') {
      setEmail('admin@gmail.com');
      setPassword('admin@123');
    } else {
      setEmail('bala@gmail.com');
      setPassword('Bala@123456');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/portal', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid login credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-200 mesh-gradient-bg relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
        <ThemeToggle showLabel />
      </div>

      <div className="w-full max-w-md z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3.5 group">
            <img
              src="/logo.png"
              alt="RemindX"
              className="h-20 w-20 object-contain rounded-2xl shadow-xl shadow-sky-500/20 bg-white dark:bg-slate-900 p-1.5 border border-slate-200/80 dark:border-slate-800 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Remind<span className="text-sky-500">X</span>
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Smart Expiry & Reminder Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all">
          
          {/* Quick Persona Selector */}
          <div className="flex p-1 mb-6 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handlePersonaSelect('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Admin Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handlePersonaSelect('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'user'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <User className="h-4 w-4" />
              <span>User Portal</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {activeTab === 'admin' ? 'Administrator Email' : 'Account Email'}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'admin' ? 'admin@gmail.com' : 'bala@gmail.com'}
                  className="block w-full rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="block w-full rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 pl-10 pr-11 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 transition-all cursor-pointer mt-3 group"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In to {activeTab === 'admin' ? 'Admin Portal' : 'User Portal'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Engine v1.0 Live
            </span>
            <button
              type="button"
              onClick={() => handlePersonaSelect(activeTab)}
              className="text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer"
            >
              Fill Default {activeTab === 'admin' ? 'Admin' : 'User'}
            </button>
          </div>

        </div>

        {/* Security Trust Footnote */}
        <div className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          <span>256-Bit Encrypted Session Authentication</span>
        </div>

      </div>
    </div>
  );
};

export default Login;
