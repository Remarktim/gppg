import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { GiPangolin } from "react-icons/gi";

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

            <form
              onSubmit={(e) => e.preventDefault()}
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
                  className="w-full py-2 bg-transparent border-b-2 border-stone-200 focus:border-stone-800 focus:outline-none transition-colors"
                />
              </div>

              <motion.button
                type="submit"
                className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-300 mt-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}>
                Send Reset Link
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
