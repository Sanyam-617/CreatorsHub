import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/analytics.css";

const PLATFORM_COLORS = {
  youtube:   "#ff4444",
  instagram: "#cc66ff",
  twitter:   "#4da6ff",
  facebook:  "#4466ff",
};

const PLATFORM_ICONS = {
  youtube:   "▶",
  instagram: "◈",
  twitter:   "✦",
  facebook:  "ƒ",
};

const CHART_METRICS = [
  { key: "views",       label: "Views" },
  { key: "likes",       label: "Likes" },
  { key: "comments",    label: "Comments" },
  { key: "shares",      label: "Shares" },
  { key: "followers",   label: "Followers" },
  { key: "engagementRate", label: "Engagement %" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="an-tooltip">
      <p className="an-tooltip-date">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="an-tooltip-row" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, sub, accent, highlight }) => (
  <div className={`an-stat-card ${highlight ? "an-stat-highlight" : ""}`}
       style={accent ? { borderColor: accent + "40" } : {}}>
    <span className="an-stat-label">{label}</span>
    <span className="an-stat-value" style={accent ? { color: accent } : {}}>{value}</span>
    {sub && <span className="an-stat-sub">{sub}</span>}
  </div>
);

const GrowthBadge = ({ value, label }) => {
  if (value === null || value === undefined) return null;
  const num = parseFloat(value);
  const pos = num >= 0;
  return (
    <div className={`an-growth-badge ${pos ? "pos" : "neg"}`}>
      <span className="an-growth-arrow">{pos ? "↑" : "↓"}</span>
      <span className="an-growth-num">{Math.abs(num)}%</span>
      <span className="an-growth-label">{label}</span>
    </div>
  );
};

const SCORE_COLORS = {
  Excellent: "#00cc88",
  Good:      "#4da6ff",
  Average:   "#ff9944",
  Poor:      "#ff4444",
};

const TREND_ICONS = {
  Growing:   { icon: "↗", color: "#00cc88" },
  Declining: { icon: "↘", color: "#ff4444" },
  Stable:    { icon: "→", color: "#ff9944" },
};

export default function Analytics() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [platforms, setPlatforms]       = useState([]);
  const [selected, setSelected]         = useState(null);
  const [analytics, setAnalytics]       = useState([]);
  const [summary, setSummary]           = useState(null);
  const [growth, setGrowth]             = useState(null);
  const [prediction, setPrediction]     = useState(null);

  const [loadingPlatforms, setLoadingPlatforms] = useState(true);
  const [loadingData, setLoadingData]           = useState(false);
  const [platformsError, setPlatformsError]     = useState("");
  const [dataError, setDataError]               = useState("");

  const [activeMetric, setActiveMetric] = useState("views");
  const [chartType, setChartType]       = useState("line");

  // fetch platforms on mount
  useEffect(() => {
    API.get("/platforms")
      .then((r) => {
        setPlatforms(r.data);
        if (r.data.length > 0) setSelected(r.data[0]);
      })
      .catch((e) => setPlatformsError(e.response?.data?.message || "Failed to load platforms."))
      .finally(() => setLoadingPlatforms(false));
  }, []);

  // fetch analytics data when selected changes
  useEffect(() => {
    if (!selected) return;
    setLoadingData(true);
    setDataError("");
    setAnalytics([]);
    setSummary(null);
    setGrowth(null);
    setPrediction(null);

    const id = selected._id;

    Promise.allSettled([
      API.get(`/analytics/${id}`),
      API.get(`/analytics/${id}/summary`),
      API.get(`/analytics/${id}/growth`),
      API.get(`/analytics/${id}/predict`),
    ]).then(([rawRes, sumRes, growRes, predRes]) => {
      if (rawRes.status === "fulfilled") {
        const sorted = [...rawRes.value.data.analytics].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setAnalytics(sorted);
      }
      if (sumRes.status === "fulfilled") setSummary(sumRes.value.data);
      if (growRes.status === "fulfilled") setGrowth(growRes.value.data);
      if (predRes.status === "fulfilled") setPrediction(predRes.value.data);

      if (rawRes.status === "rejected" && sumRes.status === "rejected") {
        setDataError("No analytics data yet for this platform. Add some data to get started.");
      }
    }).finally(() => setLoadingData(false));
  }, [selected]);

  const chartData = analytics.map((a) => ({
    date: new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    views:          a.views,
    likes:          a.likes,
    comments:       a.comments,
    shares:         a.shares,
    followers:      a.followers,
    engagementRate: parseFloat(a.engagementRate),
  }));

  const color = selected ? (PLATFORM_COLORS[selected.platformName] || "#ffffff") : "#ffffff";
  const trend = summary?.trend ? TREND_ICONS[summary.trend] : null;

  return (
    <div className="an-page">

      {/* Navbar */}
      <nav className="dash-nav">
        <span className="dash-nav-logo">CreatorHub</span>
        <div className="dash-nav-actions">
          <button className="dash-nav-manage" onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button className="dash-nav-manage" onClick={() => navigate("/platforms")}>Platforms</button>
          <button className="dash-nav-logout" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
        </div>
      </nav>

      <main className="an-main">

        {/* Page header */}
       <div className="an-page-header">
            <div>
                <h1 className="an-page-title">Analytics</h1>
                <p className="an-page-sub">Deep dive into your per-platform performance.</p>
            </div>
            <button className="an-btn-primary" onClick={() => navigate("/add-analytics")}>+ Add Data</button>
        </div>

        {/* Loading platforms */}
        {loadingPlatforms && (
          <div className="an-center-state">
            <div className="dash-spinner"></div>
            <p>Loading platforms…</p>
          </div>
        )}

        {/* No platforms */}
        {!loadingPlatforms && platformsError && (
          <div className="an-center-state">
            <span className="an-empty-icon">📡</span>
            <h3>No platforms connected</h3>
            <p>{platformsError}</p>
            <button className="an-btn-primary" onClick={() => navigate("/platforms")}>
              Add a Platform
            </button>
          </div>
        )}

        {!loadingPlatforms && !platformsError && platforms.length === 0 && (
          <div className="an-center-state">
            <span className="an-empty-icon">📡</span>
            <h3>No platforms yet</h3>
            <p>Add platforms first, then come back to view their analytics.</p>
            <button className="an-btn-primary" onClick={() => navigate("/platforms")}>
              Add a Platform
            </button>
          </div>
        )}

        {/* Main content */}
        {!loadingPlatforms && platforms.length > 0 && (
          <>
            {/* Platform tabs */}
            <div className="an-tabs">
              {platforms.map((p) => (
                <button
                  key={p._id}
                  className={`an-tab ${selected?._id === p._id ? "active" : ""}`}
                  style={selected?._id === p._id ? {
                    borderColor: PLATFORM_COLORS[p.platformName],
                    color: PLATFORM_COLORS[p.platformName],
                  } : {}}
                  onClick={() => setSelected(p)}
                >
                  <span className="an-tab-icon" style={{ color: PLATFORM_COLORS[p.platformName] }}>
                    {PLATFORM_ICONS[p.platformName]}
                  </span>
                  <span className="an-tab-name">{p.platformName}</span>
                  <span className="an-tab-handle">{p.handle}</span>
                </button>
              ))}
            </div>

            {/* Loading data */}
            {loadingData && (
              <div className="an-center-state">
                <div className="dash-spinner"></div>
                <p>Loading analytics…</p>
              </div>
            )}

            {/* No data for this platform */}
            {!loadingData && dataError && (
              <div className="an-center-state">
                <span className="an-empty-icon">📊</span>
                <h3>No data yet</h3>
                <p>{dataError}</p>
              </div>
            )}

            {/* Analytics content */}
            {!loadingData && !dataError && summary && (
              <div className="an-content">

                {/* Platform identity bar */}
                <div className="an-identity-bar" style={{ borderLeftColor: color }}>
                  <span className="an-identity-icon" style={{ color }}>
                    {PLATFORM_ICONS[selected?.platformName]}
                  </span>
                  <div className="an-identity-info">
                    <span className="an-identity-name" style={{ color }}>
                      {selected?.platformName}
                    </span>
                    <span className="an-identity-handle">{selected?.handle}</span>
                  </div>
                  {trend && (
                    <div className="an-trend-pill" style={{ color: trend.color, borderColor: trend.color + "40" }}>
                      <span>{trend.icon}</span>
                      <span>{summary.trend}</span>
                    </div>
                  )}
                  {summary.engagementScore && (
                    <div
                      className="an-score-pill"
                      style={{
                        color: SCORE_COLORS[summary.engagementScore],
                        borderColor: SCORE_COLORS[summary.engagementScore] + "40",
                      }}
                    >
                      {summary.engagementScore}
                    </div>
                  )}
                </div>

                {/* Stat cards row 1 */}
                <div className="an-stats-grid">
                  <StatCard label="Followers"      value={summary.latestFollowers?.toLocaleString()}    sub="latest" />
                  <StatCard label="Views"          value={summary.latestViews?.toLocaleString()}        sub="latest" />
                  <StatCard label="Engagement Rate" value={`${summary.latestEngagementRate}%`}          sub="latest" accent={color} />
                  <StatCard label="Avg Engagement" value={`${summary.avgEngagementRate}%`}             sub="all time" />
                </div>

                {/* Growth badges */}
                {growth && (
                  <div className="an-growth-row">
                    <span className="an-growth-title">Week-over-week</span>
                    <GrowthBadge value={growth.followersGrowth}  label="Followers" />
                    <GrowthBadge value={growth.viewsGrowth}      label="Views" />
                    <GrowthBadge value={growth.engagementGrowth} label="Engagement" />
                  </div>
                )}

                {/* Chart section */}
                {chartData.length > 0 && (
                  <div className="an-chart-section">

                    {/* Chart controls */}
                    <div className="an-chart-controls">
                      <div className="an-metric-tabs">
                        {CHART_METRICS.map((m) => (
                          <button
                            key={m.key}
                            className={`an-metric-tab ${activeMetric === m.key ? "active" : ""}`}
                            style={activeMetric === m.key ? { color, borderBottomColor: color } : {}}
                            onClick={() => setActiveMetric(m.key)}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                      <div className="an-chart-type-toggle">
                        <button
                          className={`an-type-btn ${chartType === "line" ? "active" : ""}`}
                          onClick={() => setChartType("line")}
                        >Line</button>
                        <button
                          className={`an-type-btn ${chartType === "bar" ? "active" : ""}`}
                          onClick={() => setChartType("bar")}
                        >Bar</button>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="an-chart-wrap">
                      <ResponsiveContainer width="100%" height={280}>
                        {chartType === "line" ? (
                          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)"
                              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} />
                            <YAxis stroke="rgba(255,255,255,0.2)"
                              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                              type="monotone"
                              dataKey={activeMetric}
                              name={CHART_METRICS.find(m => m.key === activeMetric)?.label}
                              stroke={color}
                              strokeWidth={2.5}
                              dot={{ r: 4, fill: color, strokeWidth: 0 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        ) : (
                          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)"
                              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} />
                            <YAxis stroke="rgba(255,255,255,0.2)"
                              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                              dataKey={activeMetric}
                              name={CHART_METRICS.find(m => m.key === activeMetric)?.label}
                              fill={color}
                              fillOpacity={0.8}
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Raw data table */}
                {analytics.length > 0 && (
                  <div className="an-table-section">
                    <h2 className="an-section-title">All Entries</h2>
                    <div className="an-table-wrap">
                      <table className="an-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Views</th>
                            <th>Likes</th>
                            <th>Comments</th>
                            <th>Shares</th>
                            <th>Followers</th>
                            <th>Engagement %</th>
                            <th>Reach</th>
                            <th>Impressions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...analytics].reverse().map((a) => (
                            <tr key={a._id}>
                              <td className="an-td-date">
                                {new Date(a.date).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric", year: "numeric",
                                })}
                              </td>
                              <td>{a.views.toLocaleString()}</td>
                              <td>{a.likes.toLocaleString()}</td>
                              <td>{a.comments.toLocaleString()}</td>
                              <td>{a.shares.toLocaleString()}</td>
                              <td>{a.followers.toLocaleString()}</td>
                              <td>
                                <span className="an-eng-badge" style={{ color }}>
                                  {a.engagementRate}%
                                </span>
                              </td>
                              <td>{a.reach?.toLocaleString() || "—"}</td>
                              <td>{a.impressions?.toLocaleString() || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Prediction section */}
                {prediction && (
                  <div className="an-prediction-section">
                    <div className="an-section-header">
                      <h2 className="an-section-title">4-Week Forecast</h2>
                      <span className="an-model-badge">
                        {prediction.modelQuality?.interpretation}
                        {" · "}R² {prediction.modelQuality?.followerR2}
                      </span>
                    </div>
                    <div className="an-pred-cards">
                      {prediction.predictions?.map((p) => (
                        <div key={p.week} className="an-pred-card">
                          <span className="an-pred-week">{p.week}</span>
                          <div className="an-pred-row">
                            <span className="an-pred-label">Followers</span>
                            <span className="an-pred-val" style={{ color }}>
                              {p.predictedFollowers.toLocaleString()}
                            </span>
                          </div>
                          <div className="an-pred-row">
                            <span className="an-pred-label">Views</span>
                            <span className="an-pred-val">
                              {p.predictedViews.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}