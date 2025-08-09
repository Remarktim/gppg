import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiFilter, FiClock, FiUser, FiAlertTriangle, FiRefreshCcw, FiTrash2 } from "react-icons/fi";

const AdminActivity = () => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [activities, setActivities] = useState(() => {
    try {
      const stored = localStorage.getItem("adminActivity");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 1, time: "2m ago", ts: Date.now() - 2 * 60 * 1000, type: "user", title: "New user registered", detail: "John Doe (john@example.com)" },
      { id: 2, time: "1h ago", ts: Date.now() - 60 * 60 * 1000, type: "system", title: "System backup completed", detail: "Backup size 1.2 GB" },
      { id: 3, time: "3h ago", ts: Date.now() - 3 * 60 * 60 * 1000, type: "alert", title: "High server load detected", detail: "CPU > 85% for 5m" },
      { id: 4, time: "yesterday", ts: Date.now() - 26 * 60 * 60 * 1000, type: "report", title: "New report submitted", detail: "Malampaya Beach, emergency" },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("adminActivity", JSON.stringify(activities));
    } catch {}
  }, [activities]);

  const filtered = useMemo(() => {
    return activities
      .filter((a) => (type === "all" ? true : a.type === type))
      .filter((a) => `${a.title} ${a.detail}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.ts - a.ts);
  }, [activities, type, query]);

  const clearAll = () => setActivities([]);

  const iconFor = (t) => {
    if (t === "user") return <FiUser className="text-blue-600" />;
    if (t === "alert") return <FiAlertTriangle className="text-red-600" />;
    if (t === "report") return <FiAlertTriangle className="text-amber-600" />;
    return <FiClock className="text-gray-600" />; // system
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Activity</h1>
          <p className="text-gray-500 text-sm">System, user, and reports timeline</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1 rounded-md bg-gray-100 text-gray-800 text-sm px-3 py-2 hover:bg-gray-200">
            <FiRefreshCcw /> Refresh
          </button>
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2 hover:bg-red-100">
            <FiTrash2 /> Clear
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm w-full sm:w-96">
          <FiSearch
            className="text-gray-400"
            size={16}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activity..."
            className="w-full outline-none text-sm placeholder:text-gray-400"
          />
        </div>
        <div className="relative flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <FiFilter
            className="text-gray-400"
            size={16}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="outline-none text-sm focus:ring-2 focus:ring-[#4a1d1f]/20 rounded-md">
            <option value="all">All Types</option>
            <option value="user">Users</option>
            <option value="report">Reports</option>
            <option value="alert">Alerts</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow p-4">
        <ol className="relative border-s border-gray-200 pl-6">
          {filtered.map((a) => (
            <li
              key={a.id}
              className="mb-6 last:mb-0">
              <span className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-white border border-gray-300 grid place-items-center">{iconFor(a.type)}</span>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{a.title}</p>
                  <p className="text-sm text-gray-600">{a.detail}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{a.time}</span>
              </div>
            </li>
          ))}
          {filtered.length === 0 && <div className="text-center py-10 text-gray-500">No activity</div>}
        </ol>
      </div>
    </div>
  );
};

export default AdminActivity;
