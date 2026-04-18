require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./db/db");
const feedbackRoutes = require("./routes/feedback.routes");

const app = express();

// Connect to Database
connectDB();

// Parse CORS origins from environment variable
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ["https://localhost:5173", "https://localhost:5174", "https://10.54.225.195:5173", "https://10.54.225.195:5174"];

// Middleware
app.use(express.json());
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(morgan("dev"));

// Routes
app.use("/", feedbackRoutes);

// Root Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Feedback Service OK" });
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Feedback Service running on port ${PORT}`);
});
