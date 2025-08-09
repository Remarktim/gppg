import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GiPangolin } from "react-icons/gi";
import logo from "../../assets/img/logo.jpg";
import { authService, validateEmail } from "../../lib/supabase";

const AdminLoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Client-side validation
      if (!formData.username.trim()) {
        setError("Username is required.");
        return;
      }
      if (!formData.password.trim()) {
        setError("Password is required.");
        return;
      }

      // Convert username to email format for Supabase authentication
      let emailToTry = formData.username;
      if (!formData.username.includes("@")) {
        emailToTry = `${formData.username}@gppg.local`;
      }

      const { data, error: authError } = await authService.signIn(emailToTry, formData.password);

      if (authError) {
        // Provide specific error messages based on error type
        if (authError.message.includes("Invalid login credentials")) {
          setError("Invalid username or password. Please check your credentials.");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Please confirm your email address before logging in.");
        } else {
          setError(`Login failed: ${authError.message}`);
        }
        return;
      }

      // Verify user has admin role
      const user = data?.user;
      const role = user?.user_metadata?.role || "user";

      if (role !== "admin") {
        setError("Access denied. This account is not authorized for admin access.");
        return;
      }

      // Create admin session data
      const adminData = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.username || "Administrator",
        role: "admin",
      };

      onLogin(adminData);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      // eslint-disable-next-line no-console
      console.error("Admin login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2c1b1a]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="GPPG Logo"
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-[#4a1d1f]">Admin Login</h1>
          <p className="text-gray-600 mt-2">Geographical Pangolin Pango-Profile Generator</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 border border-[#4a1d1f]/10">
          <form
            onSubmit={handleSubmit}
            className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-stone-700">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#4a1d1f]/30 focus:border-[#4a1d1f] sm:text-sm"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#4a1d1f]/30 focus:border-[#4a1d1f] sm:text-sm"
                placeholder="Password"
                required
              />
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#4a1d1f] hover:bg-[#6d2a2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a1d1f]/40 disabled:opacity-50">
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
