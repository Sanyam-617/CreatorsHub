const Analytics = require("../models/analytics");
const Platform = require("../models/platform");
const { linearRegression, calculateR2 } = require("../utils/regression");
const logger = require("../utils/logger");

// ─── SINGLE PLATFORM DASHBOARD ──────────────────────────────────────────────────

exports.getDashboardSummary = async (req, res) => {
  try {
    logger.info(`getDashboardSummary | user: ${req.user.id} | platform: ${req.params.platformId}`);

    const analytics = await Analytics.find({
      userId: req.user.id,
      platformId: req.params.platformId,
    }).sort({ date: 1 });

    if (analytics.length === 0) {
      logger.warn(`getDashboardSummary | No data found | user: ${req.user.id} | platform: ${req.params.platformId}`);
      return res.status(404).json({ success: false, message: "No analytics data found for this platform" });
    }

    const latest = analytics[analytics.length - 1];
    const previous = analytics.length > 1 ? analytics[analytics.length - 2] : null;

    let weeklyGrowth = null;
    if (previous) {
      weeklyGrowth = {
        viewsGrowth: (((latest.views - previous.views) / previous.views) * 100).toFixed(2),
        followersGrowth: (((latest.followers - previous.followers) / previous.followers) * 100).toFixed(2),
        engagementGrowth: previous.engagementRate > 0
          ? Number((((latest.engagementRate - previous.engagementRate) / previous.engagementRate) * 100).toFixed(2))
          : null,
      };
    }

    const avgEngagement = analytics.reduce((sum, a) => sum + a.engagementRate, 0) / analytics.length;
    let engagementScore;
    if (avgEngagement >= 10) engagementScore = "Excellent";
    else if (avgEngagement >= 5) engagementScore = "Good";
    else if (avgEngagement >= 2) engagementScore = "Average";
    else engagementScore = "Poor";

    let trend = null;
    if (previous) {
      const viewsChange = latest.views - previous.views;
      const followersChange = latest.followers - previous.followers;
      if (viewsChange > 0 && followersChange > 0) trend = "Growing";
      else if (viewsChange < 0 && followersChange < 0) trend = "Declining";
      else trend = "Stable";
    }

    let prediction = null;
    if (analytics.length >= 2) {
      const followerData = analytics.map((a) => a.followers);
      const viewsData = analytics.map((a) => a.views);
      const followerReg = linearRegression(followerData);
      const viewsReg = linearRegression(viewsData);
      const followerR2 = calculateR2(followerData, followerReg.slope, followerReg.intercept);
      const n = analytics.length;
      prediction = {
        nextWeekFollowers: Math.round(followerReg.slope * n + followerReg.intercept),
        nextWeekViews: Math.round(viewsReg.slope * n + viewsReg.intercept),
        modelAccuracy: followerR2 >= 0.8 ? "Strong" : followerR2 >= 0.5 ? "Moderate" : "Weak",
        followerR2,
      };
    }

    let backtestAccuracy = null;
    if (analytics.length >= 3) {
      const trainData = analytics.slice(0, -1);
      const actual = analytics[analytics.length - 1];
      const followerTrain = trainData.map((a) => a.followers);
      const followerReg = linearRegression(followerTrain);
      const predictedFollowers = Math.round(followerReg.slope * trainData.length + followerReg.intercept);
      const followerMAE = Math.abs(actual.followers - predictedFollowers);
      const followerMAPE = (followerMAE / actual.followers) * 100;
      backtestAccuracy = `${(100 - followerMAPE).toFixed(2)}%`;
    }

    logger.info(`getDashboardSummary | Score: ${engagementScore} | Trend: ${trend} | user: ${req.user.id}`);

    res.json({
      success: true,
      overview: {
        latestFollowers: latest.followers,
        latestViews: latest.views,
        latestLikes: latest.likes,
        latestComments: latest.comments,
        latestShares: latest.shares,
        latestEngagementRate: latest.engagementRate,
        avgEngagementRate: avgEngagement.toFixed(2),
        dataPoints: analytics.length,
      },
      engagementScore,
      trend,
      weeklyGrowth,
      prediction,
      backtestAccuracy,
    });

  } catch (error) {
    logger.error(`getDashboardSummary | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── COMBINED OVERVIEW (ALL PLATFORMS) ──────────────────────────────────────────

exports.getCombinedOverview = async (req, res) => {
  try {
    logger.info(`getCombinedOverview | user: ${req.user.id}`);

    const platforms = await Platform.find({ userId: req.user.id });

    if (platforms.length === 0) {
      logger.warn(`getCombinedOverview | No platforms found | user: ${req.user.id}`);
      return res.status(404).json({ success: false, message: "No platforms found. Please add a platform first." });
    }

    let totalFollowers = 0;
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let engagementRates = [];
    let platformsData = [];
    let chartData = [];

    for (const platform of platforms) {
      const analytics = await Analytics.find({
        userId: req.user.id,
        platformId: platform._id,
      }).sort({ date: 1 });

      if (analytics.length === 0) continue;

      const latest = analytics[analytics.length - 1];
      const previous = analytics.length > 1 ? analytics[analytics.length - 2] : null;

      totalFollowers += latest.followers;
      totalViews += latest.views;
      totalLikes += latest.likes;
      totalComments += latest.comments;
      totalShares += latest.shares;
      engagementRates.push(parseFloat(latest.engagementRate));

      // growth for this platform
      let followersGrowth = null;
      let viewsGrowth = null;
      if (previous) {
        followersGrowth = (((latest.followers - previous.followers) / previous.followers) * 100).toFixed(2);
        viewsGrowth = (((latest.views - previous.views) / previous.views) * 100).toFixed(2);
      }

      platformsData.push({
        platformId: platform._id,
        platformName: platform.platformName,
        handle: platform.handle,
        latestFollowers: latest.followers,
        latestViews: latest.views,
        latestLikes: latest.likes,
        latestComments: latest.comments,
        latestEngagementRate: latest.engagementRate,
        followersGrowth,
        viewsGrowth,
        dataPoints: analytics.length,
      });

      // chart data — followers over time for each platform
      analytics.forEach((entry) => {
        chartData.push({
          date: entry.date,
          platform: platform.platformName,
          followers: entry.followers,
          views: entry.views,
        });
      });
    }

    if (platformsData.length === 0) {
      return res.status(404).json({ success: false, message: "No analytics data found. Please add analytics for your platforms." });
    }

    const avgEngagementRate = engagementRates.length > 0
      ? (engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length).toFixed(2)
      : 0;

    let engagementScore;
    if (avgEngagementRate >= 10) engagementScore = "Excellent";
    else if (avgEngagementRate >= 5) engagementScore = "Good";
    else if (avgEngagementRate >= 2) engagementScore = "Average";
    else engagementScore = "Poor";

    logger.info(`getCombinedOverview | platforms: ${platformsData.length} | totalFollowers: ${totalFollowers} | user: ${req.user.id}`);

    res.json({
      success: true,
      combined: {
        totalFollowers,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        avgEngagementRate,
        engagementScore,
        totalPlatforms: platformsData.length,
      },
      platforms: platformsData,
      chartData,
    });

  } catch (error) {
    logger.error(`getCombinedOverview | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};