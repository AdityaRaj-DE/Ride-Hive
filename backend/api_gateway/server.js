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
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];

app.use(cors({ origin: corsOrigins, credentials: true }));

app.get("/", (_, res) => res.send("Gateway OK"));

setupProxies(app);

const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log("Gateway on", PORT));
