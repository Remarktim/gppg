import React, { useState } from "react";
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

function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("landing");

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  const switchTo = (modalName) => {
    setActiveModal(modalName);
  };

  const handleLogin = (userData) => {
    // Set user data (in a real app, this would come from authentication service)
    setCurrentUser(userData);
    // Close any open modals
    closeModal();
    // Navigate to user dashboard
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage("landing");
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <UserDashboard />;
      case "about":
        return <AboutUsPage />;
      case "officers":
        return <OfficersPage />;
      case "gallery":
        return <GalleryPage />;
      case "activities":
        return <ActivitiesPage />;
      case "trends":
        return <TrendsPage />;
      case "map":
        return <MapPage />;
      case "landing":
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Navbar
        onSignInClick={() => openModal("login")}
        userType={currentUser ? "user" : "public"}
        onLogout={handleLogout}
        navigateTo={navigateTo}
      />
      <main className="flex-grow">{renderPage()}</main>
      <Footer />

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
}

export default App;
