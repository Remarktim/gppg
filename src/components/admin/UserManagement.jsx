import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FiSearch, FiUser, FiMail, FiChevronLeft, FiChevronRight, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { supabase } from "../../lib/supabase";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Load users from Supabase
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      // First try to get users from profiles table if it exists
      const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("id, full_name, email, avatar_url, updated_at").order("updated_at", { ascending: false });

      if (profilesError && profilesError.code !== "42P01") {
        // 42P01 = table doesn't exist
        throw new Error(`Failed to load users: ${profilesError.message}`);
      }

      if (profilesData && profilesData.length > 0) {
        // Transform profiles data to user format
        const formattedUsers = profilesData.map((profile) => ({
          id: profile.id,
          name: profile.full_name || "Unknown User",
          email: profile.email || "No email available",
          avatar: profile.avatar_url,
          lastActive: profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "Unknown",
        }));
        setUsers(formattedUsers);
      } else {
        // Fallback: try to get from auth.users (might not be accessible due to RLS)
        console.warn("No profiles found, user management may be limited");
        setUsers([]);
      }
    } catch (err) {
      console.error("Load users error:", err);
      setError(err.message || "Failed to load users. Please check your database connection.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filter and paginate users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [users, searchQuery]);

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and monitor all users in the system</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiUser className="w-4 h-4" />
            <span>{totalUsers} total users</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadUsers}
            className="text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-red-800 transition-colors flex items-center gap-1"
            disabled={isLoading}>
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4a1d1f]/20 focus:border-[#4a1d1f] transition-colors"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          // Loading skeleton
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : paginatedUsers.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <FiUser className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">{searchQuery ? "No users found" : "No users available"}</h3>
            <p className="mt-1 text-gray-500">{searchQuery ? "Try adjusting your search terms." : "Users will appear here when they sign up for the platform."}</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-sm text-[#4a1d1f] hover:text-[#6d2a2d] font-medium">
                Clear search
              </button>
            )}
          </div>
        ) : (
          // Users list
          <div className="divide-y divide-gray-100">
            {paginatedUsers.map((user) => (
              <div
                key={user.id}
                className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4a1d1f] to-[#6d2a2d] flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiMail className="w-4 h-4" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-3 text-xs text-gray-500">
                  <span>Last active: {user.lastActive}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination - Only show when more than 10 users */}
      {totalUsers > usersPerPage && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + usersPerPage, totalUsers)}</span> of{" "}
              <span className="font-medium">{totalUsers}</span> users
              {searchQuery && <span className="text-gray-500"> (filtered)</span>}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <FiChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pageNum === currentPage ? "bg-[#4a1d1f] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Next
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
