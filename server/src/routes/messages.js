import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";

const router = Router();

// send message
router.post("/", authGuard, async (req, res) => {
  const { toUsername, cipherText, nonce, ephPub, ttlSeconds = 0 } = req.body || {};
  const to = await User.findOne({ username: toUsername }).select("_id username");
  if (!to) return res.status(404).json({ error: "recipient not found" });

  const msg = await Message.create({ from: req.user._id, to: to._id, cipherText, nonce, ephPub, ttlSeconds });

  const io = req.app.get("io");
  io.to(to._id.toString()).emit("message:new", { id: msg._id, from: req.user.username });
  io.to(req.user._id.toString()).emit("message:sent", { id: msg._id });

  res.json({ id: msg._id });
});

// get inbox
router.get("/inbox", authGuard, async (req, res) => {
  const msgs = await Message.find({ to: req.user._id, seen: false }).sort({ createdAt: 1 }).lean();
  res.json({ messages: msgs });
});

// mark seen
router.post("/seen", authGuard, async (req, res) => {
  const { id } = req.body || {};
  const msg = await Message.findOne({ _id: id, to: req.user._id });
  if (!msg) return res.status(404).json({ error: "message not found" });

  msg.seen = true;
  msg.expiresAt = new Date(Date.now() + (msg.ttlSeconds > 0 ? msg.ttlSeconds : 5) * 1000);
  await msg.save();

  const io = req.app.get("io");
  io.to(msg.from.toString()).emit("message:seen", { id });

  res.json({ ok: true });
});

export default router;
