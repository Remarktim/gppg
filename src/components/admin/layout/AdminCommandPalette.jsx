import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

const commands = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Map", path: "/admin/map" },
  { label: "Users", path: "/admin/users" },
  { label: "Reports", path: "/admin/reports" },
  { label: "Activity", path: "/admin/activity" },
  { label: "Settings", path: "/admin/settings" },
  { label: "Logout", action: "logout" },
];

const AdminCommandPalette = ({ isOpen, onClose, onLogout }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setQuery("");
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [query]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div
        className="mx-auto max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <FiSearch
            className="text-gray-400"
            size={18}
          />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to..."
            className="w-full outline-none text-sm placeholder:text-gray-400"
          />
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-400 border rounded px-1.5 py-0.5">Ctrl K</span>
        </div>
        <div className="max-h-80 overflow-auto p-2">
          {filtered.length === 0 && <div className="px-3 py-6 text-center text-sm text-gray-500">No results</div>}
          {filtered.map((item) => (
            <button
              key={item.label}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex justify-between"
              onClick={() => {
                onClose();
                if (item.action === "logout") {
                  onLogout?.();
                } else if (item.path) {
                  navigate(item.path);
                }
              }}>
              <span className="text-sm text-gray-800">{item.label}</span>
              <span className="text-xs text-gray-400">↵</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AdminCommandPalette;
