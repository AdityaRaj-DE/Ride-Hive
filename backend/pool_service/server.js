// server.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
// const connectToDb = require("./db/db");
const routes = require("./routes/routes");
const cookieParser = require('cookie-parser');

// connectToDb();

const app = express();

// Parse CORS origins from environment variable
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175"];

app.use(cors({
  origin: corsOrigins,
  credentials: true,                // allow cookies / JWT headers
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());
app.use(express.json());

app.get("/pool", (req, res) => res.send("💳 Pool Service running (dummy mode)"));
app.use("/pool", routes);

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => console.log(`💳 Pool Service running on port ${PORT}`));
