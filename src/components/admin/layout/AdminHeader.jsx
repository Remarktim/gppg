import React, { useEffect, useRef, useState } from "react";
import { FiMenu, FiSearch, FiBell, FiSun, FiMoon, FiChevronDown, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AdminHeader = ({ onMenuClick, onLogout, onOpenPalette, user }) => {
  const [isDark, setIsDark] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenPalette?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenPalette]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initials = (user?.name || user?.user_metadata?.full_name || user?.user_metadata?.username || "Administrator")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const displayName = user?.name || user?.user_metadata?.full_name || user?.user_metadata?.username || "Administrator";
  const displayEmail = user?.email || user?.user_metadata?.email || "admin@gppg.local";

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/70 backdrop-blur-md border-b border-gray-200 lg:ml-80">
      <div className="flex h-full items-center gap-3 px-4 lg:px-6">
        <button
          className="lg:hidden mr-1 rounded-md p-2 text-gray-600 hover:bg-gray-100"
          onClick={onMenuClick}
          aria-label="Open sidebar">
          <FiMenu size={18} />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenPalette}
            className="hidden md:flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus:ring-2 focus:ring-[#4a1d1f]/20 text-left w-72">
            <FiSearch
              className="text-gray-400 mr-2"
              size={16}
            />
            <span className="flex-1 text-sm text-gray-400">Search or jump to...</span>
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-gray-400 border rounded px-1.5 py-0.5">Ctrl K</span>
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Notifications">
            <FiBell size={18} />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#6d2a2d]"></span>
          </button>

          <button
            onClick={() => setIsDark((v) => !v)}
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Toggle theme">
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Profile dropdown */}
          <div
            className="relative"
            ref={dropdownRef}>
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 hover:bg-gray-50">
              <div className="h-8 w-8 rounded-full bg-[#4a1d1f]/10 grid place-items-center text-xs font-semibold text-[#4a1d1f] select-none">{initials}</div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-gray-800 leading-none truncate max-w-[140px]">{displayName}</p>
                <p className="text-[10px] text-gray-500 leading-none truncate max-w-[140px]">{displayEmail}</p>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                <div className="px-3 py-3 bg-gradient-to-br from-[#fdf2f8] to-white">
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/admin/profile");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <FiSettings /> Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onLogout?.();
                      navigate("/admin/login");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50">
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
