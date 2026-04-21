const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const Groq = require("groq-sdk");
const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: "Too many AI requests, please try again later." },
});

// POST /api/ai/insights
router.post("/insights", auth, aiLimiter, async (req, res) => {
  try {
    const { platformName, handle, summary, growth, analytics } = req.body;

    if (!platformName || !handle) {
      return res.status(400).json({
        success: false,
        message: "platformName and handle are required.",
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Groq API key is not configured on the server.",
      });
    }

    const groq = new Groq({ apiKey });

    const prompt = `You are a social-media analytics expert.
Analyse the following creator data and return ONLY raw JSON — no markdown, no code fences, no explanation.

Platform: ${platformName}
Handle: @${handle}
Summary: ${JSON.stringify(summary)}
Growth: ${JSON.stringify(growth)}
Recent analytics (last entries): ${JSON.stringify(
      Array.isArray(analytics) ? analytics.slice(-5) : []
    )}

Return exactly this JSON shape:
{
  "headline": "<one-liner performance summary>",
  "insights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "sentiment": "positive" | "neutral" | "negative"
}`;

    const result = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
    });

    let text = result.choices[0]?.message?.content || "";

    // Strip ```json ... ``` wrappers if present
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      logger.error("[AI] Failed to parse Groq response:", text);
      return res.status(502).json({
        success: false,
        message: "Groq returned invalid JSON. Please try again.",
      });
    }

    return res.json({ success: true, data: parsed });
  } catch (err) {
    logger.error("[AI] Groq API error:", err.message || err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate AI insights. Please try again later.",
    });
  }
});

module.exports = router;
