import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

import LandingPage from "./components/public/LandingPage";
import LoginPage from "./components/public/LoginPage";
import SignUpPage from "./components/public/SignUpPage";
import ForgotPasswordPage from "./components/public/ForgotPasswordPage";
import UserDashboard from "./components/user/UserDashboard";
import Navbar from "./components/shared/Navbar";
import Footer from "./components/shared/Footer";
import AboutUsPage from "./components/shared/AboutUsPage";
import OfficersPage from "./components/shared/OfficersPage";
import GalleryPage from "./components/user/GalleryPage";
import ActivitiesPage from "./components/user/ActivitiesPage";
import TrendsPage from "./components/user/TrendsPage";
import MapPage from "./components/user/MapPage";
import ProfileSettingsPage from "./components/user/ProfileSettingsPage";
import ReportPage from "./components/user/ReportPage";
import Chatbot from "./components/shared/Chatbot";
import AdminLoginPage from "./components/admin/AdminLoginPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import AdminSettings from "./components/admin/AdminSettings";
import AdminReports from "./components/admin/AdminReports";
import AdminActivity from "./components/admin/AdminActivity";
import AdminHeader from "./components/admin/layout/AdminHeader";
import AdminSidebar from "./components/admin/layout/AdminSidebar";
import AdminMap from "./components/admin/AdminMap";
import AdminCommandPalette from "./components/admin/layout/AdminCommandPalette";
import AdminPangolins from "./components/admin/AdminPangolins";
import AdminProfile from "./components/admin/AdminProfile";

function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  const switchTo = (modalName) => {
    setActiveModal(modalName);
  };

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem("auth", JSON.stringify(userData));
    } catch {
      // ignore storage errors
    }
    closeModal();
    // The navigation will be handled by the component that calls this
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("auth");
    } catch {
      // ignore storage errors
    }
    // Redirect handled by route guards
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setCurrentUser(parsed);
        }
      }
    } catch {
      // ignore storage parse errors
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  // A simple protected route component
  const PrivateRoute = ({ children }) => {
    if (!isAuthReady) return null;
    // For now, any logged-in user can access user routes
    return currentUser ? children : <Navigate to="/" />;
  };

  const AdminRoute = ({ children }) => {
    if (!isAuthReady) return null;
    // In a real app, you'd have more robust role checks
    return currentUser && currentUser.role === "admin" ? children : <Navigate to="/admin/login" />;
  };

  const PublicLayout = () => (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Navbar
        onSignInClick={() => openModal("login")}
        userType={currentUser ? currentUser.role : "public"}
        onLogout={handleLogout}
      />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />

      <LoginPage
        isOpen={activeModal === "login"}
        onClose={closeModal}
        onSwitchToSignUp={() => switchTo("signup")}
        onSwitchToForgotPassword={() => switchTo("forgot-password")}
        onLogin={handleLogin}
      />
      <SignUpPage
        isOpen={activeModal === "signup"}
        onClose={closeModal}
        onSwitchToLogin={() => switchTo("login")}
      />
      <ForgotPasswordPage
        isOpen={activeModal === "forgot-password"}
        onClose={closeModal}
        onSwitchToLogin={() => switchTo("login")}
      />
    </div>
  );

  const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          onOpenPalette={() => setPaletteOpen(true)}
          user={currentUser}
        />
        <div className="flex">
          <AdminSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="flex-1 p-4 lg:p-6 lg:ml-80">
            <Outlet />
          </main>
        </div>
        <AdminCommandPalette
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onLogout={handleLogout}
        />
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Admin login (no admin layout) */}
        <Route
          path="/admin/login"
          element={<AdminLoginPage onLogin={handleLogin} />}
        />

        {/* Admin protected layout */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />
          <Route
            path="users"
            element={<UserManagement />}
          />
          <Route
            path="pangolins"
            element={<AdminPangolins />}
          />
          <Route
            path="settings"
            element={<AdminSettings />}
          />
          <Route
            path="profile"
            element={<AdminProfile currentUser={currentUser} />}
          />
          <Route
            path="reports"
            element={<AdminReports />}
          />
          <Route
            path="activity"
            element={<AdminActivity />}
          />
          <Route
            path="map"
            element={<AdminMap />}
          />
        </Route>

        {/* Public layout and routes */}
        <Route
          path="/"
          element={<PublicLayout />}>
          <Route
            index
            element={<LandingPage />}
          />
          <Route
            path="about"
            element={<AboutUsPage />}
          />
          <Route
            path="officers"
            element={<OfficersPage />}
          />

          <Route
            path="dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="gallery"
            element={
              <PrivateRoute>
                <GalleryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="activities"
            element={
              <PrivateRoute>
                <ActivitiesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="trends"
            element={
              <PrivateRoute>
                <TrendsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="map"
            element={
              <PrivateRoute>
                <MapPage />
              </PrivateRoute>
            }
          />
          <Route
            path="profile-settings"
            element={
              <PrivateRoute>
                <ProfileSettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="report"
            element={
              <PrivateRoute>
                <ReportPage />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Fallback redirect */}
        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
