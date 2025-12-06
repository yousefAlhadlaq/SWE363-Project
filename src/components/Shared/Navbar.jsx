import React from "react";
import { Link } from "react-router-dom";
import LogoImage from "../../assets/images/logo.png";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user } = useAuth();
  const isAdmin = typeof user?.role === 'string' && user.role.toLowerCase().includes('admin');
  const isAdvisor = typeof user?.role === 'string' && user.role.toLowerCase().includes('advisor');
  const homeRoute = isAdmin ? '/admin' : isAdvisor ? '/financial-advisor' : '/home';
  const subLabel = isAdmin
    ? 'Admin Portal'
    : isAdvisor
    ? 'Advisor Workspace'
    : 'Financial Platform';

  return (
    <nav className="fixed top-0 left-64 right-0 flex-shrink-0 border-b bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-700/50 backdrop-blur-xl shadow-sm dark:shadow-lg z-50 transition-colors duration-300">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-100/30 via-transparent to-blue-100/30 dark:from-teal-900/10 dark:via-transparent dark:to-blue-900/10 pointer-events-none"></div>

      <div className="relative flex items-center justify-between px-6 py-4">
        {/* Logo Section */}
        <Link to={homeRoute} className="group flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-300"></div>
            <img
              src={LogoImage}
              alt="Guroosh logo"
              className="relative h-11 w-auto rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 p-1.5 shadow-lg transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div>
            <p className="text-lg font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 dark:from-teal-300 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
              Guroosh
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-gray-400">
              {subLabel}
            </p>
          </div>
        </Link>

        {/* Center Section - Tagline */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
          <span className="text-sm font-medium tracking-wide text-teal-600/80 dark:text-teal-400/80">
            Empowering Financial Advisors
          </span>
        </div>

        {/* Right Section - Notifications (only show when logged in) */}
        {user && (
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

