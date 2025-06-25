import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiMapPin,
  FiCalendar,
  FiEye,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiSearch,
  FiX,
  FiAlertTriangle,
  FiClock,
  FiCamera,
  FiUser,
  FiPhone,
  FiMail,
  FiFileText,
  FiSend,
  FiHeart,
} from "react-icons/fi";
import headerBg from "../../assets/img/header_bg.jpg";
import pango3 from "../../assets/img/pango3.jpg";
import pango4 from "../../assets/img/pango4.jpg";
import pango6 from "../../assets/img/pango6.jpg";

// Modal for adding a new report
const AddReportModal = ({ isOpen, onClose }) => {
  const [reportData, setReportData] = useState({
    location: "",
    coordinates: "",
    date: "",
    time: "",
    condition: "",
    urgency: "normal",
    description: "",
    additionalNotes: "",
  });

  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setReportData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    console.log("Submitting report:", { ...reportData, images: uploadedImages });
    setTimeout(() => {
      setIsSubmitting(false);
      onClose(); // Close modal on success
    }, 2000);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
        handleInputChange("coordinates", coords);
      });
    }
  };

  const urgencyLevels = [
    { value: "low", label: "Low", color: "text-green-600", bg: "bg-green-50 border-green-200" },
    { value: "normal", label: "Normal", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
    { value: "high", label: "High", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
    { value: "emergency", label: "Emergency", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  ];

  const conditionOptions = [
    { value: "alive_healthy", label: "Healthy", icon: "🟢" },
    { value: "alive_injured", label: "Injured", icon: "🟡" },
    { value: "dead", label: "Dead", icon: "🔴" },
    { value: "trapped", label: "Trapped", icon: "⚠️" },
    { value: "unknown", label: "Unknown", icon: "❓" },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-200">
            <h2 className="text-xl font-bold text-gray-800">Submit a New Report</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <FiX className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {/* Urgency Level */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                <FiAlertTriangle className="mr-2 text-red-600" />
                Urgency Level
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {urgencyLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => handleInputChange("urgency", level.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      reportData.urgency === level.value ? `${level.bg} border-current ${level.color}` : "bg-white/80 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    }`}>
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 mb-6">
              {/* Sighting Details */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <FiMapPin className="mr-2 text-red-800" />
                  Location Details
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={reportData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Location Description (e.g., Near Malampaya Beach)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white/80"
                  />
                  <div className="relative">
                    <input
                      type="text"
                      value={reportData.coordinates}
                      onChange={(e) => handleInputChange("coordinates", e.target.value)}
                      placeholder="GPS Coordinates (Latitude, Longitude)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white/80"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="absolute right-2.5 top-2 px-2 py-1 bg-red-800 text-white text-xs rounded-md hover:bg-red-900">
                      Get GPS
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-5 md:mt-0">
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <FiCalendar className="mr-2 text-red-800" />
                  Date & Time
                </h3>
                <div className="space-y-4">
                  <input
                    type="date"
                    value={reportData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white/80"
                  />
                  <input
                    type="time"
                    value={reportData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white/80"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 mb-6">
              {/* Pangolin Details */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <FiHeart className="mr-2 text-red-800" />
                  Pangolin Condition
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {conditionOptions.map((condition) => (
                    <button
                      key={condition.value}
                      onClick={() => handleInputChange("condition", condition.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        reportData.condition === condition.value ? "bg-red-50 border-red-800 text-red-800" : "bg-white/80 border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}>
                      <div className="text-xl">{condition.icon}</div>
                      <div className="text-xs font-medium">{condition.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5 md:mt-0">
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <FiCamera className="mr-2 text-red-800" />
                  Photos
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors h-full flex flex-col justify-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-modal"
                  />
                  <label
                    htmlFor="image-upload-modal"
                    className="cursor-pointer">
                    <FiCamera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click or drag to upload</p>
                  </label>
                </div>
              </div>
            </div>

            {/* Photo Previews */}
            {uploadedImages.length > 0 && (
              <div className="mb-6 ">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Photo Previews</h3>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative">
                      <img
                        src={image.preview}
                        alt="Upload preview"
                        className="w-full h-20 object-cover rounded-md"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-md">
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-14 md:mt-0">
              <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                <FiFileText className="mr-2 text-red-800" />
                Description of Incident
              </h3>
              <textarea
                value={reportData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                placeholder="Describe the incident, surroundings, and the pangolin's behavior..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white/80 resize-none"
              />
            </div>
          </div>

          <div className="p-5 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl">
            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Cancel
              </button>
              <motion.button
                onClick={handleSubmitReport}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-[#4a1d1f] text-white px-6 py-2 rounded-lg hover:bg-[#6d2a2d] transition-colors font-medium disabled:opacity-50"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}>
                <FiSend className="w-5 h-5" />
                <span>{isSubmitting ? "Submitting..." : "Submit Report"}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ViewReportModal = ({ isOpen, onClose, report }) => {
  if (!isOpen || !report) return null;

  const getUrgencyTag = (urgency) => {
    const styles = {
      low: "text-green-700 bg-green-100",
      normal: "text-blue-700 bg-blue-100",
      high: "text-orange-700 bg-orange-100",
      emergency: "text-red-700 bg-red-100",
    };
    return <span className={`px-2.5 py-1 text-sm font-semibold rounded-full ${styles[urgency] || "text-gray-700 bg-gray-100"}`}>{urgency.charAt(0).toUpperCase() + urgency.slice(1)}</span>;
  };

  const getConditionIcon = (condition) => {
    const icons = {
      alive_healthy: { icon: "🟢", text: "Healthy" },
      alive_injured: { icon: "🟡", text: "Injured" },
      dead: { icon: "🔴", text: "Dead" },
      trapped: { icon: "⚠️", text: "Trapped" },
      unknown: { icon: "❓", text: "Unknown" },
    };
    return (
      <div className="flex items-center gap-2">
        <span
          title={icons[condition]?.text || "Unknown"}
          className="text-2xl">
          {icons[condition]?.icon || "❓"}
        </span>
        <span className="font-semibold text-gray-800">{icons[condition]?.text || "Unknown"}</span>
      </div>
    );
  };

  const getStatusTag = (status) => {
    const styles = {
      pending: "bg-yellow-500",
      under_review: "bg-blue-500",
      verified: "bg-green-500",
      resolved: "bg-purple-500",
    };
    return (
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${styles[status] || "bg-gray-500"}`}></span>
        <span className="text-sm font-medium text-gray-700">{status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}</span>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Report Details</h2>
              <p className="text-sm text-gray-500 font-mono mt-0.5">#{report.id.toString().padStart(4, "0")}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <FiX className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="font-semibold text-gray-600">Status</span>
                <div className="mt-1">{getStatusTag(report.status)}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Urgency</span>
                <div className="mt-1">{getUrgencyTag(report.urgency)}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Condition</span>
                <div className="mt-1">{getConditionIcon(report.condition)}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Location</span>
                <p className="text-gray-800 mt-1">{report.location}</p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <span className="font-semibold text-gray-600">Date & Time</span>
                <div className="flex items-center text-gray-800 mt-1">
                  <FiCalendar className="w-4 h-4 mr-1.5" />
                  <span>
                    {new Date(report.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at {report.time}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
                <FiFileText className="mr-2 text-red-800" />
                Description
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 text-base leading-relaxed">{report.description}</p>
            </div>

            {report.images && report.images.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
                  <FiCamera className="mr-2 text-red-800" />
                  Photos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {report.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Report Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-sm border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl mt-auto">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ReportPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("all");

  const [reports] = useState([
    {
      id: 1,
      date: "2024-12-01",
      time: "14:30",
      location: "Near Malampaya Beach, Puerto Princesa",
      urgency: "high",
      condition: "alive_injured",
      status: "under_review",
      description:
        "Found an injured pangolin near the beach area. It appears to have wounds on its side and was moving slowly. The area is frequented by tourists, which might pose a risk to the animal.",
      images: [pango3, pango4, pango6],
    },
    {
      id: 2,
      date: "2024-11-28",
      time: "09:15",
      location: "Tubbataha Reefs Natural Park",
      urgency: "emergency",
      condition: "trapped",
      status: "resolved",
      description: "Pangolin trapped in a large fishing net left on the shore. It is distressed but seems physically unharmed for now. Immediate assistance is required to free it.",
      images: [pango3, pango4],
    },
    {
      id: 3,
      date: "2024-11-25",
      time: "16:45",
      location: "Puerto Princesa City, near Iwahig Penal Colony",
      urgency: "normal",
      condition: "alive_healthy",
      status: "verified",
      description: "A healthy-looking pangolin was spotted crossing a dirt road. It quickly hid in the nearby bushes. No immediate threats were observed in the area.",
      images: [pango6],
    },
    {
      id: 4,
      date: "2024-11-20",
      time: "11:20",
      location: "El Nido, Palawan, near Nacpan Beach",
      urgency: "low",
      condition: "unknown",
      status: "pending",
      description: "Possible pangolin tracks and borrows found near the forest edge. Could not confirm a visual sighting of the animal itself. The tracks seem fresh.",
      images: [],
    },
    {
      id: 5,
      date: "2024-11-18",
      time: "18:00",
      location: "Sabang, Underground River Area",
      urgency: "normal",
      condition: "alive_healthy",
      status: "verified",
      description: "Spotted five pangolins during a night walk. They were foraging for ants and did not seem disturbed by our presence from a distance.",
      images: [pango3, pango4, pango6, pango3, pango4],
    },
  ]);

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const getUrgencyTag = (urgency) => {
    const styles = {
      low: "text-green-700 bg-green-100",
      normal: "text-blue-700 bg-blue-100",
      high: "text-orange-700 bg-orange-100",
      emergency: "text-red-700 bg-red-100",
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[urgency] || "text-gray-700 bg-gray-100"}`}>{urgency.charAt(0).toUpperCase() + urgency.slice(1)}</span>;
  };

  const getConditionIcon = (condition) => {
    const icons = {
      alive_healthy: { icon: "🟢", text: "Healthy" },
      alive_injured: { icon: "🟡", text: "Injured" },
      dead: { icon: "🔴", text: "Dead" },
      trapped: { icon: "⚠️", text: "Trapped" },
      unknown: { icon: "❓", text: "Unknown" },
    };
    return (
      <span
        title={icons[condition]?.text || "Unknown"}
        className="text-xl">
        {icons[condition]?.icon || "❓"}
      </span>
    );
  };

  const getStatusTag = (status) => {
    const styles = {
      pending: "bg-yellow-500",
      under_review: "bg-blue-500",
      verified: "bg-green-500",
      resolved: "bg-purple-500",
    };
    return (
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${styles[status] || "bg-gray-500"}`}></span>
        <span className="text-sm text-gray-600">{status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}</span>
      </div>
    );
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterUrgency === "all" || report.urgency === filterUrgency;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <AddReportModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <ViewReportModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        report={selectedReport}
      />

      {/* Hero Section */}
      <div
        className="h-72 md:h-96 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${headerBg})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight shadow-sm">
            My Reports
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-4 text-lg text-white/90 max-w-2xl">
            Track your pangolin reports
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header with Add Button and Filters */}
          <div className="p-5 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800/50 focus:border-transparent bg-white/80 w-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1">
                  <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800/50 focus:border-transparent bg-white/80 appearance-none w-full">
                    <option value="all">All Urgency</option>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <motion.button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex-shrink-0 flex items-center space-x-2 bg-[#4a1d1f] text-white px-5 py-2.5 rounded-xl hover:bg-[#6d2a2d] transition-colors font-medium"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}>
                  <FiPlus className="w-5 h-5" />
                  <span>New Report</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="p-6">
            {filteredReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: index * 0.05 } }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
                      {/* Card Header */}
                      <div className="flex items-center justify-end p-4 border-b border-slate-200">{getStatusTag(report.status)}</div>

                      {/* Card Body */}
                      <div className="p-4 flex-grow flex flex-col">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="text-3xl mt-1">{getConditionIcon(report.condition)}</div>
                          <div>
                            <p className="font-semibold text-gray-800 leading-tight">{report.location}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <FiCalendar className="w-4 h-4 mr-1.5" />
                              <span>
                                {new Date(report.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {report.time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-2 mb-4 flex-grow">{report.description}</p>
                        <div className="flex items-center justify-between">
                          {getUrgencyTag(report.urgency)}
                          {report.images.length > 0 && (
                            <div className="flex items-center text-sm text-gray-500">
                              <FiCamera className="w-4 h-4 mr-1.5" />
                              {report.images.length} photo{report.images.length > 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-3 bg-slate-50/70 rounded-b-2xl mt-auto">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(report)}
                            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            title="View Details">
                            <FiEye className="w-5 h-5" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Edit Report">
                            <FiEdit className="w-5 h-5" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete Report">
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <FiMapPin className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-800">No Reports Found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters, or submit a new report.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportPage;
