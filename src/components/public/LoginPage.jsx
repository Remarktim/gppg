import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaEye, FaEyeSlash, FaGoogle, FaExclamationTriangle } from "react-icons/fa";
import { GiPangolin } from "react-icons/gi";
import logo from "../../assets/img/logo.jpg";
import { authService, validateEmail } from "../../lib/supabase";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", damping: 25, stiffness: 120, when: "beforeChildren" } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const LoginPage = ({ isOpen, onClose, onSwitchToSignUp, onSwitchToForgotPassword, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear general error
    if (error) setError("");
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: authError } = await authService.signIn(formData.email, formData.password);

      if (authError) {
        setError(authError);
        return;
      }

      if (data?.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email.split("@")[0],
          role: data.user.user_metadata?.role || "user",
          avatar: data.user.user_metadata?.avatar_url,
        };

        onLogin(userData);
        onClose();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      const { error: authError } = await authService.signInWithGoogle();

      if (authError) {
        setError(authError);
      }
      // Note: Google OAuth will redirect, so we don't handle success here
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
      console.error("Google sign-in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 py-10 overflow-y-auto"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}>
          <motion.div
            className="bg-white rounded-4xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden flex"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}>
            {/* Left Panel */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#4a1d1f] to-[#3f0703] p-12 flex-col justify-center items-center">
              <motion.img
                src={logo}
                alt="GPPG Logo"
                className="w-64 h-64 rounded-full"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />
            </div>

            {/* Right Panel */}
            <div className="w-full md:w-1/2 p-8 sm:p-12 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 transition-colors"
                aria-label="Close">
                <FaTimes size={22} />
              </button>

              <div className="text-center mb-8">
                <GiPangolin className="mx-auto text-4xl text-stone-800" />
                <h2 className="text-4xl font-bold text-stone-900 mt-2">Sign in</h2>
                <p className="text-stone-600 mt-2">Welcome!</p>
              </div>

              <div className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                    <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 border border-stone-300 rounded-lg py-3 font-semibold text-stone-800 hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <FaGoogle className="text-blue-500" />
                  {isLoading ? "Signing in..." : "Sign in with Google"}
                </button>

                <div className="flex items-center">
                  <div className="flex-grow border-t border-stone-200"></div>
                  <span className="flex-shrink mx-4 text-stone-400 text-sm">or</span>
                  <div className="flex-grow border-t border-stone-200"></div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4">
                  <div className="relative">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-stone-700 text-left mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-3 pr-10 py-2 border-b-2 focus:outline-none transition-colors ${
                        fieldErrors.email ? "border-red-300 focus:border-red-500" : "border-stone-200 focus:border-stone-800"
                      }`}
                      placeholder="Email"
                      required
                    />
                    {fieldErrors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs mt-1">
                        {fieldErrors.email}
                      </motion.p>
                    )}
                  </div>
                  <div className="relative">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-stone-700 text-left mb-1">
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-3 pr-10 py-2 border-b-2 focus:outline-none transition-colors ${
                        fieldErrors.password ? "border-red-300 focus:border-red-500" : "border-stone-200 focus:border-stone-800"
                      }`}
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute bottom-2 right-2 text-stone-500">
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                    {fieldErrors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs mt-1">
                        {fieldErrors.password}
                      </motion.p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onSwitchToForgotPassword}
                    className="block text-right text-sm text-red-600 hover:underline w-full">
                    Forgot your password?
                  </button>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}>
                    {isLoading ? "Signing in..." : "Submit"}
                  </motion.button>
                </form>
              </div>

              <p className="text-center text-sm text-stone-600 mt-8">
                Don't have an account?{" "}
                <button
                  onClick={onSwitchToSignUp}
                  className="font-semibold text-red-600 hover:underline">
                  Sign up
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginPage;
