require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require("cookie-parser");

const rideRoutes = require('./routes/ride.routes');
const setupSocket = require('./services/socket.service');
const connectToDb = require('./db/db');

connectToDb();

const app = express();
const server = http.createServer(app);

// Parse CORS origins from environment variable
const io = new Server(server, {
  cors: {
    origin: "*", // Internal communication or behind gateway
    credentials: true,
  },
});

app.use(cookieParser());
app.use(express.json());

// Debug: log cookies to confirm they're arriving
app.use((req, res, next) => {
  console.log("🍪 Ride Service cookies:", req.cookies);
  next();
});

app.set('io', io);
setupSocket(io);

app.use('/', rideRoutes);

const PORT = process.env.PORT || 3004;
server.listen(PORT, () => console.log(`🚕 Ride service running on port ${PORT}`));
