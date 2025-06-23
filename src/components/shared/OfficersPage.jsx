import React, { useState, useMemo } from "react";
import { FiUsers } from "react-icons/fi";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import pango3 from "../../assets/img/pango3.jpg";
import pango4 from "../../assets/img/pango4.jpg";
import pango6 from "../../assets/img/pango6.jpg";
import headerBg from "../../assets/img/header_bg.jpg";

// Dummy data - replace with your actual data source
const allOfficers = [
  {
    id: 1,
    year: "2024",
    name: "Alexandria Doe",
    position: "President",
    imageUrl: pango3,
  },
  {
    id: 2,
    year: "2024",
    name: "Benjamin Smith",
    position: "Vice President",
    imageUrl: pango4,
  },
  {
    id: 3,
    year: "2024",
    name: "Samuel Green",
    position: "Secretary",
    imageUrl: pango6,
  },
  // Add more officers for 2024 as needed
  {
    id: 4,
    year: "2023",
    name: "Johnathan Roe",
    position: "President",
    imageUrl: pango3,
  },
  {
    id: 5,
    year: "2023",
    name: "Maria Moe",
    position: "Vice President",
    imageUrl: pango4,
  },
  {
    id: 6,
    year: "2024",
    name: "Eleanor Vance",
    position: "Adviser",
    imageUrl: pango3,
  },
  {
    id: 7,
    year: "2024",
    name: "Marcus Holloway",
    position: "Adviser",
    imageUrl: pango4,
  },
];

const positionOrder = ["Adviser", "President", "Vice President", "Secretary", "Treasurer", "Auditor", "Pio Internal", "Pio External", "Business Manager"];

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.15,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const OfficerCard = ({ officer }) => (
  <motion.div
    variants={cardVariants}
    className="group relative flex flex-col items-center text-center">
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden shadow-lg transition-transform duration-300 transform group-hover:scale-105">
      <img
        className="w-full h-full object-cover"
        src={officer.imageUrl}
        alt={officer.name}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-100 transition-opacity duration-300"></div>
    </div>
    <div className="mt-4">
      <h4 className="text-xl font-bold text-slate-800">{officer.name}</h4>
      <p className="text-md font-semibold text-red-800">{officer.position}</p>
    </div>
  </motion.div>
);

const OfficersPage = () => {
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const availableYears = useMemo(() => {
    const years = new Set(allOfficers.map((officer) => officer.year));
    return Array.from(years).sort((a, b) => b - a);
  }, []);

  const filteredOfficers = useMemo(() => {
    return allOfficers.filter((officer) => officer.year === selectedYear).sort((a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position));
  }, [selectedYear]);

  const advisers = filteredOfficers.filter((o) => o.position === "Adviser");

  const executiveOfficers = filteredOfficers.filter((o) => o.position === "President" || o.position === "Vice President");

  const committeeOfficers = filteredOfficers.filter((o) => o.position !== "Adviser" && o.position !== "President" && o.position !== "Vice President");

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div
        className="h-72 md:h-96 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${headerBg})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight shadow-sm">
            Meet the Team
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-4 text-lg text-white/90 max-w-2xl">
            The dedicated individuals leading the Guardians of the Palawan Pangolin Guild.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-between mb-12 p-4 px-6 bg-white/80 backdrop-blur-sm rounded-4xl shadow-md border border-slate-200 sticky top-24 z-10">
          <div className="flex items-center text-slate-800">
            <FiUsers className="w-6 h-6 mr-3 text-red-800" />
            <h2 className="text-xl md:text-2xl font-bold">GPPG Officers {selectedYear}</h2>
          </div>
          <div className="relative mt-4 sm:mt-0">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none cursor-pointer w-full sm:w-auto bg-white border border-slate-300 rounded-xl py-2 pl-4 pr-10 text-slate-700 leading-tight focus:outline-none focus:ring focus:ring-red-500 focus:border-red-500 transition-all">
              {availableYears.map((year) => (
                <option
                  key={year}
                  value={year}>
                  {year === currentYear ? `Current Year (${year})` : year}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Advisers Section */}
        {advisers.length > 0 && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mb-12">
            <h3 className="text-3xl font-bold text-slate-700 mb-8 text-center tracking-tight">Advisers</h3>
            <div className="flex flex-wrap gap-12 lg:gap-20 justify-center items-start">
              {advisers.map((officer) => (
                <OfficerCard
                  key={officer.id}
                  officer={officer}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Separator */}
        {advisers.length > 0 && (executiveOfficers.length > 0 || committeeOfficers.length > 0) && <hr className="border-t-2 border-slate-200 my-16" />}

        {/* Officers Section */}
        {(executiveOfficers.length > 0 || committeeOfficers.length > 0) && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            viewport={{ once: true, amount: 0.2 }}>
            <h3 className="text-3xl font-bold text-slate-700 mb-12 text-center tracking-tight">Officers</h3>

            {/* Executive Officers */}
            {executiveOfficers.length > 0 && (
              <div className="mb-16 flex flex-wrap gap-12 lg:gap-20 justify-center items-start">
                {executiveOfficers.map((officer) => (
                  <OfficerCard
                    key={officer.id}
                    officer={officer}
                  />
                ))}
              </div>
            )}

            {/* Committee Officers */}
            {committeeOfficers.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 justify-center">
                {committeeOfficers.map((officer) => (
                  <OfficerCard
                    key={officer.id}
                    officer={officer}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {filteredOfficers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-slate-500">No officers found for the selected year.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficersPage;
