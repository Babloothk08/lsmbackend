import express from "express";
import cors from "cors";
import dotenv, { config } from "dotenv";
import { Server } from "socket.io";
import http from "http";
import websiteRouter from "./routes/websiteLead.route.js";
import metaRoute from "./routes/metaLead.route.js";
import googleRoute from "./routes/googleLead.route.js";
import dashboardRoute from "./routes/dashboard.route.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Server started via GET request");
});

app.use("/api/websitelead", websiteRouter);
app.use("/api/metalead", metaRoute);
app.use("/api/googlelead", googleRoute);
app.use("/api/dashboard", dashboardRoute);

app.use("/", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

export { app, server, io };
