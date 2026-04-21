const Insight = require("../models/insight");
const Platform = require("../models/platform");
const logger = require("../utils/logger");

// Generate Insight
exports.addInsight = async (req, res) => {
  try {
    const { platformId, insightText, type } = req.body;

    logger.info(`addInsight | user: ${req.user.id} | platform: ${platformId}`);

    // BUG FIX: verify the platform belongs to the requesting user before allowing insight creation
    const platform = await Platform.findOne({ _id: platformId, userId: req.user.id });
    if (!platform) {
      logger.warn(`addInsight | Platform not found or unauthorized | user: ${req.user.id} | platform: ${platformId}`);
      return res.status(404).json({ message: "Platform not found" });
    }

    const insight = await Insight.create({
      userId: req.user.id,
      platformId,
      insightText,
      type,
    });

    logger.info(`addInsight | Created | id: ${insight._id} | user: ${req.user.id}`);
    res.status(201).json({
      message: "Insight added successfully",
      insight,
    });
  } catch (error) {
    logger.error(`addInsight | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Insights by Platform
exports.getInsights = async (req, res) => {
  try {
    logger.info(`getInsights | user: ${req.user.id} | platform: ${req.params.platformId}`);

    const insights = await Insight.find({
      userId: req.user.id,
      platformId: req.params.platformId,
    }).sort({ createdAt: -1 });

    logger.info(`getInsights | Returned ${insights.length} records | user: ${req.user.id}`);
    res.json(insights);
  } catch (error) {
    logger.error(`getInsights | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Insight
exports.deleteInsight = async (req, res) => {
  try {
    logger.info(`deleteInsight | user: ${req.user.id} | id: ${req.params.id}`);

    const insight = await Insight.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!insight) {
      logger.warn(`deleteInsight | Not found | user: ${req.user.id} | id: ${req.params.id}`);
      return res.status(404).json({ message: "Insight not found" });
    }

    logger.info(`deleteInsight | Deleted | id: ${req.params.id} | user: ${req.user.id}`);
    res.json({ message: "Insight deleted successfully" });
  } catch (error) {
    logger.error(`deleteInsight | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ message: error.message });
  }
};