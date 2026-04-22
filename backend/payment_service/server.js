// server.js
require('dotenv').config();
const express = require("express");
const connectToDb = require("./db/db");
const paymentRoutes = require("./routes/payment.routes");
const internalRoutes = require("./routes/internal.routes");
const cookieParser = require('cookie-parser');

connectToDb();

const app = express();
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => res.send("💳 Payment Service running (dummy mode)"));
app.use("/payments", paymentRoutes);
app.use("/internal", internalRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`💳 Payment Service running on port ${PORT}`));
