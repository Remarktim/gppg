import React, { useEffect, useMemo, useState, useRef } from "react";
import { FiHeart, FiXCircle, FiAlertOctagon, FiAlertTriangle, FiSearch, FiUpload, FiFile, FiDownload } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

// Palawan Municipalities from GeoJSON data
const PALAWAN_MUNICIPALITIES = [
  "Puerto Princesa City",
  "Agutaya",
  "Araceli",
  "Busuanga",
  "Cagayancillo",
  "Coron",
  "Culion",
  "Cuyo",
  "Dumaran",
  "El Nido",
  "Kalayaan",
  "Linapacan",
  "Magsaysay",
  "Narra",
  "Quezon",
  "Rizal",
  "Roxas",
  "San Vicente",
  "Sofronio Española",
  "Taytay",
].sort();

const StatusBadge = ({ status }) => {
  const styleBy = {
    Alive: { bg: "#dcfce7", color: "#065f46" },
    Dead: { bg: "#fee2e2", color: "#991b1b" },
    "Illegal Trades": { bg: "#fef3c7", color: "#92400e" },
    Poaching: { bg: "#dbeafe", color: "#1e3a8a" },
  };
  const s = styleBy[status] || { bg: "#eef2ff", color: "#3730a3" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
    <div
      className="h-10 w-10 grid place-items-center rounded-lg"
      style={{ background: "#f3f4f6", color }}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className="text-2xl font-bold"
        style={{ color }}>
        {value}
      </p>
    </div>
  </div>
);

const AdminPangolins = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pangolins, setPangolins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isGeneratingTag, setIsGeneratingTag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagError, setTagError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [newRecord, setNewRecord] = useState({
    tag_id: "",
    municipality: "",
    status: "alive",
    found_at: new Date().toISOString().slice(0, 16),
  });

  // Import state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importSuccess, setImportSuccess] = useState(0);

  // Generate municipality code from municipality name
  const getMunicipalityCode = (municipality) => {
    if (!municipality) return "PP";

    // Create a 2-3 letter code from municipality name
    const codeMap = {
      "Puerto Princesa City": "PPC",
      Agutaya: "AGT",
      Araceli: "ARC",
      Busuanga: "BSG",
      Cagayancillo: "CGY",
      Coron: "COR",
      Culion: "CUL",
      Cuyo: "CUY",
      Dumaran: "DUM",
      "El Nido": "ELN",
      Kalayaan: "KLY",
      Linapacan: "LIN",
      Magsaysay: "MAG",
      Narra: "NAR",
      Quezon: "QUE",
      Rizal: "RIZ",
      Roxas: "ROX",
      "San Vicente": "SVC",
      "Sofronio Española": "SOF",
      Taytay: "TAY",
    };

    return codeMap[municipality] || "PP";
  };

  // Generate next tag ID for specific municipality
  const generateNextTagId = async (municipality) => {
    try {
      if (!municipality) {
        throw new Error("Municipality is required to generate tag ID");
      }

      const municipalityCode = getMunicipalityCode(municipality);

      // Get existing tags for this municipality from loaded data
      const existingTags = pangolins.map((p) => p.tag).filter((tag) => tag && tag.startsWith(`${municipalityCode}-`));

      // If no local data, fetch from database with error handling
      if (existingTags.length === 0) {
        try {
          const { data, error } = await supabase.from("pangolins").select("tag_id").like("tag_id", `${municipalityCode}-%`).order("created_at", { ascending: false }).limit(100);

          if (error) {
            console.warn("Database fetch failed, using local data only:", error.message);
          } else if (data) {
            existingTags.push(...data.map((r) => r.tag_id).filter(Boolean));
          }
        } catch (dbError) {
          console.warn("Database connection failed, using local data only:", dbError.message);
        }
      }

      // Find highest number for this municipality
      let maxNum = 0;
      for (const tag of existingTags) {
        const match = String(tag).match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!Number.isNaN(num)) maxNum = Math.max(maxNum, num);
        }
      }

      const next = (maxNum + 1).toString().padStart(3, "0");
      return `${municipalityCode}-${next}`;
    } catch (error) {
      console.error("Error generating tag ID:", error);
      throw new Error(`Failed to generate tag ID: ${error.message}`);
    }
  };

  const openAddModal = async () => {
    // Reset all errors and states
    setError("");
    setTagError("");
    setValidationErrors({});

    // Reset form with first municipality selected
    const firstMunicipality = PALAWAN_MUNICIPALITIES[0];
    setNewRecord({
      tag_id: "",
      municipality: firstMunicipality,
      status: "alive",
      found_at: new Date().toISOString().slice(0, 16),
    });

    setIsAddOpen(true);

    // Auto-generate tag ID for the first municipality
    try {
      setIsGeneratingTag(true);
      const tagId = await generateNextTagId(firstMunicipality);
      setNewRecord((prev) => ({ ...prev, tag_id: tagId }));
    } catch (error) {
      setTagError(`Failed to generate tag ID: ${error.message}`);
      // Fallback to manual entry
      setNewRecord((prev) => ({ ...prev, tag_id: "" }));
    } finally {
      setIsGeneratingTag(false);
    }
  };

  // Handle municipality change and auto-generate new tag ID
  const handleMunicipalityChange = async (municipality) => {
    setNewRecord((prev) => ({ ...prev, municipality }));
    setTagError("");
    setValidationErrors((prev) => ({ ...prev, municipality: "" }));

    if (municipality) {
      try {
        setIsGeneratingTag(true);
        const newTagId = await generateNextTagId(municipality);
        setNewRecord((prev) => ({ ...prev, tag_id: newTagId }));
      } catch (error) {
        setTagError(`Failed to generate tag ID: ${error.message}`);
        // Allow manual entry as fallback
        setNewRecord((prev) => ({ ...prev, tag_id: "" }));
      } finally {
        setIsGeneratingTag(false);
      }
    } else {
      setNewRecord((prev) => ({ ...prev, tag_id: "" }));
    }
  };

  const dbStatusToLabel = (s) => {
    if (s === "alive") return "Alive";
    if (s === "dead") return "Dead";
    if (s === "illegal_trade") return "Illegal Trades";
    if (s === "poaching") return "Poaching";
    return s;
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const { data, error } = await supabase.from("pangolins").select("id, tag_id, municipality, found_at, status").order("found_at", { ascending: false });

      if (error) {
        if (error.code === "PGRST116") {
          throw new Error("Pangolins table not found. Please check your database setup.");
        }
        if (error.code === "42501") {
          throw new Error("Access denied. Please check your database permissions.");
        }
        if (error.message?.includes("JWT")) {
          throw new Error("Authentication expired. Please refresh the page and try again.");
        }
        throw new Error(`Database error: ${error.message}`);
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from database");
      }

      const rows = data.map((r) => {
        try {
          return {
            id: r.id,
            tag: r.tag_id || "—",
            municipality: r.municipality || "—",
            date: r.found_at ? new Date(r.found_at).toLocaleDateString() : "—",
            status: dbStatusToLabel(r.status),
          };
        } catch (rowError) {
          console.warn("Error processing row:", r, rowError);
          return {
            id: r.id || "unknown",
            tag: "—",
            municipality: "—",
            date: "—",
            status: "Unknown",
          };
        }
      });

      setPangolins(rows);
    } catch (err) {
      console.error("Load pangolins error:", err);
      let errorMessage = "Failed to load pangolins.";

      if (err.message?.includes("fetch")) {
        errorMessage = "Network connection failed. Please check your internet connection.";
      } else if (err.message?.includes("Supabase")) {
        errorMessage = "Database connection failed. Please check Supabase configuration.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setPangolins([]); // Set empty array as fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    return pangolins.reduce(
      (acc, p) => {
        if (p.status === "Alive") acc.alive += 1;
        else if (p.status === "Dead") acc.dead += 1;
        else if (p.status === "Illegal Trades") acc.illegalTrades += 1;
        else if (p.status === "Poaching") acc.poaching += 1;
        return acc;
      },
      { alive: 0, dead: 0, illegalTrades: 0, poaching: 0 }
    );
  }, [pangolins]);

  const filtered = useMemo(() => {
    return pangolins.filter((p) => {
      const matchQuery = `${p.tag} ${p.municipality}`.toLowerCase().includes(query.toLowerCase());
      const matchStatus = statusFilter ? p.status === statusFilter : true;
      return matchQuery && matchStatus;
    });
  }, [pangolins, query, statusFilter]);

  // Validate form inputs
  const validateForm = () => {
    const errors = {};

    if (!newRecord.tag_id?.trim()) {
      errors.tag_id = "Tag ID is required";
    } else if (!/^[A-Z]{2,3}-\d{3}$/.test(newRecord.tag_id.trim())) {
      errors.tag_id = "Tag ID must be in format like 'PPC-001' or 'AGT-001'";
    }

    if (!newRecord.municipality?.trim()) {
      errors.municipality = "Municipality is required";
    }

    if (!newRecord.found_at) {
      errors.found_at = "Found date/time is required";
    } else {
      const foundDate = new Date(newRecord.found_at);
      const now = new Date();
      if (foundDate > now) {
        errors.found_at = "Found date cannot be in the future";
      }
      if (foundDate < new Date("2000-01-01")) {
        errors.found_at = "Found date seems too old";
      }
    }

    return errors;
  };

  // Parse CSV content
  const parseCSV = (content) => {
    const lines = content.split("\n").filter((line) => line.trim());
    if (lines.length < 2) throw new Error("CSV must have at least a header and one data row");

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredHeaders = ["tag_id", "municipality", "status"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
    }

    return lines.slice(1).map((line, index) => {
      const values = line.split(",").map((v) => v.trim());
      const row = {};

      headers.forEach((header, i) => {
        row[header] = values[i] || "";
      });

      return { ...row, _rowIndex: index + 2 }; // +2 for header and 0-based index
    });
  };

  // Validate import row
  const validateImportRow = (row, rowIndex) => {
    const errors = [];

    if (!row.tag_id?.trim()) {
      errors.push(`Row ${rowIndex}: Tag ID is required`);
    } else if (!/^[A-Z]{2,3}-\d{3}$/.test(row.tag_id.trim())) {
      errors.push(`Row ${rowIndex}: Tag ID must be in format like 'PPC-001'`);
    }

    if (!row.municipality?.trim()) {
      errors.push(`Row ${rowIndex}: Municipality is required`);
    } else if (!PALAWAN_MUNICIPALITIES.includes(row.municipality.trim())) {
      errors.push(`Row ${rowIndex}: Invalid municipality '${row.municipality}'`);
    }

    const validStatuses = ["alive", "dead", "illegal_trade", "poaching"];
    if (!row.status?.trim() || !validStatuses.includes(row.status.trim().toLowerCase())) {
      errors.push(`Row ${rowIndex}: Status must be one of: ${validStatuses.join(", ")}`);
    }

    if (row.found_at) {
      const date = new Date(row.found_at);
      if (isNaN(date.getTime())) {
        errors.push(`Row ${rowIndex}: Invalid found_at date format`);
      } else if (date > new Date()) {
        errors.push(`Row ${rowIndex}: Found date cannot be in the future`);
      }
    }

    return errors;
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    setImportPreview([]);
    setImportErrors([]);

    try {
      const content = await file.text();
      let data;

      if (file.name.endsWith(".csv")) {
        data = parseCSV(content);
      } else if (file.name.endsWith(".json")) {
        const jsonData = JSON.parse(content);
        if (!Array.isArray(jsonData)) {
          throw new Error("JSON file must contain an array of records");
        }
        data = jsonData.map((item, index) => ({ ...item, _rowIndex: index + 1 }));
      } else {
        throw new Error("Please select a CSV or JSON file");
      }

      // Validate all rows
      const allErrors = [];
      data.forEach((row) => {
        const rowErrors = validateImportRow(row, row._rowIndex);
        allErrors.push(...rowErrors);
      });

      setImportErrors(allErrors);
      setImportPreview(data.slice(0, 10)); // Show first 10 rows as preview
    } catch (error) {
      setImportErrors([`File parsing error: ${error.message}`]);
      setImportPreview([]);
    }
  };

  // Execute import
  const executeImport = async () => {
    if (!importFile || importErrors.length > 0) return;

    try {
      setIsImporting(true);
      const content = await importFile.text();
      let data;

      if (importFile.name.endsWith(".csv")) {
        data = parseCSV(content);
      } else {
        data = JSON.parse(content);
      }

      // Prepare records for insertion
      const records = data.map((row) => ({
        tag_id: row.tag_id?.trim() || null,
        municipality: row.municipality?.trim() || null,
        status: row.status?.trim().toLowerCase() || "alive",
        found_at: row.found_at ? new Date(row.found_at).toISOString() : new Date().toISOString(),
        ...(user?.id && { reporter_id: user.id }),
      }));

      // Insert in batches
      let successCount = 0;
      const batchSize = 50;
      const errors = [];

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        try {
          const { error } = await supabase.from("pangolins").insert(batch);
          if (error) {
            if (error.code === "23505") {
              errors.push(`Batch ${Math.floor(i / batchSize) + 1}: Duplicate tag IDs found`);
            } else {
              errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
            }
          } else {
            successCount += batch.length;
          }
        } catch (batchError) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${batchError.message}`);
        }
      }

      setImportSuccess(successCount);
      if (errors.length > 0) {
        setImportErrors(errors);
      } else {
        setImportErrors([]);
        // Close modal and refresh data after successful import
        setTimeout(() => {
          setIsImportOpen(false);
          loadData();
        }, 2000);
      }
    } catch (error) {
      setImportErrors([`Import failed: ${error.message}`]);
    } finally {
      setIsImporting(false);
    }
  };

  // Download sample CSV template
  const downloadSampleCSV = () => {
    const headers = ["tag_id", "municipality", "status", "found_at"];
    const sampleRow = ["PPC-001", "Puerto Princesa City", "alive", "2024-01-15T10:30:00"];
    const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pangolin_import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset import modal
  const resetImportModal = () => {
    setImportFile(null);
    setImportPreview([]);
    setImportErrors([]);
    setImportSuccess(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Open import modal
  const openImportModal = () => {
    resetImportModal();
    setIsImportOpen(true);
  };

  const onAdd = async (e) => {
    e?.preventDefault?.();
    setError("");
    setValidationErrors({});

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError("Please fix the validation errors below");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        tag_id: newRecord.tag_id?.trim() || null,
        municipality: newRecord.municipality?.trim() || null,
        status: newRecord.status,
        found_at: new Date(newRecord.found_at).toISOString(),
      };

      // Include reporter_id for authenticated Supabase users
      if (user?.id) {
        payload.reporter_id = user.id;
      }

      const { error } = await supabase.from("pangolins").insert(payload);
      if (error) {
        if (error.code === "23505" && error.message.includes("tag_id")) {
          throw new Error("A pangolin with this Tag ID already exists. Please use a different Tag ID.");
        }
        if (error.code === "23503") {
          throw new Error("Database constraint error. Please contact administrator.");
        }
        if (error.message?.includes("JWT")) {
          throw new Error("Session expired. Please refresh the page and try again.");
        }
        throw new Error(`Database error: ${error.message}`);
      }

      setIsAddOpen(false);
      setNewRecord({
        tag_id: "",
        municipality: PALAWAN_MUNICIPALITIES[0],
        status: "alive",
        found_at: new Date().toISOString().slice(0, 16),
      });
      await loadData();
    } catch (err) {
      console.error("Insert pangolin error:", err);
      setError(err.message || "Failed to add pangolin. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pangolin Management</h1>
        <p className="text-gray-500 text-sm">Monitor pangolin cases and statuses</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
          {(error.includes("Network") || error.includes("Database") || error.includes("Failed to load")) && (
            <button
              onClick={loadData}
              className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-red-800 transition-colors"
              disabled={isLoading}>
              {isLoading ? "Retrying..." : "Retry"}
            </button>
          )}
        </div>
      )}

      {/* Admin mode banner hidden - using hardcoded admin login */}

      {/* KPI */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<FiHeart size={18} />}
          label="Alive"
          value={counts.alive}
          color="#10b981"
        />
        <StatCard
          icon={<FiXCircle size={18} />}
          label="Dead"
          value={counts.dead}
          color="#ef4444"
        />
        <StatCard
          icon={<FiAlertOctagon size={18} />}
          label="Illegal Trades"
          value={counts.illegalTrades}
          color="#f59e0b"
        />
        <StatCard
          icon={<FiAlertTriangle size={18} />}
          label="Poaching"
          value={counts.poaching}
          color="#3b82f6"
        />
      </section>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm flex-1">
            <FiSearch
              className="text-gray-400"
              size={16}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by tag or municipality..."
              className="w-full outline-none text-sm placeholder:text-gray-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm">
            <option value="">All Status</option>
            <option value="Alive">Alive</option>
            <option value="Dead">Dead</option>
            <option value="Illegal Trades">Illegal Trades</option>
            <option value="Poaching">Poaching</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="rounded-md bg-[#4a1d1f] text-white text-sm px-3 py-2 hover:bg-[#6d2a2d]">
            Add Pangolin
          </button>
          <button
            onClick={openImportModal}
            className="rounded-md bg-blue-600 text-white text-sm px-3 py-2 hover:bg-blue-700 flex items-center gap-1">
            <FiUpload size={14} />
            Import
          </button>
          <button className="rounded-md bg-gray-100 text-gray-800 text-sm px-3 py-2 hover:bg-gray-200">Export</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 px-4">Tag ID</th>
                <th className="py-2 px-4">Municipality</th>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-6 px-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{p.tag}</td>
                    <td className="py-3 px-4 text-gray-800">{p.municipality}</td>
                    <td className="py-3 px-4 text-gray-800">{p.date}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-gray-900 hover:underline">View</button>
                    </td>
                  </tr>
                ))
              )}
              {filtered.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan="5"
                    className="py-6 px-4 text-center text-gray-500">
                    No records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Pangolin</h3>
            <form
              className="space-y-4"
              onSubmit={onAdd}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag ID
                  {isGeneratingTag && <span className="text-xs text-blue-600 ml-2">(Generating...)</span>}
                </label>
                <input
                  value={newRecord.tag_id}
                  onChange={(e) => {
                    setNewRecord((v) => ({ ...v, tag_id: e.target.value }));
                    setValidationErrors((prev) => ({ ...prev, tag_id: "" }));
                    setTagError("");
                  }}
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#4a1d1f] focus:border-transparent ${validationErrors.tag_id ? "border-red-300" : "border-gray-300"}`}
                  placeholder="PPC-001"
                  disabled={isGeneratingTag}
                />
                {validationErrors.tag_id && <p className="text-red-500 text-xs mt-1">{validationErrors.tag_id}</p>}
                {tagError && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FiAlertTriangle className="flex-shrink-0" />
                    {tagError}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipality</label>
                <select
                  value={newRecord.municipality}
                  onChange={(e) => handleMunicipalityChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#4a1d1f] focus:border-transparent ${validationErrors.municipality ? "border-red-300" : "border-gray-300"}`}
                  required
                  disabled={isGeneratingTag}>
                  <option value="">Select Municipality</option>
                  {PALAWAN_MUNICIPALITIES.map((municipality) => (
                    <option
                      key={municipality}
                      value={municipality}>
                      {municipality}
                    </option>
                  ))}
                </select>
                {validationErrors.municipality && <p className="text-red-500 text-xs mt-1">{validationErrors.municipality}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newRecord.status}
                    onChange={(e) => setNewRecord((v) => ({ ...v, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4a1d1f] focus:border-transparent">
                    <option value="alive">Alive</option>
                    <option value="dead">Dead</option>
                    <option value="illegal_trade">Illegal Trade</option>
                    <option value="poaching">Poaching</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Found At</label>
                  <input
                    type="datetime-local"
                    value={newRecord.found_at}
                    onChange={(e) => {
                      setNewRecord((v) => ({ ...v, found_at: e.target.value }));
                      setValidationErrors((prev) => ({ ...prev, found_at: "" }));
                    }}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#4a1d1f] focus:border-transparent ${validationErrors.found_at ? "border-red-300" : "border-gray-300"}`}
                    max={new Date().toISOString().slice(0, 16)}
                  />
                  {validationErrors.found_at && <p className="text-red-500 text-xs mt-1">{validationErrors.found_at}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isGeneratingTag}
                  className="px-3 py-2 rounded-lg bg-[#4a1d1f] text-white hover:bg-[#6d2a2d] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
              {!user && <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-1 mt-2">ℹ️ Admin mode: Record will be created without reporter info.</p>}
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Import Pangolins</h3>
              <button
                onClick={() => setIsImportOpen(false)}
                className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <FiFile className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">Choose CSV or JSON file</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-xs text-gray-500">CSV files should have headers: tag_id, municipality, status, found_at (optional)</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={downloadSampleCSV}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                      <FiDownload size={14} />
                      Download Sample CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* File Info */}
              {importFile && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Selected File:</p>
                  <p className="text-sm text-gray-600">
                    {importFile.name} ({Math.round(importFile.size / 1024)} KB)
                  </p>
                </div>
              )}

              {/* Errors */}
              {importErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
                  <div className="max-h-32 overflow-y-auto">
                    {importErrors.map((error, index) => (
                      <p
                        key={index}
                        className="text-xs text-red-700">
                        • {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {importSuccess > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800">✅ Successfully imported {importSuccess} pangolin records!</p>
                </div>
              )}

              {/* Preview */}
              {importPreview.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Preview (first 10 rows):</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-1 px-2">Tag ID</th>
                          <th className="py-1 px-2">Municipality</th>
                          <th className="py-1 px-2">Status</th>
                          <th className="py-1 px-2">Found At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((row, index) => (
                          <tr
                            key={index}
                            className="border-t border-gray-200">
                            <td className="py-1 px-2 font-medium">{row.tag_id}</td>
                            <td className="py-1 px-2">{row.municipality}</td>
                            <td className="py-1 px-2">{row.status}</td>
                            <td className="py-1 px-2">{row.found_at || "Auto-generated"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setIsImportOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={executeImport}
                  disabled={!importFile || importErrors.length > 0 || isImporting || importSuccess > 0}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <FiUpload size={14} />
                      Import Records
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPangolins;
