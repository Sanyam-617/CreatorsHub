import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Upload as UploadIcon,
  Calendar,
  Activity,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
// BUG FIX: removed Sidebar import and its manual render. AddAnalytics is now
// rendered inside MainLayout via React Router's <Outlet />, so MainLayout
// already provides the Sidebar. Rendering it again here created a duplicate
// sidebar overlay on this page only.
import API from "../api/axios";
import "../styles/AddAnalytics.css";

// BUG FIX: Platform metadata for display only — actual platformId comes from the API
const PLATFORM_META = {
  youtube: { label: "YouTube", icon: "▶", color: "#ff4444" },
  instagram: { label: "Instagram", icon: "◈", color: "#cc66ff" },
  twitter: { label: "Twitter", icon: "✦", color: "#4da6ff" },
  facebook: { label: "Facebook", icon: "ƒ", color: "#4466ff" },
};

const REQUIRED_FIELDS = [
  { name: "views", label: "Views", placeholder: "e.g. 12000" },
  { name: "likes", label: "Likes", placeholder: "e.g. 850" },
  { name: "comments", label: "Comments", placeholder: "e.g. 120" },
  { name: "shares", label: "Shares", placeholder: "e.g. 340" },
  { name: "followers", label: "Followers", placeholder: "e.g. 5000" },
];

const OPTIONAL_FIELDS = [
  { name: "reach", label: "Reach", placeholder: "e.g. 18000 (optional)" },
  { name: "impressions", label: "Impressions", placeholder: "e.g. 24000 (optional)" },
];

export default function AddAnalytics() {
  const navigate = useNavigate();

  const [platforms, setPlatforms] = useState([]);
  const [platformsLoading, setPlatformsLoading] = useState(true);
  const [platformsError, setPlatformsError] = useState("");

  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [form, setForm] = useState({
    date: "",
    views: "",
    likes: "",
    comments: "",
    shares: "",
    followers: "",
    reach: "",
    impressions: "",
  });

  const [submitError, setSubmitError] = useState("");

  const [csvFile, setCsvFile] = useState(null);
  const [csvError, setCsvError] = useState("");
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({
    date: "", views: "", likes: "", comments: "", shares: "", followers: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    API.get("/platforms")
      .then((res) => {
        setPlatforms(res.data);
        if (res.data.length > 0) setSelectedPlatform(res.data[0]);
      })
      .catch((err) => {
        setPlatformsError(err.response?.data?.message || "Failed to load platforms.");
      })
      .finally(() => setPlatformsLoading(false));
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSubmitError("");
    setSuccessMsg("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      setCsvError("");
      setSuccessMsg("");

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const firstLine = text.split('\n')[0];
        const csvHeaders = firstLine.split(',').map(h => h.trim().replace(/"/g, ''));
        setHeaders(csvHeaders);
        setMapping({ date: "", views: "", likes: "", comments: "", shares: "", followers: "" });
      };
      reader.readAsText(file);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile || !selectedPlatform) return;

    const requiredFields = ['date', 'views', 'likes', 'comments', 'shares', 'followers'];
    const isMappingComplete = requiredFields.every(field => mapping[field] !== "");

    if (!isMappingComplete) {
      setCsvError("Please map all required columns");
      return;
    }

    setLoading(true);
    setCsvError("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("mapping", JSON.stringify(mapping));

    try {
      const res = await API.post(`/upload/${selectedPlatform._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg(`CSV uploaded successfully (${res.data.count} entries added)`);
      setCsvFile(null);
      setHeaders([]);
      setMapping({ date: "", views: "", likes: "", comments: "", shares: "", followers: "" });
    } catch (err) {
      setCsvError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const meta = selectedPlatform ? PLATFORM_META[selectedPlatform.platformName] : null;
  const accentColor = meta?.color || null;

  const isFormReady =
    selectedPlatform &&
    form.date &&
    REQUIRED_FIELDS.every((f) => form[f.name] !== "");

  const handleSubmit = async () => {
    if (!isFormReady) return;

    setLoading(true);
    setSubmitError("");
    setSuccessMsg("");

    try {
      await API.post("/analytics", {
        platformId: selectedPlatform._id,
        date: form.date,
        views: Number(form.views),
        likes: Number(form.likes),
        comments: Number(form.comments),
        shares: Number(form.shares),
        followers: Number(form.followers),
        reach: form.reach ? Number(form.reach) : 0,
        impressions: form.impressions ? Number(form.impressions) : 0,
      });

      setSuccessMsg("Entry added successfully");
      setForm({
        date: "", views: "", likes: "", comments: "",
        shares: "", followers: "", reach: "", impressions: "",
      });
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // BUG FIX: removed the outer <div className="dashboard-layout"> wrapper and
  // the <Sidebar /> render — both are now provided by MainLayout. The component
  // now renders only its own page content, consistent with other page components.
  return (
    <div className="aa-main">
      {/* Page header */}
      <div className="aa-page-header">
        <button className="aa-back-btn" onClick={() => navigate("/analytics")}>
          <ChevronLeft size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          Back to Analytics
        </button>
        <h1 className="aa-page-title">Add Analytics Entry</h1>
        <p className="aa-page-sub">
          Log your social media numbers for a specific date and platform.
        </p>
      </div>

      {/* Platforms loading / error states */}
      {platformsLoading && (
        <div style={{ color: "rgba(255,255,255,0.4)", padding: "2rem 0" }}>
          Loading your platforms…
        </div>
      )}

      {!platformsLoading && platformsError && (
        <div className="aa-error-banner">{platformsError}</div>
      )}

      {!platformsLoading && !platformsError && platforms.length === 0 && (
        <div className="aa-error-banner">
          You have no platforms connected yet.{" "}
          <button
            style={{ background: "none", border: "none", color: "#fff", textDecoration: "underline", cursor: "pointer" }}
            onClick={() => navigate("/platforms")}
          >
            Add a platform first.
          </button>
        </div>
      )}

      {successMsg && (
        <div className="aa-submit-success" style={{ marginBottom: "1.5rem" }}>
          {successMsg}
        </div>
      )}

      {!platformsLoading && platforms.length > 0 && (
        <div className="aa-layout">

          {/* ── Step 1: Pick Platform ── */}
          <div className="aa-card rounded-2xl shadow-lg p-6">
            <div className="aa-card-header">
              <div className="aa-step-icon" style={accentColor ? { background: accentColor + "15", color: accentColor } : {}}>
                <PlusCircle size={20} />
              </div>
              <div>
                <h2 className="aa-card-title">Select Platform</h2>
                <p className="aa-card-sub">Which platform is this data for?</p>
              </div>
            </div>

            <div className="aa-platform-grid">
              {platforms.map((p) => {
                const m = PLATFORM_META[p.platformName];
                const isActive = selectedPlatform?._id === p._id;
                return (
                  <button
                    key={p._id}
                    className={`aa-platform-btn ${isActive ? "active" : ""}`}
                    style={isActive ? {
                      borderColor: m?.color,
                      background: (m?.color || "#fff") + "12",
                    } : {}}
                    onClick={() => {
                      setSelectedPlatform(p);
                      setSubmitError("");
                      setSuccessMsg("");
                    }}
                  >
                    <span className="aa-plat-icon" style={{ color: m?.color }}>
                      {m?.icon}
                    </span>
                    <span className="aa-plat-label">{m?.label || p.platformName}</span>
                    <span className="aa-plat-handle" style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem" }}>
                      {p.handle}
                    </span>
                    {isActive && (
                      <span className="aa-plat-check" style={{ color: m?.color }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── CSV Upload Section ── */}
          <div className={`aa-card rounded-2xl shadow-lg p-6 ${!selectedPlatform ? "aa-card-locked" : ""}`}>
            <div className="aa-card-header">
              <div className="aa-step-icon" style={accentColor ? { background: accentColor + "15", color: accentColor } : {}}>
                <UploadIcon size={20} />
              </div>
              <div>
                <h2 className="aa-card-title">Upload CSV</h2>
                <p className="aa-card-sub">Bulk import your data from a .csv file.</p>
              </div>
            </div>

            <div className="aa-csv-upload-wrap">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="aa-file-input"
                id="csv-file-input"
              />
              <label htmlFor="csv-file-input" className="aa-file-label">
                {csvFile ? csvFile.name : "Choose CSV File"}
              </label>

              {csvError && <div className="aa-submit-error">{csvError}</div>}

              {headers.length > 0 && (
                <div className="aa-mapping-section">
                  <h3 className="aa-mapping-title">Map your CSV columns</h3>
                  <div className="aa-mapping-grid">
                    {[
                      { key: 'date', label: 'Date' },
                      { key: 'views', label: 'Views' },
                      { key: 'likes', label: 'Likes' },
                      { key: 'comments', label: 'Comments' },
                      { key: 'shares', label: 'Shares' },
                      { key: 'followers', label: 'Followers' },
                    ].map(field => (
                      <div key={field.key} className="aa-field">
                        <label className="aa-label">{field.label}</label>
                        <select
                          value={mapping[field.key]}
                          onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                          className="aa-select"
                          style={mapping[field.key] && accentColor ? { borderColor: accentColor + "60" } : {}}
                        >
                          <option value="">Select column...</option>
                          {headers.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleCsvUpload}
                disabled={!csvFile || loading}
                className="aa-upload-btn"
                style={csvFile && accentColor ? {
                  background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                  borderColor: 'transparent',
                } : {}}
              >
                <UploadIcon size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {loading ? "Uploading..." : "Upload CSV"}
              </button>
            </div>
          </div>

          {/* ── Step 2: Date ── */}
          <div className={`aa-card rounded-2xl shadow-lg p-6 ${!selectedPlatform ? "aa-card-locked" : ""}`}>
            <div className="aa-card-header">
              <div className="aa-step-icon" style={accentColor ? { background: accentColor + "15", color: accentColor } : {}}>
                <Calendar size={20} />
              </div>
              <div>
                <h2 className="aa-card-title">Select Date</h2>
                <p className="aa-card-sub">What date does this data represent?</p>
              </div>
            </div>

            <div className="aa-date-wrap">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="aa-date-input"
                disabled={!selectedPlatform}
                max={new Date().toISOString().split("T")[0]}
                style={form.date && accentColor ? { borderColor: accentColor + "80" } : {}}
              />
              {form.date && (
                <p className="aa-date-preview">
                  {new Date(form.date + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* ── Step 3: Required Metrics ── */}
          <div className={`aa-card rounded-2xl shadow-lg p-6 ${!form.date ? "aa-card-locked" : ""}`}>
            <div className="aa-card-header">
              <div className="aa-step-icon" style={accentColor ? { background: accentColor + "15", color: accentColor } : {}}>
                <Activity size={20} />
              </div>
              <div>
                <h2 className="aa-card-title">Core Metrics</h2>
                <p className="aa-card-sub">All fields are required.</p>
              </div>
            </div>

            <div className="aa-fields-grid">
              {REQUIRED_FIELDS.map((f) => (
                <div key={f.name} className="aa-field">
                  <label className="aa-label">{f.label}</label>
                  <input
                    type="number"
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    className="aa-input"
                    min="0"
                    disabled={!form.date}
                    style={form[f.name] && accentColor ? { borderColor: accentColor + "60" } : {}}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Step 4: Optional Metrics ── */}
          <div className={`aa-card rounded-2xl shadow-lg p-6 ${!form.date ? "aa-card-locked" : ""}`}>
            <div className="aa-card-header">
              <div className="aa-step-icon" style={accentColor ? { background: accentColor + "15", color: accentColor } : {}}>
                <PlusCircle size={20} />
              </div>
              <div>
                <h2 className="aa-card-title">Extended Metrics</h2>
                <p className="aa-card-sub">Optional — leave blank to skip.</p>
              </div>
            </div>

            <div className="aa-fields-grid aa-fields-two">
              {OPTIONAL_FIELDS.map((f) => (
                <div key={f.name} className="aa-field">
                  <label className="aa-label">
                    {f.label}
                    <span className="aa-optional-tag">optional</span>
                  </label>
                  <input
                    type="number"
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    className="aa-input"
                    min="0"
                    disabled={!form.date}
                    style={form[f.name] && accentColor ? { borderColor: accentColor + "60" } : {}}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Preview & Submit ── */}
          {isFormReady && (
            <div className="aa-card rounded-2xl shadow-lg p-6 aa-preview-card" style={{ borderColor: accentColor + "40" }}>
              <div className="aa-card-header">
                <div className="aa-step-icon" style={{ background: accentColor + "15", color: accentColor }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h2 className="aa-card-title">Review & Save</h2>
                  <p className="aa-card-sub">Check everything looks correct.</p>
                </div>
              </div>

              <div className="aa-preview-grid">
                <div className="aa-preview-row">
                  <span className="aa-preview-label">Platform</span>
                  <span className="aa-preview-val" style={{ color: accentColor, textTransform: "capitalize" }}>
                    {selectedPlatform.platformName}
                  </span>
                </div>
                <div className="aa-preview-row">
                  <span className="aa-preview-label">Handle</span>
                  <span className="aa-preview-val">{selectedPlatform.handle}</span>
                </div>
                <div className="aa-preview-row">
                  <span className="aa-preview-label">Date</span>
                  <span className="aa-preview-val">
                    {new Date(form.date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                </div>
                {REQUIRED_FIELDS.map((f) => (
                  <div key={f.name} className="aa-preview-row">
                    <span className="aa-preview-label">{f.label}</span>
                    <span className="aa-preview-val">
                      {parseInt(form[f.name]).toLocaleString()}
                    </span>
                  </div>
                ))}
                {form.reach && (
                  <div className="aa-preview-row">
                    <span className="aa-preview-label">Reach</span>
                    <span className="aa-preview-val">{parseInt(form.reach).toLocaleString()}</span>
                  </div>
                )}
                {form.impressions && (
                  <div className="aa-preview-row">
                    <span className="aa-preview-label">Impressions</span>
                    <span className="aa-preview-val">{parseInt(form.impressions).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {submitError && (
                <div className="aa-submit-error">{submitError}</div>
              )}

              <button
                className="aa-submit-btn"
                style={{
                  background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                  opacity: loading ? 0.6 : 1,
                  borderColor: 'transparent',
                }}
                onClick={handleSubmit}
                disabled={loading}
              >
                <CheckCircle2 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {loading ? "Saving..." : "Add Entry"}
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}