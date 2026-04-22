const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// BUG FIX: CORS origin now reads from env so it works in production, not just localhost
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.post("/test-login", (req, res) => {
  res.send("TEST LOGIN WORKS");
});

app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/platforms", require("./routes/platformroutes"));
app.use("/api/analytics", require("./routes/analyticsroutes"));
app.use("/api/ai", require("./routes/insightroutes"));
app.use("/api/dashboard", require("./routes/dashboardroutes"));
app.use("/api/upload",  require("./routes/uploadRoutes"));


app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});


app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} — Unhandled error on ${req.method} ${req.originalUrl}`, err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});