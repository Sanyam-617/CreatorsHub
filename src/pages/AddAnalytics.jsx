import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/addanalytics.css";

const PLATFORM_OPTIONS = [
  { value: "youtube",   label: "YouTube",   icon: "▶", color: "#ff4444" },
  { value: "instagram", label: "Instagram", icon: "◈", color: "#cc66ff" },
  { value: "twitter",   label: "Twitter",   icon: "✦", color: "#4da6ff" },
  { value: "facebook",  label: "Facebook",  icon: "ƒ", color: "#4466ff" },
];

const REQUIRED_FIELDS = [
  { name: "views",     label: "Views",     placeholder: "e.g. 12000" },
  { name: "likes",     label: "Likes",     placeholder: "e.g. 850" },
  { name: "comments",  label: "Comments",  placeholder: "e.g. 120" },
  { name: "shares",    label: "Shares",    placeholder: "e.g. 340" },
  { name: "followers", label: "Followers", placeholder: "e.g. 5000" },
];

const OPTIONAL_FIELDS = [
  { name: "reach",       label: "Reach",       placeholder: "e.g. 18000 (optional)" },
  { name: "impressions", label: "Impressions",  placeholder: "e.g. 24000 (optional)" },
];

export default function AddAnalytics() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [form, setForm] = useState({
    date:        "",
    views:       "",
    likes:       "",
    comments:    "",
    shares:      "",
    followers:   "",
    reach:       "",
    impressions: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const accentColor = selectedPlatform
    ? PLATFORM_OPTIONS.find((p) => p.value === selectedPlatform)?.color
    : null;

  const isFormReady =
    selectedPlatform &&
    form.date &&
    REQUIRED_FIELDS.every((f) => form[f.name] !== "");

  return (
    <div className="aa-page">

      {/* Navbar */}
      <nav className="dash-nav">
        <span className="dash-nav-logo">CreatorHub</span>
        <div className="dash-nav-actions">
          <button className="dash-nav-manage" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
          <button className="dash-nav-manage" onClick={() => navigate("/analytics")}>
            Analytics
          </button>
          <button className="dash-nav-manage" onClick={() => navigate("/platforms")}>
            Platforms
          </button>
          <button className="dash-nav-logout" onClick={() => { logout(); navigate("/login"); }}>
            Logout
          </button>
        </div>
      </nav>

      <main className="aa-main">

        {/* Page header */}
        <div className="aa-page-header">
          <button className="aa-back-btn" onClick={() => navigate("/analytics")}>
            ← Back to Analytics
          </button>
          <h1 className="aa-page-title">Add Analytics Entry</h1>
          <p className="aa-page-sub">
            Log your social media numbers for a specific date and platform.
          </p>
        </div>

        <div className="aa-layout">

          {/* ── Step 1: Pick Platform ── */}
          <div className="aa-card">
            <div className="aa-card-header">
              <span className="aa-step-num">1</span>
              <div>
                <h2 className="aa-card-title">Select Platform</h2>
                <p className="aa-card-sub">Which platform is this data for?</p>
              </div>
            </div>

            <div className="aa-platform-grid">
              {PLATFORM_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  className={`aa-platform-btn ${selectedPlatform === p.value ? "active" : ""}`}
                  style={selectedPlatform === p.value ? {
                    borderColor: p.color,
                    background:  p.color + "12",
                  } : {}}
                  onClick={() => setSelectedPlatform(p.value)}
                >
                  <span className="aa-plat-icon" style={{ color: p.color }}>
                    {p.icon}
                  </span>
                  <span className="aa-plat-label">{p.label}</span>
                  {selectedPlatform === p.value && (
                    <span className="aa-plat-check" style={{ color: p.color }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Step 2: Date ── */}
          <div className={`aa-card ${!selectedPlatform ? "aa-card-locked" : ""}`}>
            <div className="aa-card-header">
              <span className="aa-step-num" style={accentColor ? { borderColor: accentColor, color: accentColor } : {}}>2</span>
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
          <div className={`aa-card ${!form.date ? "aa-card-locked" : ""}`}>
            <div className="aa-card-header">
              <span className="aa-step-num" style={accentColor ? { borderColor: accentColor, color: accentColor } : {}}>3</span>
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
          <div className={`aa-card ${!form.date ? "aa-card-locked" : ""}`}>
            <div className="aa-card-header">
              <span className="aa-step-num" style={accentColor ? { borderColor: accentColor, color: accentColor } : {}}>4</span>
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
            <div className="aa-card aa-preview-card" style={{ borderColor: accentColor + "40" }}>
              <div className="aa-card-header">
                <span className="aa-step-num" style={{ borderColor: accentColor, color: accentColor }}>5</span>
                <div>
                  <h2 className="aa-card-title">Review & Save</h2>
                  <p className="aa-card-sub">Check everything looks correct.</p>
                </div>
              </div>

              {/* Summary */}
              <div className="aa-preview-grid">
                <div className="aa-preview-row">
                  <span className="aa-preview-label">Platform</span>
                  <span className="aa-preview-val" style={{ color: accentColor, textTransform: "capitalize" }}>
                    {selectedPlatform}
                  </span>
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

              <button
                className="aa-submit-btn"
                style={{ background: accentColor }}
                onClick={() => alert("Functionality coming soon!")}
              >
                Save Analytics Entry
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}