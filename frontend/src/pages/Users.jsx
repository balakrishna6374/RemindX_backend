import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TableSkeleton } from '../components/common/Skeleton';
import { useNavigate } from 'react-router-dom';
import {
  Search, UserCheck, UserX, Trash2, RefreshCw, Shield, User as UserIcon,
  Calendar, ArrowRight, Clock, AlertCircle, FileText
} from 'lucide-react';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUserForEvents, setSelectedUserForEvents] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false);

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

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between gap-3 transition-colors">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">User Details</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Tracked Certificates</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr
                      key={u._id}
                      onClick={() => openUserEventsModal(u)}
                      className="hover:bg-sky-50/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold group-hover:bg-sky-100 dark:group-hover:bg-sky-950/60 group-hover:text-sky-600 transition-colors">
                            {u.role === 'admin' ? <Shield className="h-4 w-4 text-purple-500" /> : <UserIcon className="h-4 w-4 text-sky-500" />}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              <span className="text-[10px] text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity font-normal">
                                (Click to inspect)
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
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-400 font-bold">
                          <FileText className="h-3 w-3" />
                          <span>{u.eventCount || 0} Certificates</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openUserEventsModal(u)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 rounded-md hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors"
                        >
                          View Events
                        </button>
                        {u.role !== 'admin' && (
                          <>
                            <button
                              onClick={(e) => toggleStatus(u, e)}
                              title={u.isActive ? 'Deactivate User' : 'Activate User'}
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              {u.isActive ? (
                                <UserX className="h-4 w-4 text-amber-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-emerald-500" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserToDelete(u);
                              }}
                              title="Delete user"
                              className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
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
            ? `Certificates & Events: ${selectedUserForEvents.name}`
            : 'User Certificates'
        }
      >
        {isLoadingUserDetails ? (
          <div className="p-6 space-y-4">
            <div className="h-12 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
            <div className="h-40 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
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
                  {userDetails.user?.email} • Member since {new Date(userDetails.user?.createdAt).toLocaleDateString()}
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
                Open in Event Page <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Events List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                User's Tracked Documents ({userDetails.events?.length || 0})
              </h4>

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
                          <span>
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

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={deleteUser}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete "${userToDelete?.name}" (${userToDelete?.email}) and all their events?`}
      />
    </div>
  );
};
