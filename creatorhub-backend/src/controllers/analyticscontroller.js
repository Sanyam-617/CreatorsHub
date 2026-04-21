const Analytics = require("../models/analytics");
const logger = require("../utils/logger");

// ─── ADD ANALYTICS ENTRY ────────────────────────────────────────────────────────

exports.addAnalytics = async (req, res) => {
  try {
    const { platformId, date, views, likes, comments, shares, followers, reach, impressions } = req.body;

    logger.info(`addAnalytics | user: ${req.user.id} | platform: ${platformId} | date: ${date}`);

    if (!platformId || !date || views === undefined || likes === undefined || comments === undefined || shares === undefined || followers === undefined) {
      logger.warn(`addAnalytics | Missing required fields | user: ${req.user.id}`);
      return res.status(400).json({ success: false, message: "Please provide all required fields: platformId, date, views, likes, comments, shares, followers" });
    }

    if (views < 0 || likes < 0 || comments < 0 || shares < 0 || followers < 0) {
      logger.warn(`addAnalytics | Negative values detected | user: ${req.user.id} | platform: ${platformId}`);
      return res.status(400).json({ success: false, message: "Analytics values cannot be negative" });
    }

    if (followers === 0) {
      logger.warn(`addAnalytics | Followers is zero | user: ${req.user.id} | platform: ${platformId}`);
      return res.status(400).json({ success: false, message: "Followers must be greater than 0" });
    }

    if (new Date(date) > new Date()) {
      logger.warn(`addAnalytics | Future date rejected | user: ${req.user.id} | date: ${date}`);
      return res.status(400).json({ success: false, message: "Date cannot be in the future" });
    }

    const existing = await Analytics.findOne({
      userId: req.user.id,
      platformId,
      date: new Date(date),
    });

    if (existing) {
      logger.warn(`addAnalytics | Duplicate entry | user: ${req.user.id} | platform: ${platformId} | date: ${date}`);
      return res.status(400).json({ success: false, message: "Analytics entry already exists for this date and platform" });
    }

    const engagementRate = views > 0 ? (((likes + comments + shares) / views) * 100).toFixed(2) : 0;

    const analytics = await Analytics.create({
      userId: req.user.id,
      platformId,
      uploadId: null,
      date,
      views,
      likes,
      comments,
      shares,
      followers,
      reach: reach || 0,
      impressions: impressions || 0,
      engagementRate,
    });

    logger.info(`addAnalytics | Entry created | id: ${analytics._id} | engagementRate: ${engagementRate}%`);
    res.status(201).json({ success: true, message: "Analytics entry added successfully", analytics });

  } catch (error) {
    if (error.code === 11000) {
      logger.warn(`addAnalytics | Duplicate key error | user: ${req.user.id} | platform: ${req.body.platformId}`);
      return res.status(400).json({ success: false, message: "Entry for this date already exists for this platform" });
    }
    logger.error(`addAnalytics | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ANALYTICS BY PLATFORM ──────────────────────────────────────────────────

exports.getAnalytics = async (req, res) => {
  try {
    logger.info(`getAnalytics | user: ${req.user.id} | platform: ${req.params.platformId}`);

    const analytics = await Analytics.find({
      userId: req.user.id,
      platformId: req.params.platformId,
    }).sort({ date: 1 });

    logger.info(`getAnalytics | Returned ${analytics.length} records | user: ${req.user.id}`);
    res.json({ success: true, analytics });

  } catch (error) {
    logger.error(`getAnalytics | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE ANALYTICS BY UPLOAD ─────────────────────────────────────────────────

exports.deleteAnalytics = async (req, res) => {
  try {
    logger.info(`deleteAnalytics | user: ${req.user.id} | uploadId: ${req.params.uploadId}`);

    const result = await Analytics.deleteMany({
      userId: req.user.id,
      uploadId: req.params.uploadId,
    });

    logger.info(`deleteAnalytics | Deleted ${result.deletedCount} records | user: ${req.user.id}`);
    res.json({ success: true, message: "Analytics deleted successfully" });

  } catch (error) {
    logger.error(`deleteAnalytics | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};