const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authmiddleware");
const { uploadCSV } = require("../controllers/uploadController");

// POST /api/upload/:platformId
// Field name: "file"
router.post("/:platformId", protect, upload.single("file"), uploadCSV);

module.exports = router;
