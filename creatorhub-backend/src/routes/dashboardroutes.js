const express = require("express");
const router = express.Router();
const { getDashboardSummary, getCombinedOverview } = require("../controllers/dashboardcontroller");
const protect = require("../middleware/authmiddleware");

// GET /api/dashboard/overview — combined all platforms
router.get("/overview", protect, getCombinedOverview);

// GET /api/dashboard/:platformId — single platform
router.get("/:platformId", protect, getDashboardSummary);

module.exports = router;