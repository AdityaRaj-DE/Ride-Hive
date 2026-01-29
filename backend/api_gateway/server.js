require("dotenv").config();
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const cors = require("cors");

const setupSocket = require("./socket");
const setupProxies = require("./routes/proxy");

const app = express();
app.use(morgan("dev"));
app.use(cors({ origin: true, credentials: true }));

app.get("/", (_, res) => res.send("Gateway OK"));

setupProxies(app);

const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Gateway on", PORT));
