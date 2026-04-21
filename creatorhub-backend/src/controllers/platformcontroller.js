const Platform = require("../models/platform");
const logger = require("../utils/logger");

// Add Platform
exports.addPlatform = async (req, res) => {
  try {
    const { platformName, handle } = req.body;

    logger.info(`addPlatform | user: ${req.user.id} | platform: ${platformName}`);

    const existingPlatform = await Platform.findOne({
      userId: req.user.id,
      platformName,
    });

    if (existingPlatform) {
      logger.warn(`addPlatform | Duplicate platform | user: ${req.user.id} | platform: ${platformName}`);
      return res.status(400).json({ message: "Platform already added" });
    }

    const platform = await Platform.create({
      userId: req.user.id,
      platformName,
      handle,
    });

    logger.info(`addPlatform | Created | id: ${platform._id} | user: ${req.user.id}`);
    res.status(201).json({
      message: "Platform added successfully",
      platform,
    });
  } catch (error) {
    logger.error(`addPlatform | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Platforms
exports.getPlatforms = async (req, res) => {
  try {
    logger.info(`getPlatforms | user: ${req.user.id}`);

    const platforms = await Platform.find({ userId: req.user.id });

    logger.info(`getPlatforms | Returned ${platforms.length} platforms | user: ${req.user.id}`);
    res.json(platforms);
  } catch (error) {
    logger.error(`getPlatforms | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Platform
exports.deletePlatform = async (req, res) => {
  try {
    logger.info(`deletePlatform | user: ${req.user.id} | id: ${req.params.id}`);

    const platform = await Platform.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!platform) {
      logger.warn(`deletePlatform | Not found | user: ${req.user.id} | id: ${req.params.id}`);
      return res.status(404).json({ message: "Platform not found" });
    }

    logger.info(`deletePlatform | Deleted | id: ${req.params.id} | user: ${req.user.id}`);
    res.json({ message: "Platform deleted successfully" });
  } catch (error) {
    logger.error(`deletePlatform | Unexpected error | user: ${req.user.id}`, error);
    res.status(500).json({ message: error.message });
  }
};