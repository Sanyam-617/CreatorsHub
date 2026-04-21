import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Area, Bar } from "recharts";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { PageWrapper } from "../components/PageWrapper";
import { StatCard } from "../components/StatCard";
import { Chart } from "../components/Chart";
// BUG FIX: import shared Sidebar component instead of copy-pasting sidebar HTML
import { Sidebar } from "../components/Sidebar";
import { AIInsights } from "../components/AIInsights";
// BUG FIX: removed `LogOut` (handled by Sidebar) and the duplicate
//           `TrendingUp as TrendingUpIcon` import (was only used in inline sidebar nav)
import {
  TrendingUp,
  BarChart3,
  BarChart2,
  Activity
} from "lucide-react";
import "../styles/Analytics.css";
import "../components/Sidebar.css";
import "../components/StatCard.css";
import "../components/Chart.css";

const PLATFORM_COLORS = {
  youtube: "#ff4444",
  instagram: "#cc66ff",
  twitter: "#4da6ff",
  facebook: "#4466ff",
};

const PLATFORM_ICONS = {
  youtube: <BarChart2 size={16} />,
  instagram: <Activity size={16} />,
  twitter: <TrendingUp size={16} />,
  facebook: <span>£</span>,
};

const TREND_ICONS = {
  up: <TrendingUp size={16} />,
  down: <TrendingUp size={16} style={{ transform: 'rotate(180deg)' }} />,
  stable: <TrendingUp size={16} />,
};

const CHART_METRICS = [
  { key: "views", label: "Views" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
  { key: "shares", label: "Shares" },
  { key: "followers", label: "Followers" },
  { key: "engagementRate", label: "Engagement %" },
];

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [platforms, setPlatforms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const [loadingPlatforms, setLoadingPlatforms] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [platformsError, setPlatformsError] = useState("");
  const [dataError, setDataError] = useState("");

  const [activeMetric, setActiveMetric] = useState("views");
  const [chartType, setChartType] = useState("line");

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
    views: Number(a.views) || 0,
    likes: Number(a.likes) || 0,
    comments: Number(a.comments) || 0,
    shares: Number(a.shares) || 0,
    followers: Number(a.followers) || 0,
    engagementRate: parseFloat(a.engagementRate) || 0,
  }));

  const color = selected ? (PLATFORM_COLORS[selected.platformName] || "#718096") : "#718096";
  const trend = summary?.trend ? TREND_ICONS[summary.trend] : null;

  return (
    // BUG FIX: replaced inline sidebar HTML with <Sidebar /> component.
    <div className="analytics-layout">
      <Sidebar />

      {/* Main Content */}
      <PageWrapper>
        <div className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-header-left">
              <h1 className="page-title">Analytics</h1>
              <p className="page-subtitle">Deep dive into your per-platform performance</p>
            </div>
          </div>

          {/* Loading platforms */}
          {loadingPlatforms && (
            <div className="loading-state">
              <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '16px' }}></div>
              <div className="skeleton" style={{ width: '100%', height: '300px', marginBottom: '24px' }}></div>
            </div>
          )}

          {/* No platforms */}
          {!loadingPlatforms && platformsError && (
            <div className="error-state">
              <p>{platformsError}</p>
              <button className="an-btn-primary" onClick={() => navigate("/platforms")}>
                Add a Platform
              </button>
            </div>
          )}

          {!loadingPlatforms && !platformsError && platforms.length === 0 && (
            <div className="error-state">
              <p>No platforms yet. Add platforms first, then come back to view their analytics.</p>
              <button className="an-btn-primary" onClick={() => navigate("/platforms")}>
                Add a Platform
              </button>
            </div>
          )}

          {/* Main content */}
          {!loadingPlatforms && platforms.length > 0 && (
            <>
              {/* Platform tabs */}
              <div className="platform-tabs">
                {platforms.map((p) => (
                  <button
                    key={p._id}
                    className={`platform-tab ${selected?._id === p._id ? "active" : ""}`}
                    style={selected?._id === p._id ? {
                      borderColor: PLATFORM_COLORS[p.platformName],
                      color: PLATFORM_COLORS[p.platformName],
                    } : {}}
                    onClick={() => setSelected(p)}
                  >
                    {PLATFORM_ICONS[p.platformName]}
                    <span>{p.platformName}</span>
                  </button>
                ))}
              </div>
              {selected && (
                <div className="platform-handle">@{selected.handle}</div>
              )}

              {/* Loading data */}
              {loadingData && (
                <div className="loading-state">
                  <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '16px' }}></div>
                  <div className="skeleton" style={{ width: '100%', height: '300px', marginBottom: '24px' }}></div>
                </div>
              )}

              {/* No data for this platform */}
              {!loadingData && dataError && (
                <div className="error-state">
                  <p>{dataError}</p>
                </div>
              )}

              {/* Analytics content */}
              {!loadingData && !dataError && summary && (
                <div className="analytics-content">
                  {/* Stat cards */}
                  {(() => {
                    const latest = analytics.length > 0 ? analytics[analytics.length - 1] : {};
                    return (
                    <div className="stats-grid">
                    <StatCard
                      label="Followers"
                      value={Number(latest.followers) || 0}
                      delta={Number(growth?.followersGrowth) || 0}
                      deltaLabel="%"
                      accentColor={color}
                      icon={TrendingUp}
                      sparklineData={chartData.map(d => d.followers || 0)}
                    />
                    <StatCard
                      label="Views"
                      value={Number(latest.views) || 0}
                      delta={Number(growth?.viewsGrowth) || 0}
                      deltaLabel="%"
                      accentColor={color}
                      icon={BarChart3}
                      sparklineData={chartData.map(d => d.views || 0)}
                    />
                    <StatCard
                      label="Likes"
                      value={Number(latest.likes) || 0}
                      accentColor={color}
                      icon={TrendingUp}
                      sparklineData={chartData.map(d => d.likes || 0)}
                    />
                    <StatCard
                      label="Comments"
                      value={Number(latest.comments) || 0}
                      accentColor={color}
                      icon={TrendingUp}
                      sparklineData={chartData.map(d => d.comments || 0)}
                    />
                  </div>
                    );
                  })()}

                  {/* Chart section */}
                  {chartData.length > 0 && (
                    <div className="chart-card">
                      <div className="chart-header">
                        <div className="metric-tabs">
                          {CHART_METRICS.map((m) => (
                            <button
                              key={m.key}
                              className={`metric-tab ${activeMetric === m.key ? "active" : ""}`}
                              style={activeMetric === m.key ? {
                                borderBottomColor: color,
                                color: color
                              } : {}}
                              onClick={() => setActiveMetric(m.key)}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                        <div className="chart-type-toggle">
                          <button
                            className={`type-btn ${chartType === "line" ? "active" : ""}`}
                            onClick={() => setChartType("line")}
                          >Line</button>
                          <button
                            className={`type-btn ${chartType === "bar" ? "active" : ""}`}
                            onClick={() => setChartType("bar")}
                          >Bar</button>
                        </div>
                      </div>
                      <Chart
                        data={chartData}
                        height={350}
                        platformColor={color}
                      >
                        {chartType === "line" ? (
                          <Area
                            type="monotone"
                            dataKey={activeMetric}
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#gradient-${color.replace('#', '')}`}
                            dot={false}
                            activeDot={{ r: 5, fill: color, stroke: '#141414', strokeWidth: 2 }}
                          />
                        ) : (
                          <Bar
                            dataKey={activeMetric}
                            fill={color}
                            fillOpacity={0.8}
                            radius={[4, 4, 0, 0]}
                          />
                        )}
                      </Chart>
                    </div>
                  )}

                  {/* Data table */}
                  {analytics.length > 0 && (
                    <div className="data-table-section">
                      <h2 className="section-title">All Entries</h2>
                      <div className="table-wrapper">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Views</th>
                              <th>Likes</th>
                              <th>Comments</th>
                              <th>Shares</th>
                              <th>Followers</th>
                              <th>Engagement %</th>
                              {analytics.some(a => Number(a.reach) > 0) && <th>Reach</th>}
                              {analytics.some(a => Number(a.impressions) > 0) && <th>Impressions</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {[...analytics].reverse().map((a) => (
                              <tr key={a._id}>
                                <td className="table-date">
                                  {new Date(a.date).toLocaleDateString("en-US", {
                                    month: "short", day: "numeric", year: "numeric",
                                  })}
                                </td>
                                <td className="table-number">{(Number(a.views) || 0).toLocaleString()}</td>
                                <td className="table-number">{(Number(a.likes) || 0).toLocaleString()}</td>
                                <td className="table-number">{(Number(a.comments) || 0).toLocaleString()}</td>
                                <td className="table-number">{(Number(a.shares) || 0).toLocaleString()}</td>
                                <td className="table-number">{(Number(a.followers) || 0).toLocaleString()}</td>
                                <td className="table-engagement" style={{ color }}>
                                  {parseFloat(a.engagementRate || 0).toFixed(2)}%
                                </td>
                                {analytics.some(a => Number(a.reach) > 0) && (
                                  <td className="table-number">{(Number(a.reach) || 0).toLocaleString()}</td>
                                )}
                                {analytics.some(a => Number(a.impressions) > 0) && (
                                  <td className="table-number">{(Number(a.impressions) || 0).toLocaleString()}</td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 4-Week Forecast */}
                  {prediction && (
                    <div className="forecast-section">
                      <div className="forecast-header">
                        <h2 className="section-title">4-Week Forecast</h2>
                        <div className="r2-badge" style={{
                          background: prediction.modelQuality?.followerR2 > 0.8 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                          borderColor: prediction.modelQuality?.followerR2 > 0.8 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                          color: prediction.modelQuality?.followerR2 > 0.8 ? '#22c55e' : '#ef4444'
                        }}>
                          R² {prediction.modelQuality?.followerR2}
                        </div>
                      </div>
                      <div className="forecast-cards">
                        {prediction.predictions?.map((p, index) => (
                          <div key={p.week} className="forecast-card" style={{ '--accent-color': color }}>
                            <div className="forecast-week">{p.week}</div>
                            <div className="forecast-metrics">
                              <div className="forecast-metric">
                                <span className="forecast-label">Followers</span>
                                <span className="forecast-value">{(Number(p.predictedFollowers) || 0).toLocaleString()}</span>
                              </div>
                              <div className="forecast-metric">
                                <span className="forecast-label">Views</span>
                                <span className="forecast-value">{(Number(p.predictedViews) || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Insights */}
                  {selected && (
                    <AIInsights
                      platformName={selected.platformName}
                      handle={selected.handle}
                      summary={summary}
                      growth={growth}
                      analytics={analytics}
                      color={color}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}