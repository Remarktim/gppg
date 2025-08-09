import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import { FiSearch, FiRefreshCcw, FiAlertTriangle } from "react-icons/fi";
import "leaflet/dist/leaflet.css";
import Loader from "./common/Loader";
import { supabase } from "../../lib/supabase";

// Ensure default marker icons work when bundling (even though we draw polygons)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Admin map renders municipalities GeoJSON with simple search
const AdminMap = () => {
  const mapRef = useRef(null);
  const geoJsonRef = useRef(null);
  const layerByNameRef = useRef({});

  const [geoData, setGeoData] = useState(null);
  const [pangolinData, setPangolinData] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState(null);
  const [hoveredName, setHoveredName] = useState(null);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPangolins, setIsLoadingPangolins] = useState(true);
  const [error, setError] = useState("");
  const [filterMonths, setFilterMonths] = useState(6);

  // Load GeoJSON data
  useEffect(() => {
    setIsLoading(true);
    fetch("/maps/Municipals.geojson")
      .then((r) => r.json())
      .then((data) => setGeoData(data))
      .catch((err) => {
        console.error("Failed to load GeoJSON:", err);
        setError("Failed to load map data");
        setGeoData(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Load pangolin data from Supabase
  const loadPangolinData = useCallback(async () => {
    try {
      setIsLoadingPangolins(true);
      setError("");

      const { data, error: supabaseError } = await supabase.from("pangolins").select("id, tag_id, municipality, status, found_at, created_at").order("found_at", { ascending: false });

      if (supabaseError) {
        throw new Error(`Database error: ${supabaseError.message}`);
      }

      setPangolinData(data || []);
    } catch (err) {
      console.error("Failed to load pangolin data:", err);
      setError(`Failed to load pangolin data: ${err.message}`);
      setPangolinData([]);
    } finally {
      setIsLoadingPangolins(false);
    }
  }, []);

  useEffect(() => {
    loadPangolinData();
  }, [loadPangolinData]);

  const baseCenter = useMemo(() => [9.7394, 118.7378], []);

  const allMunicipalities = useMemo(() => {
    if (!geoData?.features) return [];
    const names = geoData.features.map((f) => f?.properties?.ADM3_EN).filter(Boolean);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [geoData]);

  // Filter pangolin data based on time period
  const filteredPangolinData = useMemo(() => {
    if (!pangolinData.length) return [];

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - filterMonths);

    return pangolinData.filter((pangolin) => {
      const foundDate = new Date(pangolin.found_at);
      return foundDate >= cutoffDate;
    });
  }, [pangolinData, filterMonths]);

  // Aggregate pangolin counts by municipality
  const pangolinCountsByMunicipality = useMemo(() => {
    const counts = {};

    filteredPangolinData.forEach((pangolin) => {
      const municipality = pangolin.municipality;
      if (!municipality) return;

      if (!counts[municipality]) {
        counts[municipality] = { alive: 0, dead: 0, illegalTrades: 0, poaching: 0, total: 0 };
      }

      counts[municipality].total += 1;

      switch (pangolin.status) {
        case "alive":
          counts[municipality].alive += 1;
          break;
        case "dead":
          counts[municipality].dead += 1;
          break;
        case "illegal_trade":
          counts[municipality].illegalTrades += 1;
          break;
        case "poaching":
          counts[municipality].poaching += 1;
          break;
        default:
          break;
      }
    });

    return counts;
  }, [filteredPangolinData]);

  // Dynamic styling based on pangolin density with system color palette (maroon theme on ocean)
  const getIntensityColor = useCallback((total) => {
    if (total === 0) return "#f8f9fa"; // Very light neutral for no data (visible on ocean)
    if (total <= 2) return "#fdf2f8"; // Very light rose for low data
    if (total <= 5) return "#fce7f3"; // Light rose for medium-low data
    if (total <= 10) return "#f9a8d4"; // Medium rose for medium data
    return "#ec4899"; // Strong rose for high density (maroon system compatible)
  }, []);

  // eslint-disable-next-line no-unused-vars
  const defaultStyle = useMemo(
    () => ({
      color: "#4a1d1f",
      weight: 2,
      fillColor: "#fdf2f8",
      fillOpacity: 0.9,
      dashArray: null,
      stroke: true,
      className: "transition-all duration-200 ease-in-out drop-shadow-lg",
    }),
    []
  );

  const hoverStyle = useMemo(
    () => ({
      color: "#7c2d12",
      weight: 3,
      fillColor: "#fef2f2",
      fillOpacity: 0.95,
      dashArray: null,
      stroke: true,
      className: "transition-all duration-200 ease-in-out drop-shadow-xl",
    }),
    []
  );

  const selectedStyle = useMemo(
    () => ({
      color: "#4a1d1f",
      weight: 4,
      fillColor: "#fecaca",
      fillOpacity: 0.95,
      dashArray: "8, 4",
      stroke: true,
      className: "transition-all duration-200 ease-in-out drop-shadow-2xl",
    }),
    []
  );

  const selectedCounts = useMemo(() => {
    if (!selectedName) return null;

    // Get counts from real pangolin data
    const counts = pangolinCountsByMunicipality[selectedName] || { alive: 0, dead: 0, illegalTrades: 0, poaching: 0, total: 0 };

    return counts;
  }, [selectedName, pangolinCountsByMunicipality]);

  const getStyle = useCallback(
    (feature) => {
      const name = feature?.properties?.ADM3_EN;
      if (selectedName === name) return selectedStyle;
      if (hoveredName === name) return hoverStyle;

      // Dynamic styling based on pangolin data
      const counts = pangolinCountsByMunicipality[name];
      const total = counts?.total || 0;
      const fillColor = getIntensityColor(total);

      return {
        color: total > 0 ? "#4a1d1f" : "#6b7280",
        weight: total > 0 ? 2.5 : 1.5,
        fillColor,
        fillOpacity: total > 0 ? 0.95 : 0.7,
        dashArray: null,
        stroke: true,
        className: "transition-all duration-300 ease-in-out drop-shadow-lg hover:drop-shadow-xl",
      };
    },
    [selectedName, hoveredName, selectedStyle, hoverStyle, pangolinCountsByMunicipality, getIntensityColor]
  );

  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.setStyle(getStyle);
    }
  }, [selectedName, hoveredName, getStyle]);

  const onEachFeature = (feature, layer) => {
    const name = feature.properties?.ADM3_EN;
    if (!name) return;
    layerByNameRef.current[name.toLowerCase()] = layer;

    layer.on({
      mouseover: () => setHoveredName(name),
      mouseout: () => setHoveredName(null),
      click: () => setSelectedName(name),
    });

    // Add sticky tooltip for better labeling while hovering
    try {
      if (typeof layer.bindTooltip === "function") {
        layer.bindTooltip(name, { sticky: true, direction: "top", opacity: 0.9 });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (selectedName) {
      const layer = layerByNameRef.current[selectedName.toLowerCase()];
      if (layer && mapRef.current) {
        const bounds = layer.getBounds?.();
        if (bounds) mapRef.current.flyToBounds(bounds.pad(0.05));
      }
    }
  }, [selectedName]);

  const handleSearch = (e) => {
    e.preventDefault();
    focusByName(query);
  };

  const focusByName = (nameInput) => {
    const key = (nameInput || "").trim().toLowerCase();
    if (!key) return;

    let finalName = null;

    const exactMatch = Object.keys(layerByNameRef.current).find((name) => name === key);
    if (exactMatch) {
      const layer = layerByNameRef.current[exactMatch];
      finalName = layer.feature?.properties?.ADM3_EN;
    } else {
      const partialMatch = Object.keys(layerByNameRef.current).find((name) => name.includes(key));
      if (partialMatch) {
        const layer = layerByNameRef.current[partialMatch];
        finalName = layer.feature?.properties?.ADM3_EN;
      }
    }

    if (finalName) {
      setSelectedName(finalName);
    }
  };

  const handleReset = () => {
    setSelectedName(null);
    setHoveredName(null);
    setQuery("");
    setIsSuggestOpen(false);
    setActiveIndex(-1);
    if (mapRef.current) mapRef.current.flyTo(baseCenter, 8);
  };

  const handleRefreshData = () => {
    loadPangolinData();
  };

  return (
    <div className="space-y-4">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRefreshData}
            className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-red-800 transition-colors"
            disabled={isLoadingPangolins}>
            {isLoadingPangolins ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}

      {/* Map */}
      <div className="rounded-2xl h-full overflow-hidden border-2 border-slate-200 shadow-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 relative ring-2 ring-slate-300/50">
        <div className="h-[88vh] w-full">
          {(isLoading || isLoadingPangolins) && (
            <div className="absolute inset-0 z-10">
              <Loader />
            </div>
          )}
          {/* Floating controls & details panel on the right */}
          <div className="absolute top-4 right-4 z-[1001] w-[min(92vw,400px)]">
            <div className="rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md p-3 shadow-xl space-y-3 ring-1 ring-white/20">
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2">
                <div className="relative flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm flex-1">
                  <FiSearch
                    className="text-gray-400"
                    size={16}
                  />
                  <input
                    value={query}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuery(val);
                      setIsSuggestOpen(!!val);
                      setActiveIndex(-1);
                    }}
                    onFocus={() => setIsSuggestOpen(!!query)}
                    onBlur={() => setTimeout(() => setIsSuggestOpen(false), 100)}
                    onKeyDown={(e) => {
                      if (!isSuggestOpen) return;
                      const list = allMunicipalities.filter((n) => n.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setActiveIndex((i) => (i + 1) % Math.max(list.length, 1));
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setActiveIndex((i) => (i <= 0 ? list.length - 1 : i - 1));
                      } else if (e.key === "Enter" && list.length > 0) {
                        const pick = activeIndex >= 0 ? list[activeIndex] : list[0];
                        setQuery(pick);
                        setIsSuggestOpen(false);
                        focusByName(pick);
                      } else if (e.key === "Escape") {
                        setIsSuggestOpen(false);
                      }
                    }}
                    placeholder="Search municipality..."
                    className="w-full outline-none text-sm placeholder:text-gray-400"
                  />
                  {isSuggestOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg ring-1 ring-black/5 max-h-60 overflow-auto z-20">
                      {allMunicipalities
                        .filter((n) => n.toLowerCase().includes(query.toLowerCase()))
                        .slice(0, 8)
                        .map((name, idx) => (
                          <button
                            type="button"
                            key={name}
                            className={`w-full text-left px-3 py-2 text-sm ${idx === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setQuery(name);
                              setIsSuggestOpen(false);
                              focusByName(name);
                            }}>
                            {name}
                          </button>
                        ))}
                      {allMunicipalities.filter((n) => n.toLowerCase().includes(query.toLowerCase())).length === 0 && <div className="px-3 py-2 text-sm text-gray-500">No matches</div>}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-[#4a1d1f] text-white text-sm px-3 py-2 hover:bg-[#6d2a2d] whitespace-nowrap">
                  Search
                </button>
              </form>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Time Period</span>
                    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setFilterMonths(3)}
                        className={`px-2.5 py-1 text-xs ${filterMonths === 3 ? "bg-[#4a1d1f] text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}>
                        3m
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterMonths(6)}
                        className={`px-2.5 py-1 text-xs ${filterMonths === 6 ? "bg-[#4a1d1f] text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}>
                        6m
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterMonths(12)}
                        className={`px-2.5 py-1 text-xs ${filterMonths === 12 ? "bg-[#4a1d1f] text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}>
                        12m
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={handleRefreshData}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#4a1d1f] text-white text-xs px-2 py-1 hover:bg-[#6d2a2d] disabled:opacity-50"
                      disabled={isLoadingPangolins}>
                      <FiRefreshCcw className={isLoadingPangolins ? "animate-spin" : ""} />
                      {isLoadingPangolins ? "Loading..." : "Refresh"}
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 rounded-lg bg-gray-100 text-gray-800 text-xs px-2 py-1 hover:bg-gray-200">
                      Reset
                    </button>
                  </div>
                </div>

                {/* Data Summary */}
                <div className="text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1">
                  Showing {filteredPangolinData.length} pangolin records from last {filterMonths} months
                </div>
              </div>
              {selectedName && (
                <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-3 shadow-sm">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500">Selected municipality</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Alive</p>
                      <p className="text-xl font-bold text-emerald-600">{selectedCounts.alive}</p>
                    </div>
                    <div className="rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Dead</p>
                      <p className="text-xl font-bold text-rose-600">{selectedCounts.dead}</p>
                    </div>
                    <div className="rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Illegal Trades</p>
                      <p className="text-xl font-bold text-amber-600">{selectedCounts.illegalTrades}</p>
                    </div>
                    <div className="rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Poaching</p>
                      <p className="text-xl font-bold text-sky-600">{selectedCounts.poaching}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Legend bottom-left */}
          <div className="pointer-events-none absolute bottom-4 left-4 z-[1001]">
            <div className="rounded-xl border border-gray-200 bg-white/95 backdrop-blur-md px-3 py-2 shadow-lg text-xs text-gray-700 ring-1 ring-white/20">
              <div className="space-y-2">
                <div className="font-medium text-gray-900">Pangolin Density</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1">
                    <span
                      className="inline-block h-3 w-3 rounded-sm shadow-md ring-1 ring-white/50"
                      style={{ background: "#f8f9fa", border: "2px solid #6b7280" }}></span>
                    No Data
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="inline-block h-3 w-3 rounded-sm shadow-md ring-1 ring-white/50"
                      style={{ background: "#fdf2f8", border: "2px solid #4a1d1f" }}></span>
                    1-2
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="inline-block h-3 w-3 rounded-sm shadow-md ring-1 ring-white/50"
                      style={{ background: "#fce7f3", border: "2px solid #4a1d1f" }}></span>
                    3-5
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="inline-block h-3 w-3 rounded-sm shadow-md ring-1 ring-white/50"
                      style={{ background: "#f9a8d4", border: "2px solid #4a1d1f" }}></span>
                    6-10
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="inline-block h-3 w-3 rounded-sm shadow-md ring-1 ring-white/50"
                      style={{ background: "#ec4899", border: "2px solid #4a1d1f" }}></span>
                    11+
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="inline-block h-3 w-3 rounded-sm shadow-lg ring-2 ring-maroon-500/50"
                      style={{ background: "#fecaca", border: "2px solid #4a1d1f" }}></span>
                    Selected
                  </div>
                </div>
              </div>
            </div>
          </div>
          <MapContainer
            attributionControl={false}
            center={baseCenter}
            zoom={8}
            minZoom={8}
            maxZoom={12}
            maxBounds={[
              [7.5, 116.5],
              [12.5, 121.0],
            ]}
            preferCanvas
            wheelDebounceTime={40}
            wheelPxPerZoomLevel={100}
            style={{
              height: "100%",
              width: "100%",
              background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 25%, #3b82f6 50%, #1e3a8a 75%, #0f172a 100%)",
              filter: "brightness(1.1) contrast(1.15) saturate(1.1)",
            }}
            ref={mapRef}>
            {geoData && (
              <GeoJSON
                ref={geoJsonRef}
                data={geoData}
                style={getStyle}
                onEachFeature={onEachFeature}
                renderer={L.canvas({ padding: 0.1 })}
                smoothFactor={0.2}
                updateWhenZoom={false}
                updateWhenIdle
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminMap;
