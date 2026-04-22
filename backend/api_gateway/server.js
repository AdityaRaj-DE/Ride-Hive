require("dotenv").config();
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const cors = require("cors");

const setupSocket = require("./socket");
const setupProxies = require("./routes/proxy");

const app = express();
app.use(morgan("dev"));
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      "http://localhost:5173", "https://localhost:5173",
      "http://localhost:5174", "https://localhost:5174",
      "http://localhost:5175", "https://localhost:5175"
    ];

app.use(cors({
  origin: (origin, callback) => {
    console.log("🛠️ [Gateway CORS] Origin:", origin);
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("🚫 [Gateway CORS] Forbidden Origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

app.get("/", (_, res) => res.send("Gateway OK"));

setupProxies(app);

const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log("Gateway on", PORT));
