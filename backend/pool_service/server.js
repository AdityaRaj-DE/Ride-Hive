// server.js
require('dotenv').config();
const express = require("express");
const routes = require("./routes/routes");
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
app.use(express.json());

app.get("/pool", (req, res) => res.send("💳 Pool Service running (dummy mode)"));
app.use("/pool", routes);

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => console.log(`💳 Pool Service running on port ${PORT}`));
