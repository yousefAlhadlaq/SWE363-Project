import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/admin', exact: true },
  { label: 'Manage Users', to: '/admin/users' },
  { label: 'Notifications', to: '/admin/notifications' },
  { label: 'Advisors', to: '/admin/advisors' },
  { label: 'Settings', to: '/admin/settings' }
];

function AdminLayout({ title, description, children, accentLabel }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-900/70 to-slate-900 text-white flex font-['Inter',sans-serif]">
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900/80 border-r border-white/5 px-6 py-8 space-y-10 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div>
            <p className="text-sm text-gray-400">Guroosh</p>
            <p className="text-base font-semibold">Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-slate-800/80 border border-white/15 text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)]'
                    : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/5'
                }`
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="text-xs text-gray-500">
          {' '}
<p className="text-xs text-slate-500 dark:text-gray-500 text-center">v1.0 • © Guroosh 2025</p>        </div>
      </aside>

      <main className="flex-1 bg-gradient-to-br from-slate-900 via-slate-900/70 to-slate-900 px-6 md:px-10 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col gap-3 mb-10">
            {accentLabel && (
              <span className="uppercase tracking-[0.3em] text-xs text-teal-200/80">
                {accentLabel}
              </span>
            )}
            {title && (
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-gray-400 text-base md:text-lg max-w-2xl">
                {description}
              </p>
            )}
          </header>

          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
