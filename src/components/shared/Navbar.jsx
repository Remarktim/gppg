import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/img/logo.jpg";

const Navbar = ({ onSignInClick, userType, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const productsRef = useRef(null);
  const userMenuRef = useRef(null);

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productsRef.current && !productsRef.current.contains(event.target)) {
        setIsProductsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Different navigation items based on user type
  const getNavItems = () => {
    if (userType === "admin") {
      return [
        { label: "Dashboard", to: "/admin/dashboard" },
        // Add other admin links here, e.g., user management
      ];
    }

    if (userType === "user") {
      return [
        { label: "Home", to: "/dashboard" },
        { label: "Trend", to: "/trends" },
        { label: "Map", to: "/map" },
        { label: "Activities", to: "/activities" },
        { label: "Gallery", to: "/gallery" },
        {
          label: "About",
          dropdown: [
            { label: "Officers", to: "/officers" },
            { label: "About Us", to: "/about" },
          ],
        },
      ];
    }

    // Default navigation for public users
    return [
      { label: "Home", to: "/" },
      {
        label: "About",
        dropdown: [
          { label: "Officers", to: "/officers" },
          { label: "About Us", to: "/about" },
        ],
      },
    ];
  };

  const navItems = getNavItems();

  const navContainerClasses = isScrolled ? "transform translate-y-0 opacity-100" : "transform -translate-y-2 opacity-95";

  const navClasses = isScrolled ? "bg-white/90 shadow-xl text-black" : "bg-transparent text-white";

  const linkClasses = isScrolled ? "text-black hover:text-gray-700" : "text-white hover:text-gray-300";

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navContainerClasses}`}>
      <nav className="transition-all duration-300 px-4 sm:px-6 lg:px-8 pt-4">
        <div className={`max-w-7xl mx-auto transition-all duration-300 px-4 sm:px-6 lg:px-8 py-2 rounded-4xl ${navClasses}`}>
          <div className="flex items-center justify-between h-16">
            {/* Navbar Start */}
            <div className="flex-shrink-0 flex items-center">
              {/* Logo */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-900/50 rounded-full mr-2 sm:mr-3">
                <img
                  className="w-full h-full object-cover rounded-full"
                  src={logo}
                  alt="GPPG Logo"
                />
              </div>
              <Link
                to={userType === "user" ? "/dashboard" : "/"}
                className="text-lg sm:text-xl font-semibold tracking-wider no-underline">
                <span className="hidden xl:inline">Guardians of the Palawan Pangolin Guild</span>
                <span className="inline xl:hidden">GPPG</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <ul className="flex items-center gap-6 lg:gap-8 text-base font-medium">
                {navItems.map((item, index) => (
                  <li
                    key={index}
                    className="relative"
                    ref={item.dropdown ? productsRef : null}>
                    {item.dropdown ? (
                      <>
                        <button
                          className={`flex items-center gap-1 transition-colors duration-200 ${linkClasses}`}
                          onClick={() => {
                            setIsProductsOpen((prev) => !prev);
                            setIsUserMenuOpen(false);
                          }}>
                          {item.label}
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isProductsOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <AnimatePresence>
                          {isProductsOpen && (
                            <motion.ul
                              variants={dropdownVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className={`absolute top-full left-0 mt-8 w-48 rounded-2xl shadow-xl z-20 ${
                                isScrolled ? "bg-white overflow-hidden text-black" : "bg-white/20 backdrop-blur-sm text-white"
                              }`}>
                              {item.dropdown.map((dropdownItem, dropdownIndex) => (
                                <li key={dropdownIndex}>
                                  <Link
                                    to={dropdownItem.to}
                                    onClick={() => setIsProductsOpen(false)}
                                    className={`block px-4 py-2 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg ${
                                      isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10 hover:text-white/70"
                                    }`}>
                                    {dropdownItem.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={item.to}
                        className={`transition-colors duration-200 ${linkClasses}`}>
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              {/* User Profile Dropdown or Sign In Button */}
              {userType === "user" ? (
                <div
                  className="relative"
                  ref={userMenuRef}>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen((prev) => !prev);
                      setIsProductsOpen(false);
                    }}
                    className={`flex items-center  px-3  py-2 rounded-full font-semibold transition-all duration-300 ${
                      isScrolled ? "bg-red-800 text-white hover:bg-red-900 " : "bg-[#4a1d1f] text-white   hover:bg-[#6d2a2d]"
                    }`}>
                    <span className="inline">RT</span>
                  </button>
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.ul
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`absolute top-full right-0 mt-6 w-48 rounded-2xl shadow-xl z-20 ${isScrolled ? "bg-white text-black" : "bg-white/20 backdrop-blur-sm text-white"}`}>
                        <li>
                          <Link
                            to="/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className={`block px-4 py-2 transition-all duration-200 first:rounded-t-lg ${isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10 hover:text-white/70"}`}>
                            Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/profile-settings"
                            onClick={() => setIsUserMenuOpen(false)}
                            className={`block px-4 py-2 transition-all duration-200 ${isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10 hover:text-white/70"}`}>
                            Profile Settings
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/report"
                            onClick={() => setIsUserMenuOpen(false)}
                            className={`block px-4 py-2 transition-all duration-200 ${isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10 hover:text-white/70"}`}>
                            Report
                          </Link>
                        </li>

                        <li>
                          <hr className={`my-1 ${isScrolled ? "border-gray-200" : "border-white/20"}`} />
                        </li>
                        <li>
                          <button
                            className={`w-full text-left px-4 py-2 transition-all duration-200 last:rounded-b-lg ${isScrolled ? "hover:bg-red-50 text-red-600" : "hover:bg-red-500/20 text-red-300"}`}
                            onClick={() => {
                              onLogout && onLogout();
                              setIsUserMenuOpen(false);
                            }}>
                            Sign Out
                          </button>
                        </li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={onSignInClick}
                  className={`flex items-center gap-2 px-4 lg:px-5 py-2 rounded-2xl font-semibold transition-all duration-300 ${
                    isScrolled ? "bg-red-800 text-white hover:bg-red-900 border border-transparent" : "bg-[#4a1d1f] text-white border border-white/80 hover:bg-[#6d2a2d]"
                  }`}>
                  <svg
                    className="w-4 h-4 lg:w-5 lg:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span className="hidden lg:inline">Sign In</span>
                  <span className="inline lg:hidden">Sign</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                className="p-2 rounded-lg transition-colors duration-200 hover:bg-white/10"
                onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 ">
            <div className={`p-4 rounded-4xl shadow-lg ${isScrolled ? "bg-white text-black" : "bg-white backdrop-blur-lg  text-black"}`}>
              <ul className="space-y-3">
                {navItems.map((item, index) => (
                  <li
                    key={index}
                    ref={item.dropdown ? productsRef : null}>
                    {item.dropdown ? (
                      <div>
                        <button
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"}`}
                          onClick={() => {
                            setIsProductsOpen((prev) => !prev);
                            setIsUserMenuOpen(false);
                          }}>
                          <span className="flex items-center justify-between">
                            {item.label}
                            <svg
                              className={`w-4 h-4 transition-transform duration-200 ${isProductsOpen ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </span>
                        </button>
                        <AnimatePresence>
                          {isProductsOpen && (
                            <motion.ul
                              variants={dropdownVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="mt-2 ml-4 space-y-1">
                              {item.dropdown.map((dropdownItem, dropdownIndex) => (
                                <li key={dropdownIndex}>
                                  <Link
                                    to={dropdownItem.to}
                                    onClick={(e) => {
                                      if (dropdownItem.action) {
                                        e.preventDefault();
                                        dropdownItem.action();
                                      }
                                    }}
                                    className={`block text-left px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"}`}>
                                    {dropdownItem.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={item.to}
                        onClick={(e) => {
                          if (item.action) {
                            e.preventDefault();
                            item.action();
                            setIsMenuOpen(false);
                          }
                        }}
                        className={`block text-left px-3 py-2 rounded-lg transition-colors duration-200 ${isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"}`}>
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}

                {/* Mobile User Menu or Sign In */}
                {userType === "user" ? (
                  <>
                    <li
                      className={`pt-2 ${isScrolled ? "border-t border-gray-200" : "border-t border-white/20"}`}
                      ref={userMenuRef}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"}`}
                        onClick={() => {
                          setIsUserMenuOpen((prev) => !prev);
                          setIsProductsOpen(false);
                        }}>
                        <span className="flex items-center justify-between">
                          Profile
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </span>
                      </button>
                      <AnimatePresence>
                        {isUserMenuOpen && (
                          <motion.ul
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="mt-2 ml-4 space-y-1">
                            <li>
                              <Link
                                to="/dashboard"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsUserMenuOpen(false);
                                  setIsMenuOpen(false);
                                }}
                                className={`block text-left px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"}`}>
                                Dashboard
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="/profile-settings"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsUserMenuOpen(false);
                                  setIsMenuOpen(false);
                                }}
                                className={`block text-left px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"}`}>
                                Profile Settings
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="/report"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsUserMenuOpen(false);
                                  setIsMenuOpen(false);
                                }}
                                className={`block text-left px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"}`}>
                                Report
                              </Link>
                            </li>
                            <li>
                              <button
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                                  isScrolled ? "hover:bg-red-50 text-red-600" : "hover:bg-red-500/20 text-red-300"
                                }`}
                                onClick={() => {
                                  onLogout && onLogout();
                                  setIsUserMenuOpen(false);
                                  setIsMenuOpen(false);
                                }}>
                                Sign Out
                              </button>
                            </li>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  </>
                ) : (
                  <li className={`pt-2 ${isScrolled ? "border-t border-gray-200" : "border-t border-white/20"}`}>
                    <button
                      onClick={onSignInClick}
                      className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                        isScrolled ? "bg-red-800 text-white hover:bg-red-900" : "bg-[#4a1d1f] text-white hover:bg-[#6d2a2d]"
                      }`}>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Sign In
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
