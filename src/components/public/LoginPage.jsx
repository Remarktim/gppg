import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { GiPangolin } from "react-icons/gi";
import logo from "../../assets/img/logo.jpg";

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

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, you would validate credentials with your backend
    // For now, we'll simulate a successful login for any email/password combination
    if (formData.email && formData.password) {
      const userData = {
        id: 1,
        email: formData.email,
        name: formData.email.split("@")[0], // Use email username as display name
        role: "user",
      };

      onLogin(userData);
    } else {
      alert("Please fill in all fields");
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = () => {
    // Simulate Google sign-in
    const userData = {
      id: 1,
      email: "user@google.com",
      name: "Google User",
      role: "user",
    };
    onLogin(userData);
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
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 border border-stone-300 rounded-lg py-3 font-semibold text-stone-800 hover:bg-stone-50 transition-colors">
                  <FaGoogle className="text-blue-500" />
                  Sign in with Google
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
                      className="w-full pl-3 pr-10 py-2 border-b-2 border-stone-200 focus:border-stone-800 focus:outline-none transition-colors"
                      placeholder="Email"
                      required
                    />
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
                      className="w-full pl-3 pr-10 py-2 border-b-2 border-stone-200 focus:border-stone-800 focus:outline-none transition-colors"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute bottom-2 right-2 text-stone-500">
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
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
