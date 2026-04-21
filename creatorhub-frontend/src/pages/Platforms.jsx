import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { PageWrapper } from "../components/PageWrapper";
// BUG FIX: import shared Sidebar component instead of copy-pasting sidebar HTML
import { Sidebar } from "../components/Sidebar";
import {
  Plus,
  Trash2,
  Activity,
  BarChart2
} from "lucide-react";
import "../styles/Platforms.css";
import "../components/Sidebar.css";

const PLATFORM_COLORS = {
  youtube: "#ff4444",
  instagram: "#cc66ff",
  twitter: "#4da6ff",
  facebook: "#4466ff",
};

const PLATFORM_ICONS = {
  youtube: <BarChart2 size={16} />,
  instagram: <Activity size={16} />,
  twitter: <Activity size={16} />,
  facebook: <span>£</span>,
};

const Platforms = () => {
  const { user } = useAuth();
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

    if (!form.platformName.trim() || !form.handle.trim()) {
      return setFormError("Please enter a platform name and handle.");
    }

    setFormLoading(true);
    try {
      await API.post("/platforms", {
        platformName: form.platformName.trim().toLowerCase(),
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

  return (
    // BUG FIX: replaced inline sidebar HTML with <Sidebar /> component.
    <div className="platforms-layout">
      <Sidebar />

      <PageWrapper>
        <div className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-header-left">
              <h1 className="page-title">Platforms</h1>
              <p className="page-subtitle">Manage the social media platforms you want to track</p>
            </div>
          </div>

          <div className="platforms-content">
            {/* Add Platform Form */}
            <div className="add-platform-card">
              <div className="card-header">
                <Plus size={20} />
                <h2>Add a Platform</h2>
              </div>
              <p className="card-subtitle">Connect a new social media account to start tracking analytics</p>

              {formError && <div className="form-message error">{formError}</div>}
              {formSuccess && <div className="form-message success">{formSuccess}</div>}

              <form onSubmit={handleAdd} className="platform-form">
                <div className="form-field">
                  <label className="form-label">Platform Name</label>
                  <input
                    type="text"
                    name="platformName"
                    value={form.platformName}
                    onChange={handleChange}
                    placeholder="e.g. YouTube, Instagram, etc."
                    className="form-input"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Handle / Username</label>
                  <input
                    type="text"
                    name="handle"
                    value={form.handle}
                    onChange={handleChange}
                    placeholder="e.g. @yourchannel"
                    className="form-input"
                    disabled={formLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={formLoading}
                >
                  {formLoading ? "Adding..." : "+ Add Platform"}
                </button>
              </form>
            </div>

            {/* Platform List */}
            <div className="platforms-list">
              <div className="list-header">
                <h2>Connected Platforms</h2>
                {!loading && (
                  <span className="platform-count">{platforms.length}</span>
                )}
              </div>

              {loading && (
                <div className="loading-state">
                  <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '16px' }}></div>
                  <div className="skeleton" style={{ width: '100%', height: '300px' }}></div>
                </div>
              )}

              {!loading && error && (
                <div className="error-state">
                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && platforms.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <BarChart2 size={48} color="rgba(255,255,255,0.2)" />
                  </div>
                  <h3>No platforms yet</h3>
                  <p>Add your first platform using the form to start tracking analytics</p>
                </div>
              )}

              {!loading && platforms.length > 0 && (
                <div className="platform-grid">
                  {platforms.map((p) => (
                    <div key={p._id} className="platform-card">
                      <div className="platform-card-header">
                        <div className="platform-info">
                          <div className="platform-icon" style={{ color: PLATFORM_COLORS[p.platformName] }}>
                            {PLATFORM_ICONS[p.platformName]}
                          </div>
                          <div className="platform-details">
                            <div className="platform-name">{p.platformName}</div>
                            <div className="platform-handle">@{p.handle}</div>
                          </div>
                        </div>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(p._id)}
                          disabled={deletingId === p._id}
                        >
                          <Trash2 size={16} />
                          {deletingId === p._id ? "Removing..." : ""}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
};

export default Platforms;