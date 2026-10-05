import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TableSkeleton } from '../components/common/Skeleton';
import { useNavigate } from 'react-router-dom';
import {
  Search, UserCheck, UserX, Trash2, RefreshCw, Shield, User as UserIcon,
  Calendar, ArrowRight, Clock, AlertCircle, FileText, KeyRound, Sparkles,
  Copy, Check, Users as UsersGroup, CheckCircle2, XCircle
} from 'lucide-react';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUserForEvents, setSelectedUserForEvents] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false);

  // Quick Password Reset Modal
  const [resetModalUser, setResetModalUser] = useState(null);
  const [quickNewPassword, setQuickNewPassword] = useState('');
  const [isResettingPass, setIsResettingPass] = useState(false);
  const [resetMessage, setResetMessage] = useState({ text: '', type: '' });
  const [copiedPass, setCopiedPass] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUsers({ search: search.trim() || undefined });
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const openUserEventsModal = async (u) => {
    setSelectedUserForEvents(u);
    setIsLoadingUserDetails(true);
    try {
      const data = await adminService.getUserDetails(u._id);
      setUserDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingUserDetails(false);
    }
  };

  const toggleStatus = async (user, e) => {
    e.stopPropagation();
    try {
      await adminService.updateUser(user._id, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    try {
      await adminService.deleteUser(userToDelete._id);
      setUserToDelete(null);
      if (selectedUserForEvents?._id === userToDelete._id) {
        setSelectedUserForEvents(null);
      }
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUserEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await adminService.deleteEvent(eventId);
      if (selectedUserForEvents) {
        const data = await adminService.getUserDetails(selectedUserForEvents._id);
        setUserDetails(data);
      }
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const openQuickResetModal = (u, e) => {
    e.stopPropagation();
    setResetModalUser(u);
    setQuickNewPassword('');
    setResetMessage({ text: '', type: '' });
  };

  const handleQuickResetSubmit = async (e) => {
    e.preventDefault();
    if (!quickNewPassword || quickNewPassword.length < 6) {
      setResetMessage({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }
    setIsResettingPass(true);
    setResetMessage({ text: '', type: '' });
    try {
      await adminService.updateUser(resetModalUser._id, { password: quickNewPassword });
      setResetMessage({ text: `Password for ${resetModalUser.name} updated successfully!`, type: 'success' });
    } catch (err) {
      setResetMessage({ text: err.message || 'Failed to update password.', type: 'error' });
    } finally {
      setIsResettingPass(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setQuickNewPassword(result);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (statusFilter === 'active' && !u.isActive) return false;
    if (statusFilter === 'inactive' && u.isActive) return false;
    return true;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const totalCerts = users.reduce((acc, u) => acc + (u.eventCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Telemetry */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          User Account Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Oversee registered platform accounts, certificate portfolios, access permissions, and authentication credentials.
        </p>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <UsersGroup className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Accounts</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{totalUsers}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Accounts</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{activeUsers}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Deactivated</div>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400">{totalUsers - activeUsers}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Tracked</div>
            <div className="text-xl font-black text-purple-600 dark:text-purple-400">{totalCerts}</div>
          </div>
        </div>
      </div>

      {/* Filter & Action Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email address..."
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex-1 sm:flex-none rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Standard Users</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Deactivated Only</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Users High-Density Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors w-full max-w-full">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">User Identity</th>
                  <th className="px-5 py-3.5">Access Role</th>
                  <th className="px-5 py-3.5">Portfolio Count</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5 text-right">Quick Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const initials = u.name
                      ? u.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'U';

                    return (
                      <tr
                        key={u._id}
                        onClick={() => openUserEventsModal(u)}
                        className="hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 group-hover:border-sky-300 dark:group-hover:border-sky-500/30 transition-all">
                              {u.role === 'admin' ? (
                                <Shield className="h-4 w-4 text-purple-500" />
                              ) : (
                                <span className="text-xs font-black text-sky-600 dark:text-sky-400">{initials}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{u.name}</span>
                                <span className="text-[10px] text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity font-normal">
                                  (Inspect)
                                </span>
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 text-[11px]">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge status={u.role} />
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-400 font-bold">
                            <FileText className="h-3 w-3" />
                            <span>{u.eventCount || 0} Documents</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} />
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openUserEventsModal(u)}
                            title="Inspect Documents"
                            className="px-2.5 py-1.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors"
                          >
                            Inspect
                          </button>

                          {u.role !== 'admin' && (
                            <>
                              <button
                                onClick={(e) => openQuickResetModal(u, e)}
                                title="Reset Password"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              >
                                <KeyRound className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={(e) => toggleStatus(u, e)}
                                title={u.isActive ? 'Deactivate User' : 'Activate User'}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              >
                                {u.isActive ? (
                                  <UserX className="h-3.5 w-3.5 text-amber-500" />
                                ) : (
                                  <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                )}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUserToDelete(u);
                                }}
                                title="Delete user"
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-500/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-slate-400 text-xs">
                      No matching user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Specific Events Inspector Modal */}
      <Modal
        isOpen={!!selectedUserForEvents}
        onClose={() => setSelectedUserForEvents(null)}
        title={
          selectedUserForEvents
            ? `Portfolio Inspector: ${selectedUserForEvents.name}`
            : 'User Certificates'
        }
      >
        {isLoadingUserDetails ? (
          <div className="p-6 space-y-4">
            <div className="h-14 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
            <div className="h-44 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
          </div>
        ) : userDetails ? (
          <div className="space-y-4">
            {/* User Meta Card */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{userDetails.user?.name}</span>
                  <Badge status={userDetails.user?.role} />
                  <Badge status={userDetails.user?.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {userDetails.user?.email} • Registered {new Date(userDetails.user?.createdAt).toLocaleDateString()}
                </div>
              </div>

              <button
                onClick={() => {
                  const uid = selectedUserForEvents._id;
                  setSelectedUserForEvents(null);
                  navigate(`/events?userId=${uid}`);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 rounded-lg hover:bg-sky-100 transition-colors"
              >
                Open in Event Matrix <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Events List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Registered Documents & Certificates ({userDetails.events?.length || 0})
                </h4>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                {userDetails.events && userDetails.events.length > 0 ? (
                  userDetails.events.map((ev) => (
                    <div key={ev._id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {ev.title}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            {ev.category}
                          </span>
                        </div>
                        {ev.description && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {ev.description}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(ev.eventDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={ev.daysRemaining <= 0 ? 'text-rose-500 font-bold' : ev.daysRemaining <= 7 ? 'text-amber-500 font-bold' : 'text-slate-400'}>
                            {ev.daysRemaining === 0
                              ? 'Expires Today'
                              : ev.daysRemaining > 0
                              ? `${ev.daysRemaining} days left`
                              : `Expired ${Math.abs(ev.daysRemaining)} days ago`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge status={ev.status} />
                        <Badge status={ev.priority} />
                        <button
                          onClick={() => handleDeleteUserEvent(ev._id)}
                          title="Delete Event"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    This user has not registered any certificates or events yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Quick Password Reset Modal */}
      <Modal
        isOpen={!!resetModalUser}
        onClose={() => setResetModalUser(null)}
        title={resetModalUser ? `Reset Password: ${resetModalUser.name}` : 'Reset Password'}
      >
        <form onSubmit={handleQuickResetSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set a new password for <span className="font-bold text-slate-900 dark:text-white">{resetModalUser?.email}</span>.
          </p>

          {resetMessage.text && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                resetMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              {resetMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{resetMessage.text}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                New Password
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
              <input
                type="text"
                required
                value={quickNewPassword}
                onChange={(e) => setQuickNewPassword(e.target.value)}
                placeholder="Enter or generate new password"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 pr-10 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
              {quickNewPassword && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(quickNewPassword)}
                  title="Copy Password"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {copiedPass ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setResetModalUser(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isResettingPass || !quickNewPassword}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isResettingPass ? 'Saving...' : 'Set Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={deleteUser}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete "${userToDelete?.name}" (${userToDelete?.email}) and all their registered events?`}
      />
    </div>
  );
};

export default Users;
