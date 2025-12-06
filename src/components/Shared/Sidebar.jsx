import React, { useState, useCallback, memo, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingDown, TrendingUp, Users, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Navigation items defined outside component to prevent recreation
const navigationItems = [
  { to: '/home', icon: Home, label: 'Homepage' },
  { to: '/expenses', icon: TrendingDown, label: 'Expenses' },
  { to: '/investments', icon: TrendingUp, label: 'Investments' },
  { to: '/financial-advice', icon: Users, label: 'Financial Advisor' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

// Memoized navigation link component
const NavItem = memo(function NavItem({ item, onClick }) {
  const Icon = item.icon;
  
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
          ? "bg-white shadow-md border border-slate-300 text-slate-900 dark:bg-slate-800/70 dark:border-slate-700/50 dark:text-white"
          : "text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-transparent hover:border-slate-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800/40 dark:hover:border-slate-700/30"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-500 group-hover:text-teal-600 dark:text-slate-400 dark:group-hover:text-teal-400"}`} />
          <span className="text-sm font-medium">{item.label}</span>
        </>
      )}
    </NavLink>
  );
});

NavItem.displayName = 'NavItem';

function Sidebar() {
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Memoize toggle function
  const toggleMobile = useCallback(() => {
    setIsMobileOpen(prev => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // Get user initials for avatar - memoized
  const userInitials = useMemo(() => {
    const name = user?.fullName || user?.name;
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return parts[0][0];
  }, [user?.fullName, user?.name]);

  const displayName = user?.fullName || user?.name || 'User';
  const userRole = user?.role || 'Member';

  // Sidebar content - shared between mobile and desktop
  const SidebarContent = (
    <>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-50/80 via-transparent to-cyan-50/80 dark:from-teal-900/10 dark:to-slate-900/50 pointer-events-none"></div>

      {/* Top Section */}
      <div className="relative z-10 pt-20">
        {/* Navigation Links */}
        <nav className="space-y-2 px-4" role="navigation" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <NavItem key={item.to} item={item} onClick={closeMobile} />
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 py-6 border-t border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-white/90 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/30 shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-teal-200/50 dark:ring-white/10 flex-shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{displayName}</p>
            <p className="text-xs text-slate-500 dark:text-gray-400 capitalize">{userRole}</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-500 text-center">v1.0 • © Guroosh 2025</p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button - visible only on small screens */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700/90 transition-colors"
        aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileOpen}
        aria-controls="mobile-sidebar"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-slate-700 dark:text-white" />
        ) : (
          <Menu className="w-6 h-6 text-slate-700 dark:text-white" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Desktop Sidebar - hidden on mobile, visible on lg+ */}
      <aside 
        className="hidden lg:flex fixed top-0 left-0 h-screen w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700/50 flex-col justify-between z-20 text-slate-900 dark:text-white shadow-lg"
        role="complementary"
        aria-label="Sidebar navigation"
      >
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar - visible when open on small screens */}
      <aside 
        id="mobile-sidebar"
        className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700/50 flex flex-col justify-between z-40 text-slate-900 dark:text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="complementary"
        aria-label="Mobile sidebar navigation"
        aria-hidden={!isMobileOpen}
      >
        {SidebarContent}
      </aside>
    </>
  );
}

export default memo(Sidebar);
