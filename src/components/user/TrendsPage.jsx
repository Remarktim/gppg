import React, { useState, useMemo, useEffect, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FiTrendingUp, FiBarChart2, FiChevronDown, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import headerBg from "../../assets/img/header_bg.jpg";
import { supabase } from "../../lib/supabase";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const StatCard = ({ title, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay * 0.1 + 0.5 }}
    className={`bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-md border border-slate-200 flex-1 text-center transition-transform hover:scale-105`}>
    <h4 className="text-md sm:text-lg font-semibold text-slate-700">{title}</h4>
    <p className={`text-3xl sm:text-4xl font-bold ${color}`}>{value}</p>
  </motion.div>
);

const TrendsPage = () => {
  const [timeframe, setTimeframe] = useState("yearly");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pangolinData, setPangolinData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Load pangolin data from Supabase
  const loadPangolinData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const { data, error: supabaseError } = await supabase.from("pangolins").select("id, status, found_at, created_at").order("found_at", { ascending: true });

      if (supabaseError) {
        throw new Error(`Failed to load pangolin data: ${supabaseError.message}`);
      }

      setPangolinData(data || []);
    } catch (err) {
      console.error("Load pangolin data error:", err);
      setError(err.message);
      setPangolinData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPangolinData();
  }, [loadPangolinData]);

  // Generate chart data from real database data
  const chartData = useMemo(() => {
    if (pangolinData.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    let labels = [];
    let aliveData = [];
    let deadData = [];
    let illegalTradeData = [];
    let poachingData = [];

    if (timeframe === "yearly") {
      // Get last 5 years including current year
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let i = 4; i >= 0; i--) {
        years.push(currentYear - i);
      }
      labels = years.map((year) => year.toString());

      // Count data by year
      aliveData = years.map((year) => {
        return pangolinData.filter((p) => {
          const date = new Date(p.found_at || p.created_at);
          return date.getFullYear() === year && p.status === "alive";
        }).length;
      });

      deadData = years.map((year) => {
        return pangolinData.filter((p) => {
          const date = new Date(p.found_at || p.created_at);
          return date.getFullYear() === year && p.status === "dead";
        }).length;
      });

      illegalTradeData = years.map((year) => {
        return pangolinData.filter((p) => {
          const date = new Date(p.found_at || p.created_at);
          return date.getFullYear() === year && p.status === "illegal_trade";
        }).length;
      });

      poachingData = years.map((year) => {
        return pangolinData.filter((p) => {
          const date = new Date(p.found_at || p.created_at);
          return date.getFullYear() === year && p.status === "poaching";
        }).length;
      });
    } else {
      // Monthly data for selected year
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      labels = months;

      aliveData = months.map((_, index) => {
        return pangolinData.filter((p) => {
          const date = new Date(p.found_at || p.created_at);
          return date.getFullYear() === selectedYear && date.getMonth() === index && p.status === "alive";
        }).length;
      });

      deadData = months.map((_, index) => {
        return pangolinData.filter((p) => {
          const date = new Date(p.found_at || p.created_at);
          return date.getFullYear() === selectedYear && date.getMonth() === index && p.status === "dead";
        }).length;
      });

      illegalTradeData = months.map((_, index) => {
        return pangolinData.filter((p) => {
          const date = new Date(p.found_at || p.created_at);
          return date.getFullYear() === selectedYear && date.getMonth() === index && p.status === "illegal_trade";
        }).length;
      });

      poachingData = months.map((_, index) => {
        return pangolinData.filter((p) => {
          const date = new Date(p.found_at || p.created_at);
          return date.getFullYear() === selectedYear && date.getMonth() === index && p.status === "poaching";
        }).length;
      });
    }

    return {
      labels,
      datasets: [
        {
          label: "Alive",
          data: aliveData,
          borderColor: "#16a34a",
          backgroundColor: "rgba(22, 163, 74, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Dead",
          data: deadData,
          borderColor: "#dc2626",
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Illegal Trade",
          data: illegalTradeData,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Poaching",
          data: poachingData,
          borderColor: "#7c3aed",
          backgroundColor: "rgba(124, 58, 237, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [pangolinData, timeframe, selectedYear]);

  const totalStats = useMemo(() => {
    if (pangolinData.length === 0) {
      return {
        alive: 0,
        dead: 0,
        illegalTrade: 0,
        poaching: 0,
      };
    }

    // Filter data based on timeframe
    let filteredData = pangolinData;

    if (timeframe === "monthly") {
      // Only count data from selected year for monthly view
      filteredData = pangolinData.filter((p) => {
        const date = new Date(p.found_at || p.created_at);
        return date.getFullYear() === selectedYear;
      });
    } else {
      // For yearly view, count last 5 years
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 4;
      filteredData = pangolinData.filter((p) => {
        const date = new Date(p.found_at || p.created_at);
        return date.getFullYear() >= startYear;
      });
    }

    return {
      alive: filteredData.filter((p) => p.status === "alive").length,
      dead: filteredData.filter((p) => p.status === "dead").length,
      illegalTrade: filteredData.filter((p) => p.status === "illegal_trade").length,
      poaching: filteredData.filter((p) => p.status === "poaching").length,
    };
  }, [pangolinData, timeframe, selectedYear]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
          },
          color: "#334155",
        },
      },
      title: {
        display: true,
        text: `Poaching Activity (${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)})`,
        font: {
          size: 18,
        },
        color: "#1e293b",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div
        className="h-72 md:h-96 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${headerBg})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight shadow-sm">
            Poaching Trends
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-4 text-lg text-white/90 max-w-2xl">
            Analyzing the data on pangolin poaching incidents over time.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-14 ">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-200">
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiAlertTriangle className="flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadPangolinData}
                className="text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-red-800 transition-colors flex items-center gap-1"
                disabled={isLoading}>
                <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
                {isLoading ? "Retrying..." : "Retry"}
              </button>
            </div>
          )}

          {/* Header & Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="flex items-center text-slate-800 mb-4 sm:mb-0">
              <FiBarChart2 className="w-7 h-7 mr-3" />
              <h2 className="text-2xl font-bold">Activity Summary</h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Year selector for monthly view */}
              {timeframe === "monthly" && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition text-sm">
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option
                      key={year}
                      value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              )}

              {/* Timeframe selector */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition">
                  <span>{timeframe === "yearly" ? "Yearly" : "Monthly"}</span>
                  <FiChevronDown />
                </button>
                {showDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-lg z-10 border">
                    <button
                      onClick={() => {
                        setTimeframe("yearly");
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100">
                      Yearly
                    </button>
                    <button
                      onClick={() => {
                        setTimeframe("monthly");
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100">
                      Monthly
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-md border border-slate-200 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                </div>
              ))
            ) : (
              <>
                <StatCard
                  title="Alive"
                  value={totalStats.alive}
                  color="text-green-600"
                  delay={1}
                />
                <StatCard
                  title="Dead"
                  value={totalStats.dead}
                  color="text-red-600"
                  delay={2}
                />
                <StatCard
                  title="Illegal Trades"
                  value={totalStats.illegalTrade}
                  color="text-orange-600"
                  delay={3}
                />
                <StatCard
                  title="Poaching"
                  value={totalStats.poaching}
                  color="text-purple-600"
                  delay={4}
                />
              </>
            )}
          </div>

          {/* Chart */}
          <div className="h-96 bg-white/50 p-4 rounded-2xl">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading trend data...</p>
                </div>
              </div>
            ) : pangolinData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <FiBarChart2
                    className="mx-auto mb-4"
                    size={48}
                  />
                  <p className="text-lg font-medium">No pangolin data available</p>
                  <p className="text-sm">Add some pangolin records to see trends</p>
                </div>
              </div>
            ) : (
              <Line
                data={chartData}
                options={chartOptions}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrendsPage;
