import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingDown, TrendingUp, Users, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function Sidebar() {
  const { user } = useAuth();

  const navigationItems = [
    { to: '/home', icon: Home, label: 'Homepage' },
    { to: '/expenses', icon: TrendingDown, label: 'Expenses' },
    { to: '/investments', icon: TrendingUp, label: 'Investments' },
    { to: '/financial-advice', icon: Users, label: 'Financial Advisor' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return parts[0][0];
  };

  return (
    <aside className="h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col justify-between relative z-10">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-900/10 via-transparent to-slate-900/50 pointer-events-none"></div>

      {/* Top Section */}
      <div className="relative z-10">
        {/* Logo / Title */}
        <div className="flex items-center justify-center mt-8 mb-10 px-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl opacity-20 group-hover:opacity-40 blur transition duration-300"></div>
            <h1 className="relative text-2xl font-bold tracking-wide bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 bg-clip-text text-transparent px-6 py-3">
              Guroosh
            </h1>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2 px-4">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-slate-800/40 border border-transparent hover:border-slate-700/30"
                }`
              }
            >
              {({ isActive }) => {
                const Icon = item.icon;
                return (
                  <>
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-teal-400" : "group-hover:text-teal-400"}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 py-6 border-t border-slate-700/50">
        <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/30">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/10">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role || 'Member'}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center">v1.0 • © Guroosh 2024</p>
      </div>
    </aside>
  );
}

export default Sidebar;
