import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { GiPangolin } from "react-icons/gi";
import { authService, validateEmail, validatePassword } from "../../lib/supabase";
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

const SignUpPage = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === "phone") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 11) {
        setFormData({ ...formData, [id]: numericValue });
      }
    } else if (type === "checkbox") {
      setFormData({ ...formData, [id]: checked });
    } else {
      setFormData({ ...formData, [id]: value });
    }

    // Clear field-specific errors when user starts typing
    if (fieldErrors[id]) {
      setFieldErrors((prev) => ({
        ...prev,
        [id]: "",
      }));
    }

    // No general message state; notifications use toasts only
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (formData.phone.length !== 11) {
      errors.phone = "Phone number must be 11 digits";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = "Password must be at least 8 characters long";
      }
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.terms) {
      errors.terms = "You must agree to the terms and conditions";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // No general message state; notifications use toasts only

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: authError } = await authService.signUp(formData.email, formData.password, {
        full_name: `${formData.firstName} ${formData.lastName}`,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      });

      if (authError) {
        const message = typeof authError === "string" ? authError : authError?.message || "Failed to create account";
        toast.error(message);
        return;
      }

      if (data?.user) {
        const metaFirst = data.user.user_metadata?.first_name;
        const metaFull = data.user.user_metadata?.full_name;
        const derivedFromMeta = metaFirst || (metaFull ? metaFull.split(" ")[0] : "");
        const rawFirstName = derivedFromMeta || formData.firstName || "";
        const firstName = rawFirstName ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1) : "Your";

        toast.success(`Welcome, ${firstName}! Please verify your email to continue.`);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          terms: false,
        });

        // Switch to login after successful signup
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-center items-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}>
          <motion.div
            className="bg-white rounded-4xl shadow-2xl w-full max-w-3xl mx-auto p-8 sm:p-12 relative"
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
              <h2 className="text-4xl font-bold text-stone-900 mt-2">Sign Up</h2>
              <p className="text-stone-600 mt-1">Join us today!</p>
            </div>

            {/* Success messages are shown via toasts */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-stone-700 text-left mb-1">
                    First name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    placeholder="Nick"
                    className={`w-full py-2 bg-transparent border-b-2 focus:outline-none transition-colors ${
                      fieldErrors.firstName ? "border-red-300 focus:border-red-500" : "border-stone-200 focus:border-stone-800"
                    }`}
                    value={formData.firstName}
                    onChange={handleChange}
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
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-stone-700 text-left mb-1">
                    Last name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    placeholder="Bundal"
                    className="w-full py-2 bg-transparent border-b-2 border-stone-200 focus:border-stone-800 focus:outline-none transition-colors"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-stone-700 text-left mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="nickbundal@gmal.com"
                    className="w-full py-2 bg-transparent border-b-2 border-stone-200 focus:border-stone-800 focus:outline-none transition-colors"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-stone-700 text-left mb-1">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="09223123423"
                    className="w-full py-2 bg-transparent border-b-2 border-stone-200 focus:border-stone-800 focus:outline-none transition-colors"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    minLength="11"
                    maxLength="11"
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
                    id="password"
                    placeholder="••••••••••"
                    className="w-full py-2 bg-transparent border-b-2 border-stone-200 focus:border-stone-800 focus:outline-none transition-colors"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute bottom-3 right-3 text-stone-500">
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
                <div className="relative">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-stone-700 text-left mb-1">
                    Confirm password
                  </label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="••••••••••"
                    className="w-full py-2 bg-transparent border-b-2 border-stone-200 focus:border-stone-800 focus:outline-none transition-colors"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute bottom-3 right-3 text-stone-500">
                    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-5 w-5 rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                  checked={formData.terms}
                  onChange={handleChange}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-stone-600">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="font-medium text-blue-600 hover:underline">
                    terms and conditions
                  </a>
                </label>
              </div>
              {fieldErrors.terms && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs">
                  {fieldErrors.terms}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={isLoading || !formData.terms}
                className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading || !formData.terms ? 1 : 1.02 }}
                whileTap={{ scale: isLoading || !formData.terms ? 1 : 0.98 }}>
                {isLoading ? "Creating Account..." : "Sign Up"}
              </motion.button>
            </form>

            <p className="text-center text-sm text-stone-600 mt-8">
              Already have an account?{" "}
              <button
                onClick={onSwitchToLogin}
                className="font-semibold text-red-600 hover:underline">
                Log in
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignUpPage;
