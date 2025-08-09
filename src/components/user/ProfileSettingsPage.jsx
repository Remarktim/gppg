import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave, FiEye, FiEyeOff, FiShield, FiAlertTriangle, FiCheck, FiRotateCw } from "react-icons/fi";
import headerBg from "../../assets/img/header_bg.jpg";
import { useAuth } from "../../contexts/AuthContext";
import { authService, validateEmail, validatePassword, supabase } from "../../lib/supabase";

const ProfileSettingsPage = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Debug: Log user data (remove in production)
  useEffect(() => {
    console.log("ProfileSettingsPage Debug:", {
      user,
      loading,
      hasSupabaseKeys: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
    });
  }, [user, loading]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading and message states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    avatar_url: "",
  });

  // Security form state
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        setIsLoadingProfile(true);
        setError("");

        // Get user profile from Supabase
        const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "not found"
          console.warn("Profile not found in database, using user metadata only");
        }

        // Set profile data from user metadata or profile table
        setProfileData({
          firstName: profile?.first_name || user.user_metadata?.first_name || "",
          lastName: profile?.last_name || user.user_metadata?.last_name || "",
          email: user.email || "",
          phone: profile?.phone || user.user_metadata?.phone || "",
          location: profile?.location || "",
          bio: profile?.bio || "",
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || "",
        });
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile data. Please check your connection and try again.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));

    // Clear field errors when user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSecurityChange = (field, value) => {
    setSecurityData((prev) => ({ ...prev, [field]: value }));

    // Clear field errors when user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateProfileForm = () => {
    const errors = {};

    if (!profileData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!profileData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!profileData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(profileData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (profileData.phone && profileData.phone.length > 0 && profileData.phone.length < 10) {
      errors.phone = "Please enter a valid phone number";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSecurityForm = () => {
    const errors = {};

    if (!securityData.currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }

    if (!securityData.newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else {
      const passwordValidation = validatePassword(securityData.newPassword);
      if (!passwordValidation.isValid) {
        errors.newPassword = "Password must be at least 8 characters long";
      }
    }

    if (!securityData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (securityData.newPassword !== securityData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    setError("");
    setSuccess("");

    if (!validateProfileForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Update user email if changed
      if (profileData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email,
        });

        if (emailError) throw emailError;
      }

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          full_name: `${profileData.firstName} ${profileData.lastName}`,
          phone: profileData.phone,
          avatar_url: profileData.avatar_url,
        },
      });

      if (metadataError) throw metadataError;

      // Update or insert profile in profiles table
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        location: profileData.location,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url,
        updated_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!validateSecurityForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // First verify current password by attempting to sign in
      const { error: verifyError } = await authService.signIn(user.email, securityData.currentPassword);

      if (verifyError) {
        setFieldErrors({ currentPassword: "Current password is incorrect" });
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: securityData.newPassword,
      });

      if (updateError) throw updateError;

      setSuccess("Password changed successfully!");
      setSecurityData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error changing password:", err);
      setError(err.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "security", label: "Security", icon: FiShield },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Hero Section */}
      <div
        className="h-72 md:h-96 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${headerBg})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight shadow-sm">
            Profile Settings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-4 text-lg text-white/90 max-w-2xl">
            Manage your account settings and preferences
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-14">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-white/50 border-b border-slate-200">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id ? "border-red-800 text-red-800" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}>
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 mb-6">
                <FiAlertTriangle className="text-red-500 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 mb-6">
                <FiCheck className="text-green-500 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6">
                {loading || isLoadingProfile ? (
                  <div className="flex items-center justify-center py-12">
                    <FiRotateCw className="w-8 h-8 animate-spin text-[#4a1d1f]" />
                    <span className="ml-2 text-gray-600">{loading ? "Checking authentication..." : "Loading profile..."}</span>
                  </div>
                ) : !user ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FiUser className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
                    <p className="text-gray-600 mb-4">Please log in to view and edit your profile.</p>
                    <button
                      onClick={() => (window.location.href = "/")}
                      className="bg-[#4a1d1f] text-white px-6 py-2 rounded-lg hover:bg-[#6d2a2d] transition-colors">
                      Go to Login
                    </button>
                  </div>
                ) : (
                  <>
                {/* Profile Picture Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                        {profileData.avatar_url ? (
                          <img
                            src={profileData.avatar_url}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                        ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {profileData.firstName[0] || "U"}
                            {profileData.lastName[0] || ""}
                    </div>
                        )}
                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <FiCamera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                          {profileData.firstName || "User"} {profileData.lastName}
                    </h3>
                    <p className="text-gray-500">Update your profile picture</p>
                        <p className="text-sm text-gray-400">{profileData.email}</p>
                  </div>
                </div>

                    {/* Profile Form */}
                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleProfileChange("firstName", e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent bg-white/80 ${
                              fieldErrors.firstName ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-[#4a1d1f]"
                            }`}
                          />
                          {fieldErrors.firstName && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-xs mt-1">
                              {fieldErrors.firstName}
                            </motion.p>
                          )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleProfileChange("lastName", e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent bg-white/80 ${
                              fieldErrors.lastName ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-[#4a1d1f]"
                            }`}
                          />
                          {fieldErrors.lastName && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-xs mt-1">
                              {fieldErrors.lastName}
                            </motion.p>
                          )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange("email", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white/80"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange("phone", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white/80"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => handleProfileChange("location", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white/80"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => handleProfileChange("bio", e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white/80 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-[#4a1d1f] text-white px-6 py-3 rounded-xl hover:bg-[#6d2a2d] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? <FiRotateCw className="w-5 h-5 animate-spin" /> : <FiSave className="w-5 h-5" />}
                        <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={securityData.currentPassword}
                          onChange={(e) => handleSecurityChange("currentPassword", e.target.value)}
                          className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:border-transparent bg-white/80 ${
                            fieldErrors.currentPassword ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-[#4a1d1f]"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                          {showCurrentPassword ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
                        </button>
                      </div>
                      {fieldErrors.currentPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-xs mt-1">
                          {fieldErrors.currentPassword}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={securityData.newPassword}
                          onChange={(e) => handleSecurityChange("newPassword", e.target.value)}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white/80"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                          {showNewPassword ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={securityData.confirmPassword}
                          onChange={(e) => handleSecurityChange("confirmPassword", e.target.value)}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white/80"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                          {showConfirmPassword ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      className="flex items-center space-x-2 bg-red-800 text-white px-6 py-3 rounded-xl hover:bg-red-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? <FiRotateCw className="w-5 h-5 animate-spin" /> : <FiShield className="w-5 h-5" />}
                      <span>{isLoading ? "Changing..." : "Change Password"}</span>
                    </button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Enable 2FA</h4>
                        <p className="text-sm text-blue-700">Add an extra layer of security to your account</p>
                      </div>
                      <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors text-sm font-medium">Enable</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
