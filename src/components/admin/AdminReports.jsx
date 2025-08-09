import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiFilter, FiCalendar, FiEye, FiCheckCircle, FiThumbsUp, FiRotateCcw, FiTrash2, FiX, FiMapPin, FiFileText, FiCamera } from "react-icons/fi";

const UrgencyTag = ({ urgency }) => {
  const styles = {
    low: "text-green-700 bg-green-100",
    normal: "text-blue-700 bg-blue-100",
    high: "text-orange-700 bg-orange-100",
    emergency: "text-red-700 bg-red-100",
  };
  const cls = styles[urgency] || "text-gray-700 bg-gray-100";
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${cls}`}>{urgency.charAt(0).toUpperCase() + urgency.slice(1)}</span>;
};

const StatusDot = ({ status }) => {
  const colors = {
    pending: "bg-yellow-500",
    under_review: "bg-blue-500",
    verified: "bg-green-500",
    resolved: "bg-purple-500",
  };
  return <span className={`w-2.5 h-2.5 rounded-full inline-block ${colors[status] || "bg-gray-500"}`} />;
};

const AdminReports = () => {
  const [search, setSearch] = useState("");
  const [urgency, setUrgency] = useState("all");
  const [statusFilter, setStatusFilter] = useState("pending");

  // Sample reports (mirrors style/content from user ReportPage)
  const [reports, setReports] = useState(() => {
    try {
      const stored = localStorage.getItem("adminReports");
      if (stored) return JSON.parse(stored);
    // eslint-disable-next-line no-empty
    } catch {}
    return [
      {
        id: 1001,
        date: "2024-12-01",
        time: "14:30",
        location: "Near Malampaya Beach, Puerto Princesa",
        urgency: "high",
        condition: "alive_injured",
        status: "under_review",
        description: "Found an injured pangolin near the beach area...",
        images: [],
      },
      {
        id: 1002,
        date: "2024-11-28",
        time: "09:15",
        location: "Tubbataha Reefs Natural Park",
        urgency: "emergency",
        condition: "trapped",
        status: "resolved",
        description: "Pangolin trapped in a large fishing net on the shore...",
        images: [],
      },
      {
        id: 1003,
        date: "2024-11-25",
        time: "16:45",
        location: "Puerto Princesa City, near Iwahig Penal Colony",
        urgency: "normal",
        condition: "alive_healthy",
        status: "verified",
        description: "A healthy-looking pangolin was spotted crossing a road...",
        images: [],
      },
      {
        id: 1004,
        date: "2024-11-20",
        time: "11:20",
        location: "El Nido, Palawan, near Nacpan Beach",
        urgency: "low",
        condition: "unknown",
        status: "pending",
        description: "Possible pangolin tracks near the forest edge...",
        images: [],
      },
    ];
  });
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("adminReports", JSON.stringify(reports));
    } catch {""}
  }, [reports]);

  const addActivity = (type, title, detail) => {
    try {
      const stored = localStorage.getItem("adminActivity");
      const arr = stored ? JSON.parse(stored) : [];
      const ev = {
        id: Date.now(),
        ts: Date.now(),
        time: "just now",
        type,
        title,
        detail,
      };
      arr.unshift(ev);
      localStorage.setItem("adminActivity", JSON.stringify(arr));
    } catch {""}
  };

  const updateStatus = (id, next, labelForActivity) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    const rep = reports.find((r) => r.id === id);
    addActivity("report", `${labelForActivity || "Updated"} report`, `#${String(id).padStart(4, "0")} · ${rep?.location || ""} → ${next.replace("_", " ")}`);
  };

  const removeReport = (id) => {
    const rep = reports.find((r) => r.id === id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    addActivity("report", "Deleted report", `#${String(id).padStart(4, "0")} · ${rep?.location || ""}`);
  };
  const openView = (r) => {
    setSelected(r);
    setIsViewOpen(true);
  };
  const closeView = () => setIsViewOpen(false);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchQuery = r.location.toLowerCase().includes(search.toLowerCase());
      const matchUrgency = urgency === "all" || r.urgency === urgency;
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchQuery && matchUrgency && matchStatus;
    });
  }, [reports, search, urgency, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, urgency, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);

  const getConditionIcon = (condition) => {
    const icons = {
      alive_healthy: { icon: "🟢", text: "Healthy" },
      alive_injured: { icon: "🟡", text: "Injured" },
      dead: { icon: "🔴", text: "Dead" },
      trapped: { icon: "⚠️", text: "Trapped" },
      unknown: { icon: "❓", text: "Unknown" },
    };
    return icons[condition]?.icon || "❓";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Reports</h1>
        <p className="text-gray-500 text-sm">Review all submitted pangolin reports</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm w-full sm:w-96">
          <FiSearch
            className="text-gray-400"
            size={16}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by location..."
            className="w-full outline-none text-sm placeholder:text-gray-400"
          />
        </div>
        <div className="relative flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <FiFilter
            className="text-gray-400"
            size={16}
          />
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="outline-none text-sm focus:ring-2 focus:ring-[#4a1d1f]/20 rounded-md">
            <option value="all">All Urgency</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="emergency">Emergency</option>
          </select>
          <span className="mx-2 h-5 w-px bg-gray-200" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="outline-none text-sm focus:ring-2 focus:ring-[#4a1d1f]/20 rounded-md">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under review</option>
            <option value="verified">Verified</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pageItems.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl border border-gray-100 shadow hover:shadow-md transition-all flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-xl">{getConditionIcon(r.condition)}</span>
                <span className="font-medium">{r.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot status={r.status} />
                <UrgencyTag urgency={r.urgency} />
              </div>
            </div>
            <div className="p-4 flex-1">
              <div className="flex items-center text-gray-600 text-sm">
                <FiCalendar className="w-4 h-4 mr-1.5" />
                {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {r.time}
              </div>
              <p className="text-sm text-gray-700 mt-2 line-clamp-3">{r.description}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-b-2xl flex items-center justify-between">
              <div className="text-xs text-gray-500">
                #{String(r.id).padStart(4, "0")} · {r.status.replace("_", " ")}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openView(r)}
                  className="inline-flex items-center gap-1 text-gray-700 hover:text-black text-sm">
                  <FiEye /> View
                </button>
                {r.status === "pending" && (
                  <button
                    onClick={() => updateStatus(r.id, "under_review", "Accepted")}
                    className="inline-flex items-center gap-1 text-sm rounded-md bg-[#4a1d1f] text-white px-2.5 py-1.5 hover:bg-[#6d2a2d]">
                    <FiThumbsUp /> Accept
                  </button>
                )}
                {r.status === "under_review" && (
                  <button
                    onClick={() => updateStatus(r.id, "verified", "Verified")}
                    className="inline-flex items-center gap-1 text-sm rounded-md bg-emerald-600 text-white px-2.5 py-1.5 hover:bg-emerald-700">
                    <FiCheckCircle /> Verify
                  </button>
                )}
                {(r.status === "under_review" || r.status === "verified") && (
                  <button
                    onClick={() => updateStatus(r.id, "resolved", "Resolved")}
                    className="inline-flex items-center gap-1 text-sm rounded-md bg-[#4a1d1f] text-white px-2.5 py-1.5 hover:bg-[#6d2a2d]">
                    Resolve
                  </button>
                )}
                {r.status === "resolved" && (
                  <button
                    onClick={() => updateStatus(r.id, "under_review", "Reopened")}
                    className="inline-flex items-center gap-1 text-sm rounded-md bg-yellow-500 text-white px-2.5 py-1.5 hover:bg-yellow-600">
                    <FiRotateCcw /> Reopen
                  </button>
                )}
                <button
                  onClick={() => removeReport(r.id)}
                  className="inline-flex items-center gap-1 text-sm rounded-md bg-red-50 text-red-700 px-2.5 py-1.5 hover:bg-red-100">
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">No reports found</div>}
      </div>
      {/* Pagination (show only if > 9 results) */}
      {filtered.length > 9 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span>
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`px-3 py-1.5 rounded-md text-sm border ${page <= 1 ? "text-gray-400 bg-gray-50" : "text-gray-800 bg-white hover:bg-gray-100"}`}>
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`px-3 py-1.5 rounded-md text-sm border ${page >= totalPages ? "text-gray-400 bg-gray-50" : "text-gray-800 bg-white hover:bg-gray-100"}`}>
              Next
            </button>
          </div>
        </div>
      )}
      {isViewOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeView}
          />
          <div className="relative bg-white/95 backdrop-blur rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-start justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Report Details</h2>
                <p className="text-xs text-gray-500 font-mono">#{String(selected.id).padStart(4, "0")}</p>
              </div>
              <button
                onClick={closeView}
                className="p-2 rounded-lg hover:bg-gray-100">
                <FiX />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Location</span>
                  <div className="mt-1 flex items-center text-gray-800">
                    <FiMapPin className="mr-1.5" /> {selected.location}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Date & Time</span>
                  <div className="mt-1 flex items-center text-gray-800">
                    <FiCalendar className="mr-1.5" /> {new Date(selected.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at {selected.time}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Urgency</span>
                  <div className="mt-1">
                    <UrgencyTag urgency={selected.urgency} />
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Status</span>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusDot status={selected.status} /> <span className="text-sm text-gray-700">{selected.status.replace("_", " ")}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1 flex items-center">
                  <FiFileText className="mr-2" /> Description
                </h3>
                <p className="text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">{selected.description}</p>
              </div>
              {Array.isArray(selected.images) && selected.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1 flex items-center">
                    <FiCamera className="mr-2" /> Photos
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selected.images.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`Attachment ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 border-t bg-gray-50 flex items-center justify-end gap-2">
              {selected.status === "pending" && (
                <button
                  onClick={() => {
                    updateStatus(selected.id, "under_review", "Accepted");
                    closeView();
                  }}
                  className="inline-flex items-center gap-1 text-sm rounded-md bg-[#4a1d1f] text-white px-3 py-1.5 hover:bg-[#6d2a2d]">
                  <FiThumbsUp /> Accept
                </button>
              )}
              {selected.status === "under_review" && (
                <button
                  onClick={() => {
                    updateStatus(selected.id, "verified", "Verified");
                    closeView();
                  }}
                  className="inline-flex items-center gap-1 text-sm rounded-md bg-emerald-600 text-white px-3 py-1.5 hover:bg-emerald-700">
                  <FiCheckCircle /> Verify
                </button>
              )}
              {(selected.status === "under_review" || selected.status === "verified") && (
                <button
                  onClick={() => {
                    updateStatus(selected.id, "resolved", "Resolved");
                    closeView();
                  }}
                  className="inline-flex items-center gap-1 text-sm rounded-md bg-[#4a1d1f] text-white px-3 py-1.5 hover:bg-[#6d2a2d]">
                  Resolve
                </button>
              )}
              {selected.status === "resolved" && (
                <button
                  onClick={() => {
                    updateStatus(selected.id, "under_review", "Reopened");
                    closeView();
                  }}
                  className="inline-flex items-center gap-1 text-sm rounded-md bg-yellow-500 text-white px-3 py-1.5 hover:bg-yellow-600">
                  <FiRotateCcw /> Reopen
                </button>
              )}
              <button
                onClick={() => {
                  removeReport(selected.id);
                  closeView();
                }}
                className="inline-flex items-center gap-1 text-sm rounded-md bg-red-50 text-red-700 px-3 py-1.5 hover:bg-red-100">
                <FiTrash2 /> Delete
              </button>
              <button
                onClick={closeView}
                className="inline-flex items-center gap-1 text-sm rounded-md bg-white border px-3 py-1.5 hover:bg-gray-100">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
