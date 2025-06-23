import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import { FiMap, FiLayers, FiMapPin, FiInfo, FiMaximize2, FiX, FiSearch } from "react-icons/fi";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import headerBg from "../../assets/img/header_bg.jpg";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Sample pangolin sighting data - focused on Palawan coordinates
const pangolinSightings = [
  {
    id: 1,
    lat: 10.8895,
    lng: 119.2521,
    title: "Pangolin Sighting - North Palawan",
    description: "Adult pangolin spotted near El Nido coastal area",
    date: "2024-01-15",
    status: "confirmed",
    region: "North Palawan",
  },
  {
    id: 2,
    lat: 9.7394,
    lng: 118.7378,
    title: "Pangolin Tracks - Central Palawan",
    description: "Fresh tracks found in Puerto Princesa forest preserve",
    date: "2024-01-12",
    status: "unconfirmed",
    region: "Central Palawan",
  },
  {
    id: 3,
    lat: 8.4542,
    lng: 117.7415,
    title: "Pangolin Den - South Palawan",
    description: "Possible den site discovered near Balabac Island",
    date: "2024-01-10",
    status: "confirmed",
    region: "South Palawan",
  },
  {
    id: 4,
    lat: 10.1693,
    lng: 119.0734,
    title: "Pangolin Family - North Palawan",
    description: "Mother with juvenile observed in Taytay area",
    date: "2024-01-08",
    status: "confirmed",
    region: "North Palawan",
  },
  {
    id: 5,
    lat: 9.0804,
    lng: 118.0886,
    title: "Pangolin Rescue - Central Palawan",
    description: "Injured pangolin rescued and rehabilitated",
    date: "2024-01-05",
    status: "confirmed",
    region: "Central Palawan",
  },
];

// Sample data similar to your backend structure
const regionDataMap = {
  "North Palawan": { dead: 15, alive: 28, scales: 12, illegalTrades: 8 },
  "Central Palawan": { dead: 22, alive: 35, scales: 18, illegalTrades: 12 },
  "South Palawan": { dead: 8, alive: 16, scales: 6, illegalTrades: 4 },
};

const regionCenters = {
  "North Palawan": [10.8, 119.4],
  "Central Palawan": [9.7, 118.7],
  "South Palawan": [8.7, 117.7],
};

const MapPage = () => {
  const [geoData, setGeoData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [showSightings, setShowSightings] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSighting, setSelectedSighting] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const mapRef = useRef(null);

  // Load GeoJSON data from the public folder
  useEffect(() => {
    fetch("/maps/Cluster_Of_Palawan.geojson")
      .then((response) => response.json())
      .then((data) => {
        setGeoData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading map data:", error);
        setIsLoading(false);
      });
  }, []);

  // Get color based on cluster name (from your original code)
  const getClusterColor = (clusterName) => {
    const clusterColors = {
      "North Palawan": "rgba(244, 173, 94, 0.8)",
      "Central Palawan": "rgba(156, 95, 50, 0.8)",
      "South Palawan": "rgba(63, 7, 3, 0.8)",
    };
    return clusterColors[clusterName] || "rgba(100, 116, 139, 0.8)";
  };

  // GeoJSON style function with hover and selection effects
  const geoJsonStyle = (feature) => {
    const regionName = feature.properties.Municipalities;
    const isSelected = selectedFeature?.properties.Municipalities === regionName;
    const isHovered = hoveredRegion === regionName;
    const color = getClusterColor(regionName);

    return {
      fillColor: color,
      weight: isHovered || isSelected ? 3 : 1,
      opacity: 1,
      color: isHovered || isSelected ? "#ff0000" : "#ffffff",
      fillOpacity: isHovered || isSelected ? 1 : 0.7,
    };
  };

  // Handle region interactions
  const onEachFeature = (feature, layer) => {
    const regionName = feature.properties.Municipalities;

    layer.on({
      mouseover: () => setHoveredRegion(regionName),
      mouseout: () => setHoveredRegion(null),
      click: () => {
        setSelectedFeature(feature);
        setSelectedRegion(regionName);
      },
    });
  };

  // Calculate total incidents across all regions
  const calculateTotalIncidents = () => {
    return Object.values(regionDataMap).reduce((total, region) => total + region.dead + region.alive + region.scales + region.illegalTrades, 0);
  };

  // Get chart data for selected region
  const getChartData = (regionName) => {
    const data = regionDataMap[regionName];
    if (!data) return null;

    return {
      labels: ["Dead", "Alive", "Scales", "Illegal Trades"],
      datasets: [
        {
          data: [data.dead, data.alive, data.scales, data.illegalTrades],
          backgroundColor: ["#ffa500", "#008000", "#8b4513", "#a52a2a"],
          borderWidth: 2,
          borderColor: "transparent",
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const regionName = selectedFeature?.properties.Municipalities;
            const data = regionDataMap[regionName];
            if (!data) return "";

            const total = Object.values(data).reduce((a, b) => a + b, 0);
            const value = context.raw;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery || !geoData) return;

    const searchResult = geoData.features.find((feature) => feature.properties.Municipalities.toLowerCase().includes(searchQuery.toLowerCase()));

    if (searchResult) {
      const regionName = searchResult.properties.Municipalities;
      const center = regionCenters[regionName];
      if (mapRef.current && center) {
        mapRef.current.flyTo(center, 9);
      }
      setSelectedFeature(searchResult);
      setSelectedRegion(regionName);
    } else {
      // Handle no result found, maybe a toast notification
      console.log("No region found");
    }
  };

  // Remove overlay
  const removeOverlay = () => {
    setSelectedFeature(null);
    setSelectedRegion("all");
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Header Section */}
      <div
        className="h-72 md:h-96 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${headerBg})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center mb-4">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight shadow-sm">Conservation Map</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-2 text-lg text-white/90 max-w-2xl">
            Explore data pangolin conservation areas across Palawan
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4  sm:px-6 lg:px-8 py-10 -mt-14 ">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className={`bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden ${isFullscreen ? "fixed top-0 left-0 right-0 bottom-0 z-50 flex flex-col" : ""}`}>
          {/* Map Controls Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-white/50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:items-center">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4 self-start">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Palawan Data</h2>
                  <p className="text-slate-600 text-sm">{selectedRegion === "all" ? "Clusters" : selectedRegion}</p>
                </div>
              </motion.div>

              {/* Controls */}
              <motion.div
                className="flex items-center gap-2 w-full sm:w-auto"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}>
                <form
                  onSubmit={handleSearch}
                  className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search region..."
                    className="w-full sm:w-48 pl-4 pr-10 py-2 bg-white/80 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 sm:focus:w-56"
                  />
                  <button
                    type="submit"
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-orange-600">
                    <FiSearch />
                  </button>
                </form>
              </motion.div>
            </div>
          </div>

          {/* Map Container */}
          <div className={`relative  ${isFullscreen ? "flex-grow" : "h-96 md:h-[500px] lg:h-[600px]"}`}>
            {isLoading ? (
              <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-20">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
                  <span className="text-slate-700 font-medium">Loading map data...</span>
                </div>
              </div>
            ) : (
              <MapContainer
                center={[9.7394, 118.7378]}
                zoom={8}
                minZoom={8}
                maxZoom={12}
                maxBounds={[
                  [7.5, 116.5], // Southwest corner
                  [12.5, 121.0], // Northeast corner
                ]}
                style={{ height: "100%", width: "100%", backgroundColor: "#f8fafc" }}
                className="z-10"
                zoomControl={false}
                attributionControl={false}
                ref={mapRef}>
                {geoData && (
                  <GeoJSON
                    data={geoData}
                    style={geoJsonStyle}
                    onEachFeature={onEachFeature}
                  />
                )}
              </MapContainer>
            )}

            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
              <button
                onClick={() => setIsInfoOpen(true)}
                className="p-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-md text-slate-700 hover:bg-white hover:text-orange-600 transition">
                <FiInfo className="w-5 h-5" />
              </button>
            </div>

            {/* Region Detail Overlay */}
            <AnimatePresence>
              {selectedFeature && (
                <motion.div
                  initial={{ opacity: 0, x: "100%" }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute top-0 right-0 h-full bg-white/70 backdrop-blur-xl shadow-lg z-20 w-80 sm:w-96 p-6 flex flex-col">
                  <div className="flex-shrink-0 flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl text-slate-800">{selectedFeature.properties.Municipalities}</h3>
                    <button
                      onClick={removeOverlay}
                      className="p-1.5 hover:bg-gray-200/50 rounded-full transition-colors">
                      <FiX className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>

                  <div className="flex-grow overflow-y-auto pr-2">
                    {regionDataMap[selectedFeature.properties.Municipalities] ? (
                      <>
                        <div className="text-center mb-6">
                          <p className="font-semibold text-slate-600">Total Poaching Incidents</p>
                          <p className="text-5xl font-bold text-orange-600 mt-1">{Object.values(regionDataMap[selectedFeature.properties.Municipalities]).reduce((a, b) => a + b, 0)}</p>
                          <p className="text-slate-500 mt-1 text-sm">
                            <b>{((Object.values(regionDataMap[selectedFeature.properties.Municipalities]).reduce((a, b) => a + b, 0) / calculateTotalIncidents()) * 100).toFixed(2)}%</b> of Palawan's
                            total
                          </p>
                        </div>

                        {/* Chart */}
                        <div className="relative h-56 sm:h-64 mb-4">
                          <Doughnut
                            data={getChartData(selectedFeature.properties.Municipalities)}
                            options={chartOptions}
                          />
                        </div>

                        {/* Chart Legend */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          {getChartData(selectedFeature.properties.Municipalities)?.labels.map((label, index) => {
                            const dataset = getChartData(selectedFeature.properties.Municipalities).datasets[0];
                            return (
                              <div
                                key={label}
                                className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: dataset.backgroundColor[index] }}></div>
                                <span className="text-slate-700 font-medium">{label}</span>
                                <span className="ml-auto text-slate-500">{dataset.data[index]}</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <p>No incident data available for this region.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Information Panel */}
            <AnimatePresence>
              {isInfoOpen && (
                <motion.div
                  initial={{ opacity: 0, x: "100%" }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute top-0 right-0 h-full bg-white/70 backdrop-blur-xl shadow-lg z-30 w-80 sm:w-96 p-6 flex flex-col">
                  <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="font-bold text-xl text-slate-800">Map Information</h3>
                    <button
                      onClick={() => setIsInfoOpen(false)}
                      className="p-1.5 hover:bg-gray-200/50 rounded-full transition-colors">
                      <FiX className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                  <div className="overflow-y-auto pr-2 flex-grow">
                    <div className="text-slate-700 space-y-4">
                      <div>
                        <h4 className="font-semibold mb-1">How It Works</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Click on a region to view its detailed statistics.</li>
                          <li>Hover over a region to highlight it.</li>
                          <li>Use the search bar to find and fly to a specific region.</li>
                          <li>Click the 'i' button to view this info panel.</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Map Purpose</h4>
                        <p className="text-sm">
                          This interactive map provides a visual representation of pangolin poaching incidents across the different regions of Palawan. It aims to raise awareness and provide data for
                          conservation efforts by highlighting areas with high incident rates.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Notes</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Data is based on records from various sources and is updated periodically.</li>
                          <li>The regional boundaries are for visualization purposes and may not be exact.</li>
                          <li>Incident numbers are for demonstration and may not reflect real-time data.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Selected Sighting Modal */}
      <AnimatePresence>
        {selectedSighting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSighting(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{selectedSighting.title}</h3>
              <p className="text-slate-600 mb-4">{selectedSighting.description}</p>
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Date: {selectedSighting.date}</span>
                <span className={`px-3 py-1 rounded-full ${selectedSighting.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{selectedSighting.status}</span>
              </div>
              <button
                onClick={() => setSelectedSighting(null)}
                className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapPage;
