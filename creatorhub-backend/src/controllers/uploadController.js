const fs = require("fs");
const csv = require("csv-parser");
const logger = require("../utils/logger");
const Upload = require("../models/upload");
const Analytics = require("../models/analytics");
const Platform = require("../models/platform");

/** Safely delete the uploaded file if it still exists */
function cleanupFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    logger.error("File cleanup error", err);
  }
}

/**
 * Upload and parse CSV data into Analytics collection
 */
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { platformId } = req.params;
    const userId = req.user.id;

    // Verify platform belongs to authenticated user
    const platform = await Platform.findOne({ _id: platformId, userId });
    if (!platform) {
      cleanupFile(req.file.path);
      return res.status(403).json({ success: false, message: "Platform not found or unauthorized" });
    }

    // Parse mapping from frontend
    let mapping = {
      date: "date",
      views: "views",
      likes: "likes",
      comments: "comments",
      shares: "shares",
      followers: "followers"
    };
    
    if (req.body.mapping) {
      try {
        mapping = JSON.parse(req.body.mapping);
      } catch (error) {
        logger.error(`CSV Upload | Invalid mapping JSON | user: ${userId}`, error);
        cleanupFile(req.file.path);
        return res.status(400).json({ success: false, message: "Invalid mapping data" });
      }
    }

    // 1. Create a new Upload document
    const uploadDoc = await Upload.create({
      userId,
      platformId,
      fileName: req.file.originalname,
      status: "success",
    });

    const rows = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", async () => {
        try {
          const analyticsData = rows.map((row) => {
            // 2. Convert fields using dynamic mapping
            const views = Number(row[mapping.views]) || 0;
            const likes = Number(row[mapping.likes]) || 0;
            const comments = Number(row[mapping.comments]) || 0;
            const shares = Number(row[mapping.shares]) || 0;
            const followers = Number(row[mapping.followers]) || 0;

            // Calculate engagementRate for consistency
            const engagementRate = views > 0 ? (((likes + comments + shares) / views) * 100).toFixed(2) : 0;

            // 3. Prepare data for Analytics document
            return {
              userId,
              platformId,
              uploadId: uploadDoc._id,
              date: new Date(row[mapping.date]),
              views,
              likes,
              comments,
              shares,
              followers,
              engagementRate,
              reach: Number(row.reach) || 0,
              impressions: Number(row.impressions) || 0,
            };
          });

          // 4. Save each row to database
          let successCount = rows.length;
          let skippedCount = 0;

          try {
            // ordered: false allows continuing insertion even if some documents fail (e.g., duplicates)
            await Analytics.insertMany(analyticsData, { ordered: false });
          } catch (error) {
            if (error.code === 11000) {
              // Mongo duplicate key error
              skippedCount = error.writeErrors ? error.writeErrors.length : 1;
              successCount = rows.length - skippedCount;
              logger.warn(`CSV Upload | Duplicates skipped: ${skippedCount} | user: ${userId}`);
            } else {
              // Re-throw if it's not a duplicate key error
              throw error;
            }
          }

          logger.info(`CSV Upload | Saved ${successCount} rows | Skipped ${skippedCount} | user: ${userId} | uploadId: ${uploadDoc._id} | mapping: ${JSON.stringify(mapping)}`);
          
          // 5. Return success response
          res.status(200).json({
            success: true,
            message: skippedCount > 0 
              ? `CSV data saved (${successCount} new, ${skippedCount} skipped duplicates)`
              : "CSV data saved successfully",
            count: successCount,
            skipped: skippedCount,
          });
        } catch (error) {
          logger.error(`CSV Processing | Error | user: ${userId}`, error);
          res.status(500).json({ success: false, message: error.message });
        } finally {
          cleanupFile(req.file.path);
        }
      })
      .on("error", (error) => {
        cleanupFile(req.file.path);
        logger.error(`CSV Stream | Error | user: ${userId}`, error);
        res.status(500).json({ success: false, message: error.message });
      });
  } catch (error) {
    cleanupFile(req.file?.path);
    logger.error(`CSV Upload | Error | user: ${req.user.id}`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};
