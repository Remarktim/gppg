import React from "react";
import Navbar from "../shared/Navbar";

const AdminDashboard = () => {
  const stats = [
    { title: "Total Users", value: "1,234", change: "+12%", color: "text-green-600" },
    { title: "Active Sessions", value: "567", change: "+5%", color: "text-blue-600" },
    { title: "System Load", value: "78%", change: "-3%", color: "text-yellow-600" },
    { title: "Data Storage", value: "2.4TB", change: "+8%", color: "text-purple-600" },
  ];

  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen">
      <Navbar userType="admin" />

      <div className="pt-24 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, Administrator. Here's your system overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.title}</h3>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className={`ml-2 text-sm font-medium ${stat.color}`}>{stat.change}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-md hover:bg-gray-50 border border-gray-200">
                <div className="font-medium text-gray-900">Manage Users</div>
                <div className="text-sm text-gray-500">Add, edit, or remove user accounts</div>
              </button>
              <button className="w-full text-left p-3 rounded-md hover:bg-gray-50 border border-gray-200">
                <div className="font-medium text-gray-900">System Settings</div>
                <div className="text-sm text-gray-500">Configure application settings</div>
              </button>
              <button className="w-full text-left p-3 rounded-md hover:bg-gray-50 border border-gray-200">
                <div className="font-medium text-gray-900">Generate Reports</div>
                <div className="text-sm text-gray-500">Create system and user reports</div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 rounded-md bg-gray-50">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">New user registered</div>
                  <div className="text-xs text-gray-500">2 minutes ago</div>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-md bg-gray-50">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">System backup completed</div>
                  <div className="text-xs text-gray-500">1 hour ago</div>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-md bg-gray-50">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Server maintenance scheduled</div>
                  <div className="text-xs text-gray-500">3 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
