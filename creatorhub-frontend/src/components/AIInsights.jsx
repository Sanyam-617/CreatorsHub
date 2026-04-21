import { useState } from "react";
import { Sparkles, Lightbulb, Target, TrendingUp } from "lucide-react";
import API from "../api/axios";
import "./AIInsights.css";

const SENTIMENT_CONFIG = {
  positive: { label: "Positive", emoji: "🟢", className: "sentiment-positive" },
  neutral:  { label: "Neutral",  emoji: "🟡", className: "sentiment-neutral"  },
  negative: { label: "Negative", emoji: "🔴", className: "sentiment-negative" },
};

export function AIInsights({ platformName, handle, summary, growth, analytics, color }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchInsights = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await API.post("/ai/insights", {
        platformName,
        handle,
        summary,
        growth,
        analytics,
      });
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setError(res.data?.message || "Failed to generate insights.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate AI insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sentiment = data?.sentiment ? SENTIMENT_CONFIG[data.sentiment] || SENTIMENT_CONFIG.neutral : null;

  return (
    <div className="ai-insights-section">
      {/* Header */}
      <div className="ai-insights-header">
        <div className="ai-insights-title-row">
          <Sparkles size={18} style={{ color: color || "#cc66ff" }} />
          <h2 className="section-title" style={{ marginBottom: 0 }}>AI Insights</h2>
        </div>
        <button
          className="ai-generate-btn"
          onClick={fetchInsights}
          disabled={loading}
          style={{
            '--btn-color': color || '#cc66ff',
          }}
        >
          {loading ? (
            <>
              <span className="ai-spinner" />
              Analyzing…
            </>
          ) : data ? (
            <>
              <Sparkles size={14} />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Generate Insights
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="ai-error">
          <p>{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="ai-loading">
          <div className="skeleton ai-skeleton-headline" />
          <div className="skeleton ai-skeleton-list" />
          <div className="skeleton ai-skeleton-list short" />
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="ai-results">
          {/* Headline + Sentiment */}
          <div className="ai-headline-card" style={{ '--accent': color || '#cc66ff' }}>
            <div className="ai-headline-text">
              <TrendingUp size={16} style={{ color: color || '#cc66ff', flexShrink: 0 }} />
              <span>{data.headline}</span>
            </div>
            {sentiment && (
              <span className={`ai-sentiment-badge ${sentiment.className}`}>
                {sentiment.emoji} {sentiment.label}
              </span>
            )}
          </div>

          {/* Insights + Recommendations grid */}
          <div className="ai-cards-grid">
            {/* Insights */}
            {data.insights?.length > 0 && (
              <div className="ai-card">
                <div className="ai-card-header">
                  <Lightbulb size={16} style={{ color: '#facc15' }} />
                  <h3>Key Insights</h3>
                </div>
                <ul className="ai-card-list">
                  {data.insights.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {data.recommendations?.length > 0 && (
              <div className="ai-card">
                <div className="ai-card-header">
                  <Target size={16} style={{ color: '#22c55e' }} />
                  <h3>Recommendations</h3>
                </div>
                <ul className="ai-card-list">
                  {data.recommendations.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
