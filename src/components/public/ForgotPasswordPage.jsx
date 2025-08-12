import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { GiPangolin } from "react-icons/gi";
import { authService, validateEmail } from "../../lib/supabase";
import toast from "react-hot-toast";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", damping: 25, stiffness: 120 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const ForgotPasswordPage = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate
    if (!email.trim()) {
      setFieldErrors((prev) => ({ ...prev, email: "Email is required" }));
      toast.error("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setFieldErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error: authError } = await authService.resetPassword(email);

      if (authError) {
        const message = typeof authError === "string" ? authError : authError?.message || "Failed to send reset email";
        toast.error(message);
        return;
      }

      toast.success("Password reset email sent! Check your inbox for instructions.");
      setEmail("");
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Password reset error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}>
          <motion.div
            className="bg-white rounded-4xl shadow-2xl w-full max-w-md mx-auto p-8 sm:p-12 relative"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 transition-colors"
              aria-label="Close">
              <FaTimes size={22} />
            </button>

            <div className="text-center mb-10">
              <GiPangolin className="mx-auto text-4xl text-stone-800" />
              <h2 className="text-3xl font-bold text-stone-900 mt-2">Forgot Password?</h2>
              <p className="text-stone-600 mt-1">No worries, we'll send you reset instructions.</p>
            </div>

            {/* Notifications are handled via toasts */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-stone-700 text-left mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="reset-email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={`w-full py-2 bg-transparent border-b-2 focus:outline-none transition-colors ${
                    fieldErrors.email ? "border-red-300 focus:border-red-500" : "border-stone-200 focus:border-stone-800"
                  }`}
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

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </motion.button>
            </form>

            <p className="text-center text-sm text-stone-600 mt-8">
              <button
                onClick={onSwitchToLogin}
                className="font-semibold text-red-600 hover:underline">
                Back to log in
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordPage;
