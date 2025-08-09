import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiUsers, FiCpu, FiDatabase, FiActivity, FiArrowUp, FiArrowDown, FiMap, FiSettings, FiFileText, FiHeart, FiXCircle, FiAlertTriangle, FiAlertOctagon } from "react-icons/fi";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

const StatCard = ({ icon, title, value, change, changeType }) => {
  const ChangeIcon = changeType === "increase" ? FiArrowUp : FiArrowDown;
  const changeColor = changeType === "increase" ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100/70 hover:shadow-md transition-shadow flex items-center gap-4">
      <div className="shrink-0 grid place-items-center h-12 w-12 rounded-xl bg-gray-100 text-gray-700">{icon}</div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      </div>
      <div className={`flex items-center text-xs font-semibold ${changeColor}`}>
        <ChangeIcon className="mr-1" />
        <span>{change}</span>
      </div>
    </div>
  );
};

const SectionTitle = ({ children }) => <h2 className="text-lg font-semibold text-gray-900 mb-4">{children}</h2>;

const QuickAction = ({ icon, title, description, to }) => (
  <Link
    to={to}
    className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100/70 hover:shadow-md transition-shadow flex items-center gap-4">
    <div className="grid place-items-center h-12 w-12 rounded-xl bg-gray-100 text-gray-700 group-hover:bg-[#4a1d1f] group-hover:text-white transition-colors">{icon}</div>
    <div className="flex-1">
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </Link>
);

const AdminDashboard = () => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [trendYear, setTrendYear] = useState(currentYear);
  const [typeYear, setTypeYear] = useState(currentYear);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pangolinData, setPangolinData] = useState([]);
  const [usersData, setUsersData] = useState([]);

  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  }, [currentYear]);

  // Load pangolin data from Supabase
  const loadPangolinData = useCallback(async () => {
    try {
      setError("");
      const { data, error: supabaseError } = await supabase.from("pangolins").select("id, tag_id, municipality, status, found_at, created_at").order("created_at", { ascending: false });

      if (supabaseError) {
        throw new Error(`Failed to load pangolin data: ${supabaseError.message}`);
      }

      setPangolinData(data || []);
    } catch (err) {
      console.error("Load pangolin data error:", err);
      setError(err.message);
      setPangolinData([]);
    }
  }, []);

  // Load users data from Supabase (if accessible)
  const loadUsersData = useCallback(async () => {
    try {
      // Note: auth.users might not be accessible depending on RLS policies
      // This is a fallback approach using profiles table or user_metadata
      const { data, error: supabaseError } = await supabase.from("profiles").select("id, created_at").order("created_at", { ascending: false });

      if (supabaseError) {
        console.warn("Could not load users data:", supabaseError.message);
        setUsersData([]);
        return;
      }

      setUsersData(data || []);
    } catch (err) {
      console.warn("Load users data error:", err);
      setUsersData([]);
    }
  }, []);

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([loadPangolinData(), loadUsersData()]);
    setIsLoading(false);
  }, [loadPangolinData, loadUsersData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate real statistics from pangolin data
  const stats = useMemo(() => {
    const currentCounts = {
      alive: pangolinData.filter((p) => p.status === "alive").length,
      dead: pangolinData.filter((p) => p.status === "dead").length,
      illegal_trade: pangolinData.filter((p) => p.status === "illegal_trade").length,
      poaching: pangolinData.filter((p) => p.status === "poaching").length,
    };

    // Calculate previous month counts for change percentage
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const previousCounts = {
      alive: pangolinData.filter((p) => p.status === "alive" && new Date(p.created_at) <= oneMonthAgo).length,
      dead: pangolinData.filter((p) => p.status === "dead" && new Date(p.created_at) <= oneMonthAgo).length,
      illegal_trade: pangolinData.filter((p) => p.status === "illegal_trade" && new Date(p.created_at) <= oneMonthAgo).length,
      poaching: pangolinData.filter((p) => p.status === "poaching" && new Date(p.created_at) <= oneMonthAgo).length,
    };

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? "100%" : "0%";
      const change = (((current - previous) / previous) * 100).toFixed(0);
      return `${Math.abs(change)}%`;
    };

    const getChangeType = (current, previous) => {
      return current >= previous ? "increase" : "decrease";
    };

    return [
      {
        title: "Alive",
        value: currentCounts.alive.toString(),
        change: calculateChange(currentCounts.alive, previousCounts.alive),
        changeType: getChangeType(currentCounts.alive, previousCounts.alive),
        icon: <FiHeart size={22} />,
      },
      {
        title: "Dead",
        value: currentCounts.dead.toString(),
        change: calculateChange(currentCounts.dead, previousCounts.dead),
        changeType: getChangeType(currentCounts.dead, previousCounts.dead),
        icon: <FiXCircle size={22} />,
      },
      {
        title: "Illegal Trades",
        value: currentCounts.illegal_trade.toString(),
        change: calculateChange(currentCounts.illegal_trade, previousCounts.illegal_trade),
        changeType: getChangeType(currentCounts.illegal_trade, previousCounts.illegal_trade),
        icon: <FiAlertOctagon size={22} />,
      },
      {
        title: "Poaching",
        value: currentCounts.poaching.toString(),
        change: calculateChange(currentCounts.poaching, previousCounts.poaching),
        changeType: getChangeType(currentCounts.poaching, previousCounts.poaching),
        icon: <FiAlertTriangle size={22} />,
      },
      {
        title: "Total Users",
        value: usersData.length.toString(),
        change: "N/A",
        changeType: "increase",
        icon: <FiUsers size={22} />,
      },
    ];
  }, [pangolinData, usersData]);

  const trendData = useMemo(() => {
    // Generate real trend data from pangolin data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return months.map((month, index) => {
      // Filter pangolins for this month and year
      const monthData = pangolinData.filter((pangolin) => {
        const date = new Date(pangolin.found_at || pangolin.created_at);
        return date.getFullYear() === trendYear && date.getMonth() === index;
      });

      const reports = monthData.length;
      const rescues = monthData.filter((p) => p.status === "alive").length;

      return {
        name: month,
        reports,
        rescues,
      };
    });
  }, [pangolinData, trendYear]);

  const typeData = useMemo(() => {
    // Generate real pie chart data from pangolin data for selected year
    const yearData = pangolinData.filter((pangolin) => {
      const date = new Date(pangolin.found_at || pangolin.created_at);
      return date.getFullYear() === typeYear;
    });

    const counts = {
      alive: yearData.filter((p) => p.status === "alive").length,
      dead: yearData.filter((p) => p.status === "dead").length,
      illegal_trade: yearData.filter((p) => p.status === "illegal_trade").length,
      poaching: yearData.filter((p) => p.status === "poaching").length,
    };

    return [
      { name: "Alive", value: counts.alive },
      { name: "Dead", value: counts.dead },
      { name: "Illegal Trades", value: counts.illegal_trade },
      { name: "Poaching", value: counts.poaching },
    ].filter((item) => item.value > 0); // Only show categories with data
  }, [pangolinData, typeYear]);
  const TYPE_COLORS = ["#34d399", "#ef4444", "#f59e0b", "#60a5fa"];

  const reports = useMemo(() => {
    // Get recent pangolin reports (last 10)
    return pangolinData.slice(0, 10).map((pangolin) => ({
      id: pangolin.id,
      date: new Date(pangolin.found_at || pangolin.created_at).toLocaleDateString(),
      reporter: pangolin.tag_id || "System", // Use tag_id as reporter identifier
      municipality: pangolin.municipality || "Unknown",
      type:
        pangolin.status === "alive" ? "Alive" : pangolin.status === "dead" ? "Dead" : pangolin.status === "illegal_trade" ? "Illegal Trades" : pangolin.status === "poaching" ? "Poaching" : "Unknown",
      status: "Open", // Default status since we don't have this field yet
    }));
  }, [pangolinData]);

  const recentActivity = [
    { icon: <FiUsers size={16} />, text: "New user 'John Doe' registered.", time: "2m ago" },
    { icon: <FiFileText size={16} />, text: "Monthly report generated.", time: "55m ago" },
    { icon: <FiActivity size={16} />, text: "High server load detected.", time: "3h ago" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of the system, reports, and user activity</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-red-800 transition-colors"
            disabled={isLoading}>
            {isLoading ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}

      {/* KPI */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {isLoading
          ? // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          : stats.map((s) => (
              <StatCard
                key={s.title}
                {...s}
              />
            ))}
      </section>

      {/* Charts + Right rail */}
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Reports & Rescues Trend</h2>
            <select
              value={trendYear}
              onChange={(e) => setTrendYear(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent">
              {yearOptions.map((year) => (
                <option
                  key={year}
                  value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="h-72">
            {pangolinData.length === 0 && !isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FiDatabase
                    className="mx-auto mb-2"
                    size={48}
                  />
                  <p>No pangolin data available</p>
                  <p className="text-sm">Add some pangolin records to see trends</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reports"
                    stroke="#6d2a2d"
                    strokeWidth={3}
                    dot={false}
                    name="Reports"
                  />
                  <Line
                    type="monotone"
                    dataKey="rescues"
                    stroke="#34d399"
                    strokeWidth={3}
                    dot={false}
                    name="Rescues"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Reports by Type</h2>
            <select
              value={typeYear}
              onChange={(e) => setTypeYear(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent">
              {yearOptions.map((year) => (
                <option
                  key={year}
                  value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer
              width="100%"
              height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  innerRadius={55}
                  paddingAngle={3}>
                  {typeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={TYPE_COLORS[index % TYPE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Quick actions + Activity */}
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8">
          <SectionTitle>Quick Actions</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction
              icon={<FiUsers size={20} />}
              title="Manage Users"
              description="Add, edit, or remove users"
              to="/admin/users"
            />
            <QuickAction
              icon={<FiMap size={20} />}
              title="Open Map"
              description="View conservation map"
              to="/admin/map"
            />
            <QuickAction
              icon={<FiFileText size={20} />}
              title="View Reports"
              description="Generate and view reports"
              to="/admin/reports"
            />
            <QuickAction
              icon={<FiSettings size={20} />}
              title="Settings"
              description="Configure application settings"
              to="/admin/settings"
            />
            <QuickAction
              icon={<FiActivity size={20} />}
              title="Activity"
              description="See recent activity"
              to="/admin/activity"
            />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <SectionTitle>Recent Activity</SectionTitle>
          <div className="space-y-4">
            {recentActivity.map((it, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3">
                <div className="bg-gray-100 rounded-full p-2 text-gray-600">{it.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{it.text}</p>
                  <p className="text-xs text-gray-500">{it.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reports Table */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm overflow-x-auto">
        <SectionTitle>Recent Reports</SectionTitle>
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Reporter</th>
              <th className="py-2 pr-4">Municipality</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr
                key={r.id}
                className="border-t border-gray-100">
                <td className="py-3 pr-4 text-gray-800">{r.date}</td>
                <td className="py-3 pr-4 text-gray-800">{r.reporter}</td>
                <td className="py-3 pr-4 text-gray-800">{r.municipality}</td>
                <td className="py-3 pr-4">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: r.type === "Alive" ? "#dcfce7" : r.type === "Dead" ? "#fee2e2" : r.type === "Illegal Trades" ? "#fef3c7" : "#dbeafe",
                      color: r.type === "Alive" ? "#065f46" : r.type === "Dead" ? "#991b1b" : r.type === "Illegal Trades" ? "#92400e" : "#1e3a8a",
                    }}>
                    {r.type}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: r.status === "Closed" ? "#e0e7ff" : r.status === "Investigating" ? "#fef3c7" : "#e5e7eb",
                      color: r.status === "Closed" ? "#3730a3" : r.status === "Investigating" ? "#92400e" : "#374151",
                    }}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <Link
                    to="/admin/reports"
                    className="text-gray-900 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;
