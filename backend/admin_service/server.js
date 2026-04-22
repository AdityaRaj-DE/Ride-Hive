require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});
app.use(express.json());
app.use(morgan("dev"));

// Attach IO to app so routes can use it
app.set("io", io);

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/ridehive_admin")
  .then(() => console.log("Admin Service DB Connected"))
  .catch((err) => console.error("Admin Service DB Connection Error:", err));

app.get("/health", (req, res) => res.json({ status: "UP", service: "Admin Service" }));

app.use("/", adminRoutes);

io.on("connection", (socket) => {
  console.log("Admin connected:", socket.id);
  socket.on("disconnect", () => console.log("Admin disconnected"));
});

const PORT = process.env.PORT || 3009;
server.listen(PORT, () => {
  console.log(`Admin Service running on port ${PORT}`);
});
