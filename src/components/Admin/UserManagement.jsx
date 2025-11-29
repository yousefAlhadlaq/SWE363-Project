import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const formatRelativeTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('en-SA', { month: 'short', day: 'numeric' });
};

const getInitialLog = (actorName) => ([
  {
    id: 'log-0',
    type: 'Access',
    detail: 'Admin console opened',
    userName: actorName || 'Admin',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
]);

const getInitials = (name = 'User') => name
  .split(' ')
  .filter(Boolean)
  .map((part) => part[0])
  .slice(0, 2)
  .join('')
  .toUpperCase();

const getRoleLabel = (role) => {
  if (!role) return 'User';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const getAdvisorLabel = (user) => {
  if (user?.role === 'advisor' || user?.isAdvisor) return 'Self';
  return user?.connectedAdvisor ? 'Assigned' : 'Unassigned';
};

function UserManagement() {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [flash, setFlash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionUserId, setActionUserId] = useState(null);
  const [systemLog, setSystemLog] = useState(() => getInitialLog(currentUser?.fullName));

  useEffect(() => {
    setSystemLog(getInitialLog(currentUser?.fullName));
  }, [currentUser?.fullName]);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(timer);
  }, [flash]);

  const loadUsers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getUsers(params);
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to load users');
      }
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Admin users fetch error:', err);
      setError(err.message || 'Unable to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const currentAdminId = currentUser?._id || currentUser?.id;

  const pushLog = useCallback((type, actor, detail) => {
    const entry = {
      id: `${type}-${Date.now()}`,
      type,
      detail,
      userName: actor?.fullName || actor?.name || currentUser?.fullName || 'Admin',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSystemLog((prev) => [entry, ...prev].slice(0, 7));
  }, [currentUser?.fullName]);

  const showFlash = (type, message) => setFlash({ type, message });

  const refreshUsers = () => loadUsers(searchQuery ? { q: searchQuery } : {});

  const handleStatusToggle = async (user) => {
    if (!user) return;
    const targetId = user._id || user.id;
    if (currentAdminId && targetId === currentAdminId) {
      showFlash('error', 'You cannot change the status of your own admin account.');
      pushLog('Security', currentUser, 'Prevented self-deactivation');
      return;
    }

    const nextAction = user.status === 'active' ? 'deactivate' : 'activate';
    const confirmed = window.confirm(
      `Are you sure you want to ${nextAction} ${user.fullName || user.email}?`
    );
    if (!confirmed) return;

    setActionUserId(targetId);
    try {
      await adminService.toggleUserStatus(targetId, nextAction);
      showFlash('success', `${user.fullName || user.email} is now ${nextAction === 'activate' ? 'active' : 'inactive'}.`);
      pushLog(nextAction === 'activate' ? 'Activation' : 'Deactivation', user, 'Status updated via admin console');
      await refreshUsers();
    } catch (err) {
      console.error('Toggle status failed:', err);
      showFlash('error', err.message || 'Failed to update user status.');
    } finally {
      setActionUserId(null);
    }
  };

  const handleResetPassword = async (user) => {
    if (!user) return;
    const confirmed = window.confirm(`Send password reset instructions to ${user.email}?`);
    if (!confirmed) return;

    setActionUserId(user._id || user.id);
    try {
      const response = await adminService.resetUserPassword(user._id || user.id);
      showFlash('success', response?.message || `Reset instructions sent to ${user.email}.`);
      pushLog('Password Reset', user, 'Reset email triggered');
    } catch (err) {
      console.error('Reset password failed:', err);
      showFlash('error', err.message || 'Failed to reset password.');
    } finally {
      setActionUserId(null);
    }
  };

  const handleProfileOpen = (user) => {
    setSelectedUserId(user?._id || user?.id);
    pushLog('Profile View', user, 'Profile opened from listing');
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    await refreshUsers();
    pushLog('Search', currentUser, `Query submitted: "${searchQuery || 'all'}"`);
  };

  const handleCreateUser = (event) => {
    event.preventDefault();
    showFlash('error', 'Admin-side user creation is not wired to the API yet. Please onboard via the signup flow.');
    pushLog('Info', currentUser, 'Attempted to use placeholder create user form');
  };

  const handleDeleteUser = (user) => {
    showFlash('error', 'Deleting users is restricted. Disable accounts instead.');
    pushLog('Security', user, 'Delete operation blocked');
  };

  const displayUsers = useMemo(() => (
    users.filter((user) => (user._id || user.id) !== currentAdminId)
  ), [users, currentAdminId]);

  const selectedUser = useMemo(() => (
    displayUsers.find((user) => (user._id || user.id) === selectedUserId) || null
  ), [displayUsers, selectedUserId]);

  return (
    <>
      <AdminLayout
        accentLabel="Manage Users"
        title="Manage Users"
        description="Locate a user by name, email, or ID to view their status, profile, and quick actions."
      >
        <div className="space-y-8">
          {flash && (
            <div
              className={`rounded-2xl px-4 py-3 border ${
                flash.type === 'error'
                  ? 'bg-red-500/10 border-red-400/50 text-red-100'
                  : 'bg-emerald-500/10 border-emerald-400/50 text-emerald-100'
              }`}
            >
              {flash.message}
            </div>
          )}

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col lg:flex-row gap-4 items-start lg:items-center"
          >
            <div className="relative w-full lg:flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 19a8 8 0 100-16 8 8 0 000 16zm6-2l4 4"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or ID"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-teal-400/70 focus:bg-white/10 transition"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition"
            >
              Search
            </button>
          </form>

          <div className="text-sm text-gray-400">
            {loading ? 'Loading users…' : `Showing ${displayUsers.length} result${displayUsers.length === 1 ? '' : 's'}`}
          </div>

          {error && (
            <div className="rounded-2xl bg-red-500/10 border border-red-400/50 text-red-100 px-4 py-3">
              {error}
            </div>
          )}

          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
                Create
              </p>
              <h3 className="text-2xl font-semibold text-white">Add New User</h3>
            </div>
            <form className="grid md:grid-cols-3 gap-4" onSubmit={handleCreateUser}>
              <input
                type="text"
                value=""
                onChange={() => {}}
                placeholder="Full name"
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400/70"
                disabled
              />
              <input
                type="email"
                value=""
                onChange={() => {}}
                placeholder="email@example.com"
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400/70"
                disabled
              />
              <select
                value="User"
                onChange={() => {}}
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-400/70 admin-dark-select"
                disabled
              >
                <option value="User">User</option>
                <option value="Advisor">Advisor</option>
              </select>
              <button
                type="submit"
                className="md:col-span-3 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold py-3 hover:bg-white/20 transition disabled:opacity-50"
                disabled
              >
                Create User (coming soon)
              </button>
            </form>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {loading ? (
              <div className="col-span-full text-center text-gray-400 py-10">Loading directory…</div>
            ) : displayUsers.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-10">No users match the current filters.</div>
            ) : (
              displayUsers.map((user) => (
                <UserCard
                  key={user._id || user.id}
                  user={user}
                  busy={actionUserId === (user._id || user.id)}
                  onOpenProfile={() => handleProfileOpen(user)}
                  onToggleStatus={() => handleStatusToggle(user)}
                  onResetPassword={() => handleResetPassword(user)}
                  onDelete={() => handleDeleteUser(user)}
                />
              ))
            )}
          </div>

          <section className="bg-white/5 border border-white/5 rounded-3xl p-6 shadow-[0_12px_45px_rgba(1,6,12,0.75)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
                  System Log
                </p>
                <h3 className="text-2xl font-semibold text-white">
                  Recorded Actions
                </h3>
              </div>
              <span className="text-sm text-gray-500">
                {systemLog.length} recent entr{systemLog.length === 1 ? 'y' : 'ies'}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {systemLog.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl bg-white/10 border border-white/10 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {entry.type}
                    </p>
                    <p className="text-xs text-gray-400">{entry.detail}</p>
                  </div>
                  <div className="text-xs text-gray-400 md:text-right">
                    <p>{entry.time}</p>
                    <p className="text-gray-500">{entry.userName}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </AdminLayout>

      {selectedUser && (
        <ProfileDrawer
          user={selectedUser}
          busy={actionUserId === (selectedUser._id || selectedUser.id)}
          onClose={() => setSelectedUserId(null)}
          onResetPassword={() => handleResetPassword(selectedUser)}
          onToggleStatus={() => handleStatusToggle(selectedUser)}
          onDelete={() => handleDeleteUser(selectedUser)}
        />
      )}
    </>
  );
}

function UserCard({ user, busy, onOpenProfile, onToggleStatus, onResetPassword, onDelete }) {
  const isActive = user.status === 'active';
  const identifier = user._id || user.id;
  const initials = getInitials(user.fullName || user.name);
  const roleLabel = getRoleLabel(user.role);
  const lastSeen = formatRelativeTime(user.updatedAt || user.createdAt);
  const advisorLabel = getAdvisorLabel(user);

  return (
    <article className="rounded-3xl bg-white/5 border border-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-lg font-semibold">
            {initials}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">{roleLabel}</p>
            <h4 className="text-xl font-semibold text-white">{user.fullName || user.name || 'User'}</h4>
            <p className="text-sm text-gray-400">{user.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              User ID: {identifier}
            </p>
          </div>
        </div>
        <span
          className={`px-4 py-1 rounded-full text-xs font-semibold ${
            isActive ? 'bg-emerald-400/20 text-emerald-200' : 'bg-slate-500/20 text-slate-200'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="mt-4 text-sm text-gray-400 space-y-1">
        <p>Last seen: {lastSeen}</p>
        <p>Advisor: {advisorLabel}</p>
        <p>Role: {roleLabel}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={onOpenProfile}
          className="flex-1 min-w-[140px] rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
        >
          Open Profile
        </button>
        <button
          onClick={onToggleStatus}
          className={`flex-1 min-w-[140px] rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            isActive
              ? 'bg-white/5 border border-white/20 hover:bg-red-500/10 text-red-200'
              : 'bg-white/10 border border-white/20 hover:bg-emerald-500/10 text-emerald-100'
          } ${busy ? 'opacity-60 cursor-not-allowed' : ''}`}
          disabled={busy}
        >
          {isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={onResetPassword}
          className={`flex-1 min-w-[140px] rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition ${busy ? 'opacity-60 cursor-not-allowed' : ''}`}
          disabled={busy}
        >
          Reset Password
        </button>
        <button
          onClick={() => onDelete(user)}
          className="flex-1 min-w-[140px] rounded-2xl border border-red-400/40 px-4 py-3 text-sm font-semibold text-red-100 hover:bg-red-500/10 transition"
        >
          Delete User
        </button>
      </div>
    </article>
  );
}

function ProfileDrawer({ user, busy, onClose, onResetPassword, onToggleStatus, onDelete }) {
  const isActive = user.status === 'active';
  const identifier = user._id || user.id;
  const advisorLabel = getAdvisorLabel(user);

  return (
    <div className="fixed inset-0 z-40 flex">
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="w-full max-w-md bg-[#020b13] text-white h-full shadow-2xl flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">
              Profile
            </p>
            <h3 className="text-2xl font-semibold">{user.fullName || user.name}</h3>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 px-3 py-1 text-xs hover:bg-white/10 transition"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">
              Account
            </p>
            <p className="text-sm text-gray-300">Status</p>
            <p
              className={`text-lg font-semibold ${
                isActive ? 'text-emerald-300' : 'text-slate-300'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </p>
            <p className="text-sm text-gray-400">User ID: {identifier}</p>
            <p className="text-sm text-gray-400">Role: {user.role || 'user'}</p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">
              Activity
            </p>
            <p className="text-sm text-gray-300">Last activity</p>
            <p className="text-lg font-semibold text-white">
              {formatRelativeTime(user.updatedAt || user.createdAt)}
            </p>
            <p className="text-sm text-gray-400">Advisor: {advisorLabel}</p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">
              Contact
            </p>
            <p className="text-sm text-gray-400">{user.phoneNumber || 'N/A'}</p>
            <p className="text-sm text-gray-400">{user.address || '—'}</p>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onResetPassword}
            className={`rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold hover:bg-white/10 transition ${busy ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={busy}
          >
            Reset Password
          </button>
          <button
            onClick={onToggleStatus}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              isActive
                ? 'bg-red-500/10 border border-red-400/40 text-red-100 hover:bg-red-500/20'
                : 'bg-emerald-500/10 border border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/20'
            } ${busy ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={busy}
          >
            {isActive ? 'Deactivate User' : 'Activate User'}
          </button>
          <button
            onClick={onDelete}
            className="rounded-2xl px-4 py-3 text-sm font-semibold border border-red-400/40 text-red-100 hover:bg-red-500/10 transition"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;

