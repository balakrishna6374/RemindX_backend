import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';
import {
  KeyRound, ShieldCheck, Lock, Eye, EyeOff, CheckCircle2,
  AlertCircle, Loader2, User, RefreshCw, Sparkles, Server,
  ShieldAlert, Check, Copy, Send
} from 'lucide-react';
import { TelegramAlertsCard } from '../components/common/TelegramAlertsCard';

export const Settings = () => {
  const { user, logout } = useAuth();

  // Admin Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Admin Profile Name State
  const [adminName, setAdminName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // User Password Reset by Admin State
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userNewPassword, setUserNewPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [isResettingUserPass, setIsResettingUserPass] = useState(false);
  const [userResetSuccess, setUserResetSuccess] = useState('');
  const [userResetError, setUserResetError] = useState('');
  const [copiedPass, setCopiedPass] = useState(false);

  useEffect(() => {
    fetchUsersList();
  }, []);

  const fetchUsersList = async () => {
    try {
      const res = await adminService.getUsers({ limit: 100 });
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch user list:', err);
    }
  };

  // 1. Handle Admin Password Update
  const handleUpdateAdminPassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await authService.updateProfile({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess('Admin password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // 2. Handle Admin Profile Name Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!adminName.trim()) {
      setProfileError('Display name cannot be empty.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await authService.updateProfile({ name: adminName.trim() });
      setProfileSuccess('Profile display name updated successfully!');
      const updatedUser = { ...user, name: adminName.trim() };
      localStorage.setItem('remindx_user', JSON.stringify(updatedUser));
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile name.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // 3. Handle Admin Resetting Another User's Password
  const handleResetUserPassword = async (e) => {
    e.preventDefault();
    setUserResetSuccess('');
    setUserResetError('');

    if (!selectedUserId) {
      setUserResetError('Please select a user account to reset password.');
      return;
    }

    if (!userNewPassword || userNewPassword.length < 6) {
      setUserResetError('Password must be at least 6 characters long.');
      return;
    }

    setIsResettingUserPass(true);
    try {
      const targetUser = users.find((u) => u._id === selectedUserId);
      await adminService.updateUser(selectedUserId, { password: userNewPassword });
      setUserResetSuccess(`Password for ${targetUser?.name || targetUser?.email} reset successfully!`);
    } catch (err) {
      setUserResetError(err.message || 'Failed to reset user password.');
    } finally {
      setIsResettingUserPass(false);
    }
  };

  // Helper: Generate Random Strong Password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUserNewPassword(result);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          System & Security Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage administrator credentials, change passwords, and configure account security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Admin Profile & Security Cards (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Admin Password Reset */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm transition-colors">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Reset Administrator Password
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update your personal admin account password with immediate security verification.
                </p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="mt-4 flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mt-4 flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateAdminPassword} className="mt-6 space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing admin password"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-11 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm Password in 2 Cols on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-11 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-11 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  <span>{isUpdatingPassword ? 'Updating Password...' : 'Save New Password'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: User Password Reset by Admin */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm transition-colors">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Reset Any User's Password
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Administrator authority to force-reset login passwords for registered accounts.
                </p>
              </div>
            </div>

            {userResetSuccess && (
              <div className="mt-4 flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{userResetSuccess}</span>
              </div>
            )}

            {userResetError && (
              <div className="mt-4 flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{userResetError}</span>
              </div>
            )}

            <form onSubmit={handleResetUserPassword} className="mt-6 space-y-5">
              {/* Select User */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Select User Account
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                >
                  <option value="">-- Choose a user account --</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) — [{u.role.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>

              {/* New Password & Generator */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Assign New Password
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" /> Generate Random
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showUserPassword ? 'text' : 'password'}
                    required
                    value={userNewPassword}
                    onChange={(e) => setUserNewPassword(e.target.value)}
                    placeholder="Enter or generate temporary password"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-24 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
                    {userNewPassword && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(userNewPassword)}
                        title="Copy Password"
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {copiedPass ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowUserPassword(!showUserPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showUserPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isResettingUserPass || !selectedUserId}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isResettingUserPass ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                  <span>{isResettingUserPass ? 'Resetting Password...' : 'Force Reset User Password'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 3: Telegram Bot Dispatcher Integration */}
          <TelegramAlertsCard />

        </div>

        {/* Right Column: Profile Info & System Badges (1 Col) */}
        <div className="space-y-8">
          
          {/* Admin Profile Overview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
              <img
                src="/logo.png"
                alt="RemindX"
                className="h-10 w-10 object-contain rounded-xl shadow-md p-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admin Profile</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
            </div>

            {profileSuccess && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Assigned Role
                </label>
                <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                  {user?.role || 'ADMIN'}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {isUpdatingProfile ? 'Saving...' : 'Update Display Name'}
              </button>
            </form>
          </div>

          {/* System & Engine Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <Server className="h-4 w-4 text-sky-500" />
              <span>RemindX Engine Status</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Database Engine</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> MongoDB Atlas
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Cron Scheduler</span>
                <span className="font-semibold text-sky-600 dark:text-sky-400">08:00 AM Daily</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Auth Token Validity</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">7 Days (JWT)</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 dark:text-slate-400">Version</span>
                <span className="font-bold text-slate-900 dark:text-white">v1.0.0</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
