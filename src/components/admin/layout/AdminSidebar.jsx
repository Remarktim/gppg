import React from "react";
import { NavLink } from "react-router-dom";
import { FiGrid, FiUsers, FiBarChart2, FiActivity, FiSettings, FiMap, FiAward } from "react-icons/fi";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/admin/map", label: "Map", icon: FiMap },
  { to: "/admin/users", label: "Users", icon: FiUsers },
  { to: "/admin/pangolins", label: "Pangolins", icon: FiAward },
  { to: "/admin/reports", label: "Reports", icon: FiBarChart2 },
  { to: "/admin/activity", label: "Activity", icon: FiActivity },
  { to: "/admin/settings", label: "Settings", icon: FiSettings },
];

const Section = ({ title, children }) => (
  <div className="mt-4 first:mt-0">
    <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-gray-400">{title}</div>
    <ul className="space-y-1">{children}</ul>
  </div>
);

const AdminSidebar = ({ isOpen, onClose }) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-80 transform bg-white/90 backdrop-blur border-r border-gray-200 transition-transform duration-200 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-lg font-bold text-[#4a1d1f]">GPPG Admin</span>
        <button
          className="ml-auto lg:hidden text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close sidebar">
          ✕
        </button>
      </div>
      <nav className="p-4">
        <Section title="Navigation">
          {navItems.slice(0, 2).map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${isActive ? "bg-[#4a1d1f] text-white shadow" : "text-gray-700 hover:bg-[#4a1d1f]/10"}`
                }>
                {Icon && <Icon size={18} />}
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </Section>
        <Section title="Management">
          {navItems.slice(2, 4).map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${isActive ? "bg-[#4a1d1f] text-white shadow" : "text-gray-700 hover:bg-[#4a1d1f]/10"}`
                }>
                {Icon && <Icon size={18} />}
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </Section>
        <Section title="Analytics">
          {navItems.slice(4, 6).map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${isActive ? "bg-[#4a1d1f] text-white shadow" : "text-gray-700 hover:bg-[#4a1d1f]/10"}`
                }>
                {Icon && <Icon size={18} />}
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </Section>
        <Section title="Utilities">
          {navItems.slice(6).map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${isActive ? "bg-[#4a1d1f] text-white shadow" : "text-gray-700 hover:bg-[#4a1d1f]/10"}`
                }>
                {Icon && <Icon size={18} />}
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </Section>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
