import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';

const initialUsers = [
  {
    id: 'U-10428',
    name: 'Noura Al-Qahtani',
    email: 'noura.q@example.com',
    status: 'active',
    advisor: 'Assigned',
    lastLogin: 'Sep 28 • 09:12 KSA',
    segment: 'Premium',
    location: 'Riyadh',
    phone: '+966 50 123 4567',
    type: 'User'
  },
  {
    id: 'U-10177',
    name: 'Abdulrahman Saleh',
    email: 'abdulrahman.s@example.com',
    status: 'active',
    advisor: 'Assigned',
    lastLogin: 'Yesterday • 18:45 KSA',
    segment: 'Standard',
    location: 'Jeddah',
    phone: '+966 53 890 1234',
    type: 'User'
  },
  {
    id: 'U-10311',
    name: 'Omar Al-Harbi',
    email: 'omar.h@example.com',
    status: 'inactive',
    advisor: 'Unassigned',
    lastLogin: 'Aug 02 • 14:20 KSA',
    segment: 'Dormant',
    location: 'Dammam',
    phone: '+966 54 321 9087',
    type: 'Advisor'
  },
  {
    id: 'ADM-001',
    name: 'Rayan Khalid',
    email: 'admin@quroosh.com',
    status: 'active',
    advisor: 'N/A',
    lastLogin: 'Today • 08:05 KSA',
    segment: 'Admin',
    location: 'Riyadh',
    phone: '+966 59 111 2222',
    role: 'admin',
    type: 'User'
  }
];

const currentAdmin = {
  id: 'ADM-001',
  name: 'Rayan Khalid',
  email: 'admin@quroosh.com'
};

function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [flash, setFlash] = useState(null);
  const [systemLog, setSystemLog] = useState([
    {
      id: 'log-0',
      type: 'Access',
      detail: 'Admin console opened',
      userName: currentAdmin.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(timer);
  }, [flash]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return users.filter((user) => {
      if (user.id === currentAdmin.id) return false;
      if (!query) return true;
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, users]);

  const pushLog = (type, user, detail) => {
    const newEntry = {
      id: `${type}-${Date.now()}`,
      type,
      detail,
      userName: user?.name || 'System',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSystemLog((prev) => [newEntry, ...prev].slice(0, 7));
  };

  const showFlash = (type, message) => {
    setFlash({ type, message });
  };

  const handleStatusToggle = (user) => {
    if (user.id === currentAdmin.id || user.email === currentAdmin.email) {
      showFlash('error', 'You cannot deactivate your own admin account.');
      pushLog('Security', user, 'Prevented self-deactivation');
      return;
    }

    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    const confirmed = window.confirm(
      `Are you sure you want to ${nextStatus === 'active' ? 'activate' : 'deactivate'} ${user.name}?`
    );
    if (!confirmed) return;

    const notify = window.confirm('Notify user about this change?');

    setUsers((prev) =>
      prev.map((item) =>
        item.id === user.id ? { ...item, status: nextStatus } : item
      )
    );
    setSelectedUser((prev) =>
      prev && prev.id === user.id ? { ...prev, status: nextStatus } : prev
    );

    pushLog(
      nextStatus === 'active' ? 'Activation' : 'Deactivation',
      user,
      notify ? 'User notified via email' : 'No notification sent'
    );
    showFlash(
      'success',
      `${user.name} is now marked as ${nextStatus}. ${notify ? 'Notification issued.' : ''}`
    );
  };

  const handleResetPassword = (user) => {
    const confirmed = window.confirm(
      `Reset password for ${user.name}? They will be required to set a new one.`
    );
    if (!confirmed) return;

    const notify = window.confirm('Send a reset link to the user?');

    pushLog(
      'Password Reset',
      user,
      notify ? 'Reset link emailed to user' : 'Manual reset recorded by admin'
    );
    showFlash(
      'success',
      `Password reset recorded for ${user.name}. ${notify ? 'Reset link sent.' : ''}`
    );
  };

  const handleProfileOpen = (user) => {
    setSelectedUser(user);
    pushLog('Profile View', user, 'Profile opened from search results');
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    pushLog('Search', currentAdmin, `Query submitted: "${searchQuery || 'all'}"`);
  };

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
            Showing {filteredUsers.length} result{filteredUsers.length === 1 ? '' : 's'}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onOpenProfile={() => handleProfileOpen(user)}
                onToggleStatus={() => handleStatusToggle(user)}
                onResetPassword={() => handleResetPassword(user)}
              />
            ))}
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
          onClose={() => setSelectedUser(null)}
          onResetPassword={() => handleResetPassword(selectedUser)}
          onToggleStatus={() => handleStatusToggle(selectedUser)}
        />
      )}
    </>
  );
}

function UserCard({ user, onOpenProfile, onToggleStatus, onResetPassword }) {
  const isActive = user.status === 'active';
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article className="rounded-3xl bg-white/5 border border-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-lg font-semibold">
            {initials}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">{user.type}</p>
            <h4 className="text-xl font-semibold text-white">{user.name}</h4>
            <p className="text-sm text-gray-400">{user.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              User ID: {user.id}
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
        <p>{user.lastLogin}</p>
        <p>Advisor: {user.advisor}</p>
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
          }`}
        >
          {isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={onResetPassword}
          className="flex-1 min-w-[140px] rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
        >
          Reset Password
        </button>
      </div>
    </article>
  );
}

function ProfileDrawer({ user, onClose, onResetPassword, onToggleStatus }) {
  const isActive = user.status === 'active';

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
            <h3 className="text-2xl font-semibold">{user.name}</h3>
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
            <p className="text-sm text-gray-400">User ID: {user.id}</p>
            <p className="text-sm text-gray-400">Segment: {user.segment}</p>
            <p className="text-sm text-gray-400">Type: {user.type}</p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">
              Activity
            </p>
            <p className="text-sm text-gray-300">Last login</p>
            <p className="text-lg font-semibold text-white">
              {user.lastLogin}
            </p>
            <p className="text-sm text-gray-400">Advisor: {user.advisor}</p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">
              Contact
            </p>
            <p className="text-sm text-gray-400">{user.phone}</p>
            <p className="text-sm text-gray-400">{user.location}</p>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onResetPassword}
            className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold hover:bg-white/10 transition"
          >
            Reset Password
          </button>
          <button
            onClick={onToggleStatus}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              isActive
                ? 'bg-red-500/10 border border-red-400/40 text-red-100 hover:bg-red-500/20'
                : 'bg-emerald-500/10 border border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/20'
            }`}
          >
            {isActive ? 'Deactivate User' : 'Activate User'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
