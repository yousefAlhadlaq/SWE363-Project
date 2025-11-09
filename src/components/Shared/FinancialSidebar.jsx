import React from "react";
import { MessageCircle, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

function FinancialSidebar() {
  return (
    <div className="h-screen w-64 bg-gradient-to-b from-gray-900 via-[#0b1c1f] to-[#102224] text-gray-200 flex flex-col justify-between border-r border-gray-800">
      {/* Top Section */}
      <div>
        {/* Logo / Title */}
        <div className="flex items-center justify-center mt-6 mb-10">
          <h1 className="text-xl font-semibold tracking-wide bg-gray-800 px-4 py-2 rounded-xl shadow-inner text-white">
            Guroosh
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2 px-4">
          <NavLink
            to="/financial-advisor"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-[#1e2f33] shadow-md text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#172427]"
              }`
            }
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Financial Request</span>
          </NavLink>

          <NavLink
            to="/financial-settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-[#1e2f33] shadow-md text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#172427]"
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </NavLink>
        </nav>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-500">v1.0 • © Guroosh</p>
      </div>
    </div>
  );
}

export default FinancialSidebar;