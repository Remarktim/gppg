import React, { useEffect, useMemo, useState } from "react";
import { FiUser, FiMail, FiActivity, FiSearch, FiFilter } from "react-icons/fi";
import { supabase } from "../../lib/supabase";

const AdminProfile = ({ currentUser }) => {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load activity logs for this user from local storage first (fallback)
    try {
      const stored = localStorage.getItem("adminActivity");
      const items = stored ? JSON.parse(stored) : [];
      setLogs(items);
    } catch {}
    setIsLoading(false);
  }, []);

  const filtered = useMemo(() => {
    const matchesUser = (log) => {
      // If log has detail with email, try to match; otherwise include all
      const email = currentUser?.email?.toLowerCase?.() || "";
      if (!email) return true;
      return String(log.detail || "")
        .toLowerCase()
        .includes(email);
    };

    return logs
      .filter((l) => matchesUser(l))
      .filter((l) => (type === "all" ? true : l.type === type))
      .filter((l) => `${l.title} ${l.detail}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }, [logs, query, type, currentUser]);

  const name = currentUser?.name || currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.username || "Administrator";
  const email = currentUser?.email || currentUser?.user_metadata?.email || "admin@gppg.local";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Scope logs to current user when possible and compute quick stats
  const userLogs = useMemo(() => {
    const lowerEmail = (currentUser?.email || "").toLowerCase();
    if (!lowerEmail) return logs;
    return logs.filter((l) => String(l.detail || "").toLowerCase().includes(lowerEmail));
  }, [logs, currentUser]);

  const counts = useMemo(() => {
    return userLogs.reduce(
      (acc, l) => {
        acc.total += 1;
        if (l.type === "user") acc.user += 1;
        else if (l.type === "report") acc.report += 1;
        else if (l.type === "alert") acc.alert += 1;
        else acc.system += 1;
        return acc;
      },
      { total: 0, user: 0, report: 0, alert: 0, system: 0 }
    );
  }, [userLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-500 text-sm">Your account overview and recent activity</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left rail */}
        <aside className="col-span-12 md:col-span-4 space-y-6">
          {/* Profile card */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 shadow">
            <div className="bg-gradient-to-br from-[#fdf2f8] via-white to-white p-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-[#4a1d1f]/10 grid place-items-center text-lg font-semibold text-[#4a1d1f] select-none">{initials}</div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-600 inline-flex items-center gap-2"><FiMail /> {email}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-5 grid grid-cols-2 gap-3 border-t border-gray-100">
              <div className="rounded-xl bg-gray-50 p-3 text-center"><p className="text-xs text-gray-500">Total Logs</p><p className="text-xl font-semibold text-gray-900">{counts.total}</p></div>
              <div className="rounded-xl bg-gray-50 p-3 text-center"><p className="text-xs text-gray-500">User Actions</p><p className="text-xl font-semibold text-gray-900">{counts.user}</p></div>
              <div className="rounded-xl bg-gray-50 p-3 text-center"><p className="text-xs text-gray-500">Reports</p><p className="text-xl font-semibold text-gray-900">{counts.report}</p></div>
              <div className="rounded-xl bg-gray-50 p-3 text-center"><p className="text-xs text-gray-500">Alerts</p><p className="text-xl font-semibold text-gray-900">{counts.alert}</p></div>
            </div>
          </section>

          {/* Account info (read-only) */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Account</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-gray-500">Role</span><span className="font-medium text-gray-900">Admin</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-500">User ID</span><span className="font-mono text-[12px] text-gray-700 truncate max-w-[160px]">{currentUser?.id || "—"}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-500">Email</span><span className="font-medium text-gray-900 truncate max-w-[160px]">{email}</span></div>
            </div>
          </section>
        </aside>

        {/* Right - activity */}
        <section className="col-span-12 md:col-span-8 bg-white rounded-2xl border border-gray-100 shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><FiActivity /> Recent Activity</h2>
            <div className="flex items-center gap-2">
              <div className="relative flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm w-64">
                <FiSearch className="text-gray-400" size={16} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your activity..." className="w-full outline-none text-sm placeholder:text-gray-400" />
              </div>
              <div className="relative flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <FiFilter className="text-gray-400" size={16} />
                <select value={type} onChange={(e) => setType(e.target.value)} className="outline-none text-sm focus:ring-2 focus:ring-[#4a1d1f]/20 rounded-md">
                  <option value="all">All Types</option>
                  <option value="user">Users</option>
                  <option value="report">Reports</option>
                  <option value="alert">Alerts</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </div>

          <ol className="relative border-s border-gray-200 pl-6">
            {isLoading && <div className="text-center py-10 text-gray-500">Loading...</div>}
            {!isLoading &&
              filtered.map((a) => (
                <li key={a.id} className="mb-6 last:mb-0">
                  <span className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-white border border-gray-300 grid place-items-center text-gray-500">•</span>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{a.title}</p>
                      <p className="text-sm text-gray-600">{a.detail}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{a.time}</span>
                  </div>
                </li>
              ))}
            {!isLoading && filtered.length === 0 && <div className="text-center py-10 text-gray-500">No activity yet</div>}
          </ol>
        </section>
      </div>
    </div>
  );
};

export default AdminProfile;
