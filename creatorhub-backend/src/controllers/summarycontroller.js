const Analytics = require("../models/analytics");
const logger = require("../utils/logger");

// ─── ANALYTICS SUMMARY ──────────────────────────────────────────────────────────

exports.getAnalyticsSummary = async (req, res) => {
  try {
    logger.info(`getAnalyticsSummary | user: ${req.user.id} | platform: ${req.params.platformId}`);

    const analytics = await Analytics.find({
      userId: req.user.id,
      platformId: req.params.platformId,
    }).sort({ date: 1 });

    if (analytics.length === 0) {
      logger.warn(`getAnalyticsSummary | No data found | user: ${req.user.id} | platform: ${req.params.platformId}`);
      return res.status(404).json({ success: false, message: "No analytics data found" });
    }

    const latest = analytics[analytics.length - 1];
    const previous = analytics.length > 1 ? analytics[analytics.length - 2] : null;

    const avgEngagement = analytics.reduce((sum, a) => sum + a.engagementRate, 0) / analytics.length;

    let engagementScore;
    if (avgEngagement >= 10) engagementScore = "Excellent";
    else if (avgEngagement >= 5) engagementScore = "Good";
    else if (avgEngagement >= 2) engagementScore = "Average";
    else engagementScore = "Poor";

    let weeklyGrowth = null;
    let trend = null;

    if (previous) {
      const prevEngagement = parseFloat(previous.engagementRate);

      weeklyGrowth = {
        viewsGrowth: previous.views > 0
          ? (((latest.views - previous.views) / previous.views) * 100).toFixed(2)
          : null,
        followersGrowth: previous.followers > 0
          ? (((latest.followers - previous.followers) / previous.followers) * 100).toFixed(2)
          : null,
        // BUG FIX: guard against previous engagementRate being 0 (division by zero)
        engagementGrowth: prevEngagement > 0
          ? (((latest.engagementRate - prevEngagement) / prevEngagement) * 100).toFixed(2)
          : null,
      };

      const viewsChange = latest.views - previous.views;
      const followersChange = latest.followers - previous.followers;

      if (viewsChange > 0 && followersChange > 0) trend = "Growing";
      else if (viewsChange < 0 && followersChange < 0) trend = "Declining";
      else trend = "Stable";
    }

    logger.info(`getAnalyticsSummary | Score: ${engagementScore} | Trend: ${trend} | user: ${req.user.id}`);
    res.json({
      success: true,
      latestFollowers: latest.followers,
      latestViews: latest.views,
      latestEngagementRate: latest.engagementRate,
      avgEngagementRate: avgEngagement.toFixed(2),
      engagementScore,
      weeklyGrowth,
      trend,
    });

  } catch (error) {
    logger.error(`getAnalyticsSummary | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── WEEKLY GROWTH % ────────────────────────────────────────────────────────────

exports.getWeeklyGrowth = async (req, res) => {
  try {
    logger.info(`getWeeklyGrowth | user: ${req.user.id} | platform: ${req.params.platformId}`);

    const analytics = await Analytics.find({
      userId: req.user.id,
      platformId: req.params.platformId,
    }).sort({ date: 1 });

    if (analytics.length < 2) {
      logger.warn(`getWeeklyGrowth | Not enough data | user: ${req.user.id} | records: ${analytics.length}`);
      return res.status(400).json({ success: false, message: "Not enough data to calculate growth" });
    }

    const latest = analytics[analytics.length - 1];
    const previous = analytics[analytics.length - 2];
    const prevEngagement = parseFloat(previous.engagementRate);

    const growth = {
      success: true,
      // BUG FIX: guard all three denominators against zero
      viewsGrowth: previous.views > 0
        ? (((latest.views - previous.views) / previous.views) * 100).toFixed(2)
        : null,
      followersGrowth: previous.followers > 0
        ? (((latest.followers - previous.followers) / previous.followers) * 100).toFixed(2)
        : null,
      engagementGrowth: prevEngagement > 0
        ? (((latest.engagementRate - prevEngagement) / prevEngagement) * 100).toFixed(2)
        : null,
    };

    logger.info(`getWeeklyGrowth | viewsGrowth: ${growth.viewsGrowth}% | followersGrowth: ${growth.followersGrowth}% | user: ${req.user.id}`);
    res.json(growth);

  } catch (error) {
    logger.error(`getWeeklyGrowth | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ENGAGEMENT SCORE ───────────────────────────────────────────────────────────

exports.getEngagementScore = async (req, res) => {
  try {
    logger.info(`getEngagementScore | user: ${req.user.id} | platform: ${req.params.platformId}`);

    const analytics = await Analytics.find({
      userId: req.user.id,
      platformId: req.params.platformId,
    });

    if (analytics.length === 0) {
      logger.warn(`getEngagementScore | No data found | user: ${req.user.id} | platform: ${req.params.platformId}`);
      return res.status(404).json({ success: false, message: "No data found" });
    }

    const avgEngagement = analytics.reduce((sum, a) => sum + a.engagementRate, 0) / analytics.length;

    let score;
    if (avgEngagement >= 10) score = "Excellent";
    else if (avgEngagement >= 5) score = "Good";
    else if (avgEngagement >= 2) score = "Average";
    else score = "Poor";

    logger.info(`getEngagementScore | avg: ${avgEngagement.toFixed(2)}% | score: ${score} | user: ${req.user.id}`);
    res.json({ success: true, avgEngagementRate: avgEngagement.toFixed(2), score });

  } catch (error) {
    logger.error(`getEngagementScore | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── TREND CLASSIFICATION ───────────────────────────────────────────────────────

exports.getTrend = async (req, res) => {
  try {
    logger.info(`getTrend | user: ${req.user.id} | platform: ${req.params.platformId}`);

    const analytics = await Analytics.find({
      userId: req.user.id,
      platformId: req.params.platformId,
    }).sort({ date: 1 });

    if (analytics.length < 2) {
      logger.warn(`getTrend | Not enough data | user: ${req.user.id} | records: ${analytics.length}`);
      return res.status(400).json({ success: false, message: "Not enough data to classify trend" });
    }

    const latest = analytics[analytics.length - 1];
    const previous = analytics[analytics.length - 2];

    const viewsChange = latest.views - previous.views;
    const followersChange = latest.followers - previous.followers;

    let trend;
    if (viewsChange > 0 && followersChange > 0) trend = "Growing";
    else if (viewsChange < 0 && followersChange < 0) trend = "Declining";
    else trend = "Stable";

    logger.info(`getTrend | trend: ${trend} | viewsChange: ${viewsChange} | followersChange: ${followersChange} | user: ${req.user.id}`);
    res.json({ success: true, trend, viewsChange, followersChange });

  } catch (error) {
    logger.error(`getTrend | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};