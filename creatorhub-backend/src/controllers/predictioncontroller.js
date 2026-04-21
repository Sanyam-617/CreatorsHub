const Analytics = require("../models/analytics");
const { linearRegression, calculateR2 } = require("../utils/regression");
const logger = require("../utils/logger");

// ─── PREDICT NEXT 4 WEEKS ───────────────────────────────────────────────────────

exports.getPrediction = async (req, res) => {
  try {
    logger.info(`getPrediction | user: ${req.user.id} | platform: ${req.params.platformId}`);

    const analytics = await Analytics.find({
      userId: req.user.id,
      platformId: req.params.platformId,
    }).sort({ date: 1 });

    if (analytics.length < 2) {
      logger.warn(`getPrediction | Not enough data | user: ${req.user.id} | records: ${analytics.length}`);
      return res.status(400).json({ success: false, message: "Not enough data to predict" });
    }

    const followerData = analytics.map((a) => a.followers);
    const viewsData = analytics.map((a) => a.views);

    const followerReg = linearRegression(followerData);
    const viewsReg = linearRegression(viewsData);

    const followerR2 = calculateR2(followerData, followerReg.slope, followerReg.intercept);
    const viewsR2 = calculateR2(viewsData, viewsReg.slope, viewsReg.intercept);

    const n = analytics.length;
    const predictions = [];

    for (let i = 1; i <= 4; i++) {
      predictions.push({
        week: `Week ${i}`,
        predictedFollowers: Math.round(followerReg.slope * (n + i - 1) + followerReg.intercept),
        predictedViews: Math.round(viewsReg.slope * (n + i - 1) + viewsReg.intercept),
      });
    }

    logger.info(`getPrediction | followerR2: ${followerR2} | viewsR2: ${viewsR2} | user: ${req.user.id}`);
    res.json({
      success: true,
      modelQuality: {
        followerR2,
        viewsR2,
        interpretation: followerR2 >= 0.8 ? "Strong fit" : followerR2 >= 0.5 ? "Moderate fit" : "Weak fit",
      },
      predictions,
    });

  } catch (error) {
    logger.error(`getPrediction | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── BACKTESTING ────────────────────────────────────────────────────────────────

exports.getBacktest = async (req, res) => {
  try {
    logger.info(`getBacktest | user: ${req.user.id} | platform: ${req.params.platformId}`);

    const analytics = await Analytics.find({
      userId: req.user.id,
      platformId: req.params.platformId,
    }).sort({ date: 1 });

    if (analytics.length < 3) {
      logger.warn(`getBacktest | Not enough data | user: ${req.user.id} | records: ${analytics.length}`);
      return res.status(400).json({ success: false, message: "Need at least 3 data points for backtesting" });
    }

    const trainData = analytics.slice(0, -1);
    const actual = analytics[analytics.length - 1];

    const followerTrain = trainData.map((a) => a.followers);
    const viewsTrain = trainData.map((a) => a.views);

    const followerReg = linearRegression(followerTrain);
    const viewsReg = linearRegression(viewsTrain);

    const n = trainData.length;
    const predictedFollowers = Math.round(followerReg.slope * n + followerReg.intercept);
    const predictedViews = Math.round(viewsReg.slope * n + viewsReg.intercept);

    const followerMAE = Math.abs(actual.followers - predictedFollowers);
    const viewsMAE = Math.abs(actual.views - predictedViews);

    const followerMAPE = ((followerMAE / actual.followers) * 100).toFixed(2);
    const viewsMAPE = ((viewsMAE / actual.views) * 100).toFixed(2);

    const followerAccuracy = (100 - followerMAPE).toFixed(2);
    const viewsAccuracy = (100 - viewsMAPE).toFixed(2);

    logger.info(`getBacktest | followerAccuracy: ${followerAccuracy}% | viewsAccuracy: ${viewsAccuracy}% | user: ${req.user.id}`);
    res.json({
      success: true,
      actual: { followers: actual.followers, views: actual.views, date: actual.date },
      predicted: { followers: predictedFollowers, views: predictedViews },
      error: {
        followerMAE,
        viewsMAE,
        followerAccuracy: `${followerAccuracy}%`,
        viewsAccuracy: `${viewsAccuracy}%`,
      },
    });

  } catch (error) {
    logger.error(`getBacktest | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};