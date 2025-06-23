import React, { useState, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FiTrendingUp, FiBarChart2, FiChevronDown } from "react-icons/fi";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import headerBg from "../../assets/img/header_bg.jpg";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const dummyData = {
  yearly: {
    labels: ["2020", "2021", "2022", "2023", "2024"],
    alive: [120, 150, 130, 160, 140],
    dead: [30, 25, 35, 20, 28],
    scales: [50, 60, 55, 65, 70],
    illegalTrade: [15, 20, 18, 22, 25],
  },
  monthly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    alive: [10, 12, 15, 13, 18, 20],
    dead: [2, 3, 1, 4, 2, 3],
    scales: [5, 4, 6, 8, 7, 9],
    illegalTrade: [1, 2, 1, 3, 2, 4],
  },
};

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

  const chartData = useMemo(() => {
    const data = dummyData[timeframe];
    return {
      labels: data.labels,
      datasets: [
        {
          label: "Alive",
          data: data.alive,
          borderColor: "#16a34a",
          backgroundColor: "rgba(22, 163, 74, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Dead",
          data: data.dead,
          borderColor: "#dc2626",
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Scales (kg)",
          data: data.scales,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Illegal Trade Incidents",
          data: data.illegalTrade,
          borderColor: "#7c3aed",
          backgroundColor: "rgba(124, 58, 237, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [timeframe]);

  const totalStats = useMemo(() => {
    const data = dummyData[timeframe];
    return {
      alive: data.alive.reduce((a, b) => a + b, 0),
      dead: data.dead.reduce((a, b) => a + b, 0),
      scales: data.scales.reduce((a, b) => a + b, 0),
      illegalTrade: data.illegalTrade.reduce((a, b) => a + b, 0),
    };
  }, [timeframe]);

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
          {/* Header & Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="flex items-center text-slate-800 mb-4 sm:mb-0">
              <FiBarChart2 className="w-7 h-7 mr-3" />
              <h2 className="text-2xl font-bold">Activity Summary</h2>
            </div>
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              title="Scales (kg)"
              value={totalStats.scales}
              color="text-blue-600"
              delay={3}
            />
            <StatCard
              title="Illegal Trades"
              value={totalStats.illegalTrade}
              color="text-purple-600"
              delay={4}
            />
          </div>

          {/* Chart */}
          <div className="h-96 bg-white/50 p-4 rounded-2xl">
            <Line
              data={chartData}
              options={chartOptions}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrendsPage;
