import React from "react";
import { Settings, LayoutDashboard, Calendar } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function FinancialSidebar() {
  const { user } = useAuth();

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return parts[0][0];
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700/50 flex flex-col justify-between z-30 text-slate-900 dark:text-white">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-100/60 via-transparent to-cyan-50/70 dark:from-teal-900/10 dark:to-slate-900/50 pointer-events-none"></div>

      {/* Top Section */}
      <div className="relative z-10 pt-20">
        {/* Navigation Links */}
        <nav className="space-y-2 px-4">
          <NavLink
            to="/financial-advisor"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-white shadow-md border border-slate-200 text-slate-900 dark:bg-slate-800/70 dark:border-slate-700/50 dark:text-white"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white/70 border border-transparent hover:border-slate-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/40 dark:hover:border-slate-700/30"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard className={`w-5 h-5 transition-colors ${isActive ? "text-teal-500 dark:text-teal-400" : "text-slate-500 group-hover:text-teal-600 dark:text-slate-400 dark:group-hover:text-teal-400"}`} />
                <span className="text-sm font-medium">My Requests</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/advisor-availability"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-white shadow-md border border-slate-200 text-slate-900 dark:bg-slate-800/70 dark:border-slate-700/50 dark:text-white"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white/70 border border-transparent hover:border-slate-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/40 dark:hover:border-slate-700/30"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Calendar className={`w-5 h-5 transition-colors ${isActive ? "text-teal-500 dark:text-teal-400" : "text-slate-500 group-hover:text-teal-600 dark:text-slate-400 dark:group-hover:text-teal-400"}`} />
                <span className="text-sm font-medium">Availability</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/financial-settings"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-white shadow-md border border-slate-200 text-slate-900 dark:bg-slate-800/70 dark:border-slate-700/50 dark:text-white"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white/70 border border-transparent hover:border-slate-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/40 dark:hover:border-slate-700/30"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Settings className={`w-5 h-5 transition-colors ${isActive ? "text-teal-500 dark:text-teal-400" : "text-slate-500 group-hover:text-teal-600 dark:text-slate-400 dark:group-hover:text-teal-400"}`} />
                <span className="text-sm font-medium">Settings</span>
              </>
            )}
          </NavLink>
        </nav>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 py-6 border-t border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-white/80 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/30 shadow-sm dark:shadow-none">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/40 dark:ring-white/10">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name || 'Advisor'}</p>
            <p className="text-xs text-slate-500 dark:text-gray-400 capitalize">{user?.role || 'Advisor'}</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-500 text-center">v1.0 • © Guroosh 2025</p>
      </div>
    </div>
  );
}

export default FinancialSidebar;
