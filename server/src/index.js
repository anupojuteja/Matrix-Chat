import "dotenv/config";
console.log("BOOT: index.js loaded");
console.log("ENV check — MONGO_URI present?", !!process.env.MONGO_URI);
console.log("ENV check — PORT:", process.env.PORT);

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import { connectDB } from "./config/db.js";
import { errorMiddleware } from "./utils/errors.js";

import authRoutes from "./routes/auth.js";
import keyRoutes from "./routes/keys.js";
import messageRoutes from "./routes/messages.js";
import { attachSignaling } from "./sockets/signaling.js";

const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const allowed = process.env.CORS_ORIGIN?.split(",") ?? [];
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    cb(null, allowed.includes(origin));
  },
  credentials: true
}));
app.options("*", cors());

app.get("/health", (req, res) => res.json({ ok: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/keys", keyRoutes);
app.use("/api/messages", messageRoutes);

app.use(errorMiddleware);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: allowed, credentials: true }
});
attachSignaling(io);
app.set("io", io);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ⛔️ DO NOT start server before DB is connected
(async () => {
  try {
    await connectDB(MONGO_URI);
    server.listen(PORT, () =>
      console.log(`🚀 Server listening on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Mongo connection failed:", err.message);
    process.exit(1);
  }
})();
