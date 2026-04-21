const express = require("express");
const router = express.Router();
const { addAnalytics, getAnalytics, deleteAnalytics } = require("../controllers/analyticscontroller");
const { getAnalyticsSummary, getWeeklyGrowth, getEngagementScore, getTrend } = require("../controllers/summarycontroller");
const { getPrediction, getBacktest } = require("../controllers/predictioncontroller");
const protect = require("../middleware/authmiddleware");

router.post("/", protect, addAnalytics);
router.get("/:platformId", protect, getAnalytics);
router.get("/:platformId/summary", protect, getAnalyticsSummary);
router.get("/:platformId/growth", protect, getWeeklyGrowth);
router.get("/:platformId/engagement-score", protect, getEngagementScore);
router.get("/:platformId/trend", protect, getTrend);
router.get("/:platformId/predict", protect, getPrediction);
router.get("/:platformId/backtest", protect, getBacktest);
router.delete("/:uploadId", protect, deleteAnalytics);

module.exports = router;