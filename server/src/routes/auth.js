import { Router } from "express";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

function signToken(userId) {
  return jwt.sign({ uid: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "username & password required" });

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ error: "username taken" });

    const u = new User({ username, passwordHash: "x" });
    const salt = await bcrypt.genSalt(10);
    u.passwordHash = await bcrypt.hash(password, salt);
    await u.save();

    res.json({ token: signToken(u._id), user: { _id: u._id, username: u.username } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const u = await User.findOne({ username });
    if (!u) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ token: signToken(u._id), user: { _id: u._id, username: u.username } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
