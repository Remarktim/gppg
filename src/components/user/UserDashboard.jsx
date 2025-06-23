import React from "react";
import headerBg from "../../assets/img/header_bg.jpg";
import PangolinInfo from "../shared/PangolinInfo";

const UserDashboard = () => {
  return (
    <div className="font-sans text-gray-800 text-center">
      {/* Hero Section with background image */}
      <header className="relative h-[450px] md:h-[550px] flex items-center justify-center">
        <img
          src={headerBg}
          alt="PPG Hero Background"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-black/50 " />
        <div className="relative z-20 flex flex-col items-center justify-center w-full h-full pt-24">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">Welcome to Guardians of the Palawan Pangolin Guild</h1>
          <p className="text-md md:text-xl mt-4 text-white drop-shadow">This website is all about Palawan pangolin and it have reports</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-white text-gray-800">
        <PangolinInfo />
      </main>
    </div>
  );
};

export default UserDashboard;
