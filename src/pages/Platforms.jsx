import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/platforms.css";

const PLATFORM_COLORS = {
  youtube: "#ff4444",
  instagram: "#cc66ff",
  twitter: "#4da6ff",
  facebook: "#4466ff",
};

const PLATFORM_ICONS = {
  youtube: "▶",
  instagram: "◈",
  twitter: "✦",
  facebook: "ƒ",
};

const PLATFORM_OPTIONS = ["youtube", "instagram", "twitter", "facebook"];

const Platforms = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ platformName: "", handle: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const fetchPlatforms = async () => {
    try {
      const res = await API.get("/platforms");
      setPlatforms(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load platforms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError("");
    setFormSuccess("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!form.platformName || !form.handle.trim()) {
      return setFormError("Please select a platform and enter a handle.");
    }

    setFormLoading(true);
    try {
      await API.post("/platforms", {
        platformName: form.platformName,
        handle: form.handle.trim(),
      });
      setFormSuccess(`${form.platformName} added successfully!`);
      setForm({ platformName: "", handle: "" });
      fetchPlatforms();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add platform.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await API.delete(`/platforms/${id}`);
      setPlatforms((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete platform.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const availableOptions = PLATFORM_OPTIONS.filter(
    (opt) => !platforms.find((p) => p.platformName === opt)
  );

  return (
    <div className="platforms-page">

      {/* Navbar */}
      <nav className="dash-nav">
        <span className="dash-nav-logo">CreatorHub</span>
        <div className="dash-nav-actions">
          <button className="dash-nav-manage" onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button className="dash-nav-manage" onClick={() => navigate("/analytics")}>Analytics</button>
          <button className="dash-nav-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Main */}
      <main className="plat-main">

        {/* Header */}
        <div className="plat-header">
          <div>
            <h1 className="plat-title">Platforms</h1>
            <p className="plat-subtitle">Manage the social media platforms you want to track.</p>
          </div>
        </div>

        <div className="plat-layout">

          {/* Left — Add Form */}
          <div className="plat-form-card">
            <h2 className="plat-section-title">Add a Platform</h2>
            <p className="plat-section-sub">Connect a new social media account to start tracking analytics.</p>

            {formError && <div className="plat-msg plat-msg-error">{formError}</div>}
            {formSuccess && <div className="plat-msg plat-msg-success">{formSuccess}</div>}

            <form onSubmit={handleAdd} className="plat-form">
              <div className="plat-field">
                <label className="plat-label">Platform</label>
                <select
                  name="platformName"
                  value={form.platformName}
                  onChange={handleChange}
                  className="plat-select"
                  disabled={availableOptions.length === 0}
                >
                  <option value="">
                    {availableOptions.length === 0 ? "All platforms added" : "Select a platform"}
                  </option>
                  {availableOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="plat-field">
                <label className="plat-label">Handle / Username</label>
                <input
                  type="text"
                  name="handle"
                  value={form.handle}
                  onChange={handleChange}
                  placeholder="e.g. @yourchannel"
                  className="plat-input"
                  disabled={availableOptions.length === 0}
                />
              </div>

              <button
                type="submit"
                className="plat-submit-btn"
                disabled={formLoading || availableOptions.length === 0}
              >
                {formLoading ? "Adding..." : "+ Add Platform"}
              </button>
            </form>

            {availableOptions.length === 0 && (
              <p className="plat-all-added">
                You've added all 4 supported platforms.
              </p>
            )}
          </div>

          {/* Right — Platform List */}
          <div className="plat-list-section">
            <h2 className="plat-section-title">
              Connected Platforms
              {!loading && (
                <span className="plat-count">{platforms.length}</span>
              )}
            </h2>

            {loading && (
              <div className="plat-loading">
                <div className="dash-spinner"></div>
                <p>Loading platforms...</p>
              </div>
            )}

            {!loading && error && (
              <div className="plat-msg plat-msg-error">{error}</div>
            )}

            {!loading && !error && platforms.length === 0 && (
              <div className="plat-empty">
                <span className="plat-empty-icon">📡</span>
                <h3>No platforms yet</h3>
                <p>Add your first platform using the form to start tracking analytics.</p>
              </div>
            )}

            {!loading && platforms.length > 0 && (
              <div className="plat-list">
                {platforms.map((p) => (
                  <div key={p._id} className="plat-item">
                    <div className="plat-item-left">
                      <span
                        className="plat-item-icon"
                        style={{ color: PLATFORM_COLORS[p.platformName] }}
                      >
                        {PLATFORM_ICONS[p.platformName]}
                      </span>
                      <div className="plat-item-info">
                        <span className="plat-item-name">{p.platformName}</span>
                        <span className="plat-item-handle">{p.handle}</span>
                      </div>
                    </div>
                    <div className="plat-item-right">
                      <span
                        className="plat-item-dot"
                        style={{ background: PLATFORM_COLORS[p.platformName] }}
                      ></span>
                      <button
                        className="plat-delete-btn"
                        onClick={() => handleDelete(p._id)}
                        disabled={deletingId === p._id}
                      >
                        {deletingId === p._id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Platforms;