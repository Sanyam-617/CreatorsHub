import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";

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

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/dashboard/overview");
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatChartData = (chartData) => {
    if (!chartData || chartData.length === 0) return [];
    const map = {};
    chartData.forEach((entry) => {
      const date = new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!map[date]) map[date] = { date };
      map[date][entry.platform] = entry.followers;
    });
    return Object.values(map);
  };

  const chartData = data ? formatChartData(data.chartData) : [];
  const platforms = data?.platforms || [];

  return (
    <div className="dashboard">

      {/* Navbar */}
      <nav className="dash-nav">
        <span className="dash-nav-logo">CreatorHub</span>
        <div className="dash-nav-actions">
          <button className="dash-nav-manage" onClick={() => navigate("/platforms")}>Manage Platforms</button>
          <button className="dash-nav-manage" onClick={() => navigate("/analytics")}>Analytics</button>
          <button className="dash-nav-logout" onClick={handleLogout}>Logout</button>
          </div>
      </nav>

      {/* Main */}
      <main className="dash-main">

        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">Overview of your creator operations across all platforms.</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="dash-loading">
            <div className="dash-spinner"></div>
            <p>Loading your analytics...</p>
          </div>
        )}

        {/* Error / Empty */}
        {!loading && error && (
          <div className="dash-empty">
            <span className="dash-empty-icon">📊</span>
            <h3>No Data Yet</h3>
            <p>{error}</p>
            <button className="dash-add-btn" onClick={() => navigate("/platforms")}>
              Add Your First Platform
            </button>
          </div>
        )}

        {/* Data */}
        {!loading && data && (
          <>
            {/* Row 1 — 4 stat cards */}
            <div className="dash-cards">
              <div className="dash-card">
                <span className="dash-card-label">Total Followers</span>
                <span className="dash-card-value">{data.combined.totalFollowers.toLocaleString()}</span>
                <span className="dash-card-sub">{data.combined.totalPlatforms} platforms connected</span>
              </div>
              <div className="dash-card">
                <span className="dash-card-label">Total Views</span>
                <span className="dash-card-value">{data.combined.totalViews.toLocaleString()}</span>
                <span className="dash-card-sub">across all platforms</span>
              </div>
              <div className="dash-card">
                <span className="dash-card-label">Total Likes</span>
                <span className="dash-card-value">{data.combined.totalLikes.toLocaleString()}</span>
                <span className="dash-card-sub">combined engagement</span>
              </div>
              <div className="dash-card">
                <span className="dash-card-label">Total Comments</span>
                <span className="dash-card-value">{data.combined.totalComments.toLocaleString()}</span>
                <span className="dash-card-sub">combined engagement</span>
              </div>
            </div>

            {/* Row 2 — engagement + score + shares */}
            <div className="dash-cards dash-cards-three">
              <div className="dash-card">
                <span className="dash-card-label">Avg Engagement Rate</span>
                <span className="dash-card-value">{data.combined.avgEngagementRate}%</span>
                <span className="dash-card-sub">across all platforms</span>
              </div>
              <div className={`dash-card dash-score-${data.combined.engagementScore.toLowerCase()}`}>
                <span className="dash-card-label">Engagement Score</span>
                <span className="dash-card-value">{data.combined.engagementScore}</span>
                <span className="dash-card-sub">based on avg engagement rate</span>
              </div>
              <div className="dash-card">
                <span className="dash-card-label">Total Shares</span>
                <span className="dash-card-value">{data.combined.totalShares.toLocaleString()}</span>
                <span className="dash-card-sub">combined shares</span>
              </div>
            </div>

            {/* Row 3 — Line Chart */}
            {chartData.length > 0 && (
              <div className="dash-chart-card">
                <h2 className="dash-chart-title">Followers Over Time</h2>
                <p className="dash-chart-sub">Growth trend across all platforms</p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                    <Legend />
                    {platforms.map((p) => (
                      <Line
                        key={p.platformName}
                        type="monotone"
                        dataKey={p.platformName}
                        stroke={PLATFORM_COLORS[p.platformName] || "#ffffff"}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Row 4 — Platform Breakdown */}
            <div className="dash-platform-header">
              <h2>Platform Breakdown</h2>
              <button className="dash-add-btn" onClick={() => navigate("/platforms")}>
                + Manage Platforms
              </button>
            </div>

            <div className="dash-platforms">
              {platforms.map((p) => (
                <div key={p.platformId} className="dash-platform-card">
                  <div className="dash-platform-top">
                    <span className="dash-platform-icon" style={{ color: PLATFORM_COLORS[p.platformName] }}>
                      {PLATFORM_ICONS[p.platformName]}
                    </span>
                    <div className="dash-platform-info">
                      <span className="dash-platform-name">{p.platformName}</span>
                      <span className="dash-platform-handle">{p.handle}</span>
                    </div>
                  </div>
                  <div className="dash-platform-stats">
                    <div className="dash-pstat">
                      <span className="dash-pstat-label">Followers</span>
                      <span className="dash-pstat-value">{p.latestFollowers.toLocaleString()}</span>
                      {p.followersGrowth && (
                        <span className={`dash-pstat-growth ${parseFloat(p.followersGrowth) >= 0 ? "pos" : "neg"}`}>
                          {parseFloat(p.followersGrowth) >= 0 ? "↑" : "↓"} {Math.abs(p.followersGrowth)}%
                        </span>
                      )}
                    </div>
                    <div className="dash-pstat">
                      <span className="dash-pstat-label">Views</span>
                      <span className="dash-pstat-value">{p.latestViews.toLocaleString()}</span>
                      {p.viewsGrowth && (
                        <span className={`dash-pstat-growth ${parseFloat(p.viewsGrowth) >= 0 ? "pos" : "neg"}`}>
                          {parseFloat(p.viewsGrowth) >= 0 ? "↑" : "↓"} {Math.abs(p.viewsGrowth)}%
                        </span>
                      )}
                    </div>
                    <div className="dash-pstat">
                      <span className="dash-pstat-label">Likes</span>
                      <span className="dash-pstat-value">{p.latestLikes.toLocaleString()}</span>
                    </div>
                    <div className="dash-pstat">
                      <span className="dash-pstat-label">Comments</span>
                      <span className="dash-pstat-value">{p.latestComments.toLocaleString()}</span>
                    </div>
                    <div className="dash-pstat">
                      <span className="dash-pstat-label">Engagement</span>
                      <span className="dash-pstat-value">{p.latestEngagementRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;