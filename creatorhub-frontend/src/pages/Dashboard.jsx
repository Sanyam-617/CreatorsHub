import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Area } from "recharts";
import { PageWrapper } from "../components/PageWrapper";
import { StatCard } from "../components/StatCard";
import { Chart } from "../components/Chart";
// BUG FIX: import the shared Sidebar component instead of copy-pasting sidebar HTML
import { Sidebar } from "../components/Sidebar";
import { Users, Eye, Heart, MessageCircle, TrendingUp, BarChart2, Activity } from "lucide-react";
import "../styles/Dashboard.css";
import "../components/Sidebar.css";
import "../components/StatCard.css";
import "../components/Chart.css";

const Dashboard = () => {
  const { user } = useAuth();
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

  const formatChartData = (chartData) => {
    if (!chartData || chartData.length === 0) return [];
    const map = {};
    chartData.forEach((entry) => {
      const date = new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!map[date]) map[date] = { date };
      map[date][entry.platform] = Number(entry.followers) || 0;
    });
    return Object.values(map);
  };

  const chartData = data ? formatChartData(data.chartData) : [];
  const platforms = data?.platforms || [];

  return (
    // BUG FIX: replaced inline sidebar HTML with <Sidebar /> component.
    // Sidebar is position:fixed so dashboard-layout just needs min-height
    // (defined in App.css). The .main-content class handles the offset.
    <div className="dashboard-layout">
      <Sidebar />

      <PageWrapper>
        <div className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-header-left">
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Your creator overview across all platforms</p>
            </div>
            <div className="live-indicator">
              <div className="live-dot"></div>
              Live
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="loading-state">
              <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '16px' }}></div>
              <div className="skeleton" style={{ width: '100%', height: '300px', marginBottom: '24px' }}></div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="error-state">
              <p>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && (!data || !data.combined) && (
            <div className="empty-state">
              <h3>No data yet</h3>
              <p>Upload your first dataset to see analytics</p>
            </div>
          )}

          {/* Data */}
          {!loading && data && data.combined && (
            <>
              {/* Stat Cards Grid */}
              <div className="stats-grid">
                <StatCard
                  label="Total Followers"
                  value={Number(data.combined.totalFollowers) || 0}
                  delta={Number(data.combined.followersGrowth) || 0}
                  deltaLabel="%"
                  accentColor="#4da6ff"
                  icon={Users}
                  sparklineData={chartData.map(d => d.youtube || 0)}
                />
                <StatCard
                  label="Total Views"
                  value={Number(data.combined.totalViews) || 0}
                  delta={Number(data.combined.viewsGrowth) || 0}
                  deltaLabel="%"
                  accentColor="#cc66ff"
                  icon={Eye}
                  sparklineData={chartData.map(d => d.instagram || 0)}
                />
                <StatCard
                  label="Total Likes"
                  value={Number(data.combined.totalLikes) || 0}
                  delta={Number(data.combined.likesGrowth) || 0}
                  deltaLabel="%"
                  accentColor="#ff4444"
                  icon={Heart}
                  sparklineData={chartData.map(d => d.twitter || 0)}
                />
                <StatCard
                  label="Total Comments"
                  value={Number(data.combined.totalComments) || 0}
                  delta={Number(data.combined.commentsGrowth) || 0}
                  deltaLabel="%"
                  accentColor="#22c55e"
                  icon={MessageCircle}
                  sparklineData={chartData.map(d => d.facebook || 0)}
                />
              </div>

              {/* Followers Over Time Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h2 className="chart-title">Followers Over Time</h2>
                  <div className="platform-legend">
                    <div className="legend-item">
                      <div className="legend-dot" style={{ backgroundColor: '#ff4444' }}></div>
                      <span>YouTube</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot" style={{ backgroundColor: '#cc66ff' }}></div>
                      <span>Instagram</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot" style={{ backgroundColor: '#4da6ff' }}></div>
                      <span>Twitter</span>
                    </div>
                  </div>
                </div>
                {/* BUG FIX: pass extraColors so Chart generates gradient defs for all
                    platform colors — previously only the platformColor gradient existed,
                    so YouTube (#ff4444) and Instagram (#cc66ff) areas had no fill. */}
                <Chart
                  data={chartData}
                  height={400}
                  platformColor="#4da6ff"
                  extraColors={['#ff4444', '#cc66ff']}
                >
                  {platforms.map((p) => (
                    <Area
                      key={p.platformName}
                      type="monotone"
                      dataKey={p.platformName}
                      stroke={p.platformName === 'youtube' ? '#ff4444' : p.platformName === 'instagram' ? '#cc66ff' : '#4da6ff'}
                      strokeWidth={2}
                      fill={p.platformName === 'youtube' ? 'url(#gradient-ff4444)' : p.platformName === 'instagram' ? 'url(#gradient-cc66ff)' : 'url(#gradient-4da6ff)'}
                      dot={false}
                      activeDot={{ r: 5, fill: p.platformName === 'youtube' ? '#ff4444' : p.platformName === 'instagram' ? '#cc66ff' : '#4da6ff', stroke: '#141414', strokeWidth: 2 }}
                    />
                  ))}
                </Chart>
              </div>

              {/* Platform Breakdown */}
              <div className="platform-breakdown">
                <h2 className="section-title">Platform Breakdown</h2>
                <div className="dash-platforms">
                  {platforms.map((p) => (
                    <div key={p._id} className="dash-platform-card">
                      <div className="platform-header">
                        <div className="platform-icon">
                          {p.platformName === 'youtube' && <BarChart2 size={24} color="#ff4444" />}
                          {p.platformName === 'instagram' && <Activity size={24} color="#cc66ff" />}
                          {p.platformName === 'twitter' && <TrendingUp size={24} color="#4da6ff" />}
                        </div>
                        <div className="platform-info">
                          <div className="platform-name" style={{ color: p.platformName === 'youtube' ? '#ff4444' : p.platformName === 'instagram' ? '#cc66ff' : '#4da6ff' }}>
                            {p.platformName}
                          </div>
                          <div className="platform-handle">@{p.handle}</div>
                        </div>
                      </div>
                      <div className="platform-divider"></div>
                      <div className="dash-platform-stats">
                        <div className="dash-pstat">
                          <span className="dash-pstat-label">Followers</span>
                          <span className="dash-pstat-value">{(Number(p.latestFollowers) || 0).toLocaleString()}</span>
                        </div>
                        <div className="dash-pstat">
                          <span className="dash-pstat-label">Views</span>
                          <span className="dash-pstat-value">{(Number(p.latestViews) || 0).toLocaleString()}</span>
                        </div>
                        <div className="dash-pstat">
                          <span className="dash-pstat-label">Likes</span>
                          <span className="dash-pstat-value">{(Number(p.latestLikes) || 0).toLocaleString()}</span>
                        </div>
                        <div className="dash-pstat">
                          <span className="dash-pstat-label">Comments</span>
                          <span className="dash-pstat-value">{(Number(p.latestComments) || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </PageWrapper>
    </div>
  );
};

export default Dashboard;