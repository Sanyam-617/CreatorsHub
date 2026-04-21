const mongoose = require("mongoose");

const insightSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platformId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Platform",
      required: true,
    },
    insightText: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["warning", "positive", "suggestion"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Insight", insightSchema);