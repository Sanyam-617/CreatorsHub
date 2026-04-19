import { useState } from "react";
import API from "../api/axios";
import "./AIInsights.css";

export function AIInsights({ platformName, handle, summary, growth, analytics, color }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const fetchInsights = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data } = await API.post("/ai/insights", {
        platformName,
        handle,
        summary,
        growth,
        analytics,
      });

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch AI insights. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const sentimentEmoji = {
    positive: "🟢",
    neutral: "🟡",
    negative: "🔴",
  };

  return (
    <div className="ai-insights-section" style={{ "--ai-accent": color }}>
      {/* Header row with button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: result || loading ? "0" : "0" }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          AI Insights
        </h2>

        {!loading && !result && (
          <button
            className="ai-trigger-btn"
            onClick={fetchInsights}
            disabled={loading}
            style={{ background: color, borderColor: color, color: "#fff" }}
          >
            Generate AI Insights
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-spinner" />
          <span className="ai-loading-text">Analyzing your data…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="ai-error">
          <span className="ai-error-icon">⚠️</span>
          <span>{error}</span>
          <button className="ai-retry-btn" onClick={fetchInsights}>
            Retry
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="ai-result">
          {/* Headline + Sentiment */}
          <div className="ai-headline-row">
            <p className="ai-headline">{result.headline}</p>
            <span className={`ai-sentiment-badge ${result.sentiment}`}>
              {sentimentEmoji[result.sentiment] || "⚪"}{" "}
              {result.sentiment}
            </span>
          </div>

          {/* Two-column: Insights + Recommendations */}
          <div className="ai-columns">
            <div className="ai-list-section">
              <div className="ai-list-title">
                <span className="ai-list-title-icon">💡</span>
                Key Insights
              </div>
              <ul className="ai-list">
                {result.insights?.map((item, i) => (
                  <li key={i} className="ai-list-item">
                    <span className="ai-list-bullet" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ai-list-section">
              <div className="ai-list-title">
                <span className="ai-list-title-icon">🚀</span>
                Recommendations
              </div>
              <ul className="ai-list">
                {result.recommendations?.map((item, i) => (
                  <li key={i} className="ai-list-item">
                    <span className="ai-list-bullet" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Regenerate button */}
          <div style={{ marginTop: "18px", textAlign: "right" }}>
            <button
              className="ai-trigger-btn"
              onClick={fetchInsights}
              disabled={loading}
              style={{ fontSize: "12px", padding: "7px 16px" }}
            >
              <span className="ai-trigger-icon">🔄</span>
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
