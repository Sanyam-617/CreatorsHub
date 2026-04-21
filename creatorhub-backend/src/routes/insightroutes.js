const express = require("express");
const router = express.Router();
const {
  addInsight,
  getInsights,
  deleteInsight,
} = require("../controllers/insightcontroller");
const protect = require("../middleware/authmiddleware");

router.post("/", protect, addInsight);
router.get("/:platformId", protect, getInsights);
router.delete("/:id", protect, deleteInsight);

module.exports = router;