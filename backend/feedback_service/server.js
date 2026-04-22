require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const connectDB = require("./db/db");
const feedbackRoutes = require("./routes/feedback.routes");

const app = express();
app.use(express.json());

// Connect to Database
connectDB();

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
