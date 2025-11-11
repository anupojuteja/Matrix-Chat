import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import { User } from "../models/User.js";

const router = Router();

// POST /api/keys/publish
router.post("/publish", authGuard, async (req, res) => {
  const { identityKey, signedPreKey, signature } = req.body || {};
  await User.findByIdAndUpdate(req.user._id, { e2ee: { identityKey, signedPreKey, signature } });
  res.json({ ok: true });
});

// GET /api/keys/public?username=alice
router.get("/public", async (req, res) => {
  const { username } = req.query;
  const u = await User.findOne({ username }).select("username e2ee");
  if (!u || !u.e2ee) return res.status(404).json({ error: "keys not found" });
  res.json({ username: u.username, ...u.e2ee });
});

export default router;
