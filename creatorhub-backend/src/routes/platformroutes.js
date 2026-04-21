const express = require("express");
const router = express.Router();
const {
  addPlatform,
  getPlatforms,
  deletePlatform,
} = require("../controllers/platformcontroller");
const protect = require("../middleware/authmiddleware");

router.post("/", protect, addPlatform);
router.get("/", protect, getPlatforms);
router.delete("/:id", protect, deletePlatform);

module.exports = router;