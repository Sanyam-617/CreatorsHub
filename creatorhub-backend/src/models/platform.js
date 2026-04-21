const mongoose = require("mongoose");

const platformSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platformName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    handle: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user cannot add the same platform twice
platformSchema.index({ userId: 1, platformName: 1 }, { unique: true });

module.exports = mongoose.model("Platform", platformSchema);