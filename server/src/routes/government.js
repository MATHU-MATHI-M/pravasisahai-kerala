const express = require("express");
const { db } = require("../firebase");

const router = express.Router();

// POST /api/government/register
router.post("/register", async (req, res) => {
  try {
    const { dept_name, officer_name, email, phone, district, password } = req.body || {};
    if (!dept_name || !email || !password) return res.status(400).json({ message: "Missing required fields" });
    await db.collection("governments").doc(String(email)).set({ dept_name, officer_name, email, phone, district, password, createdAt: new Date().toISOString() }, { merge: true });
    return res.status(201).json({ message: "Government account created" });
  } catch (e) {
    console.error("/api/government/register error", e);
    return res.status(500).json({ message: "Failed to register government" });
  }
});

// POST /api/government/login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) return res.status(400).json({ message: "Missing credentials" });
    const snap = await db.collection("governments").get();
    let user = null;
    snap.forEach(d => {
      const v = d.data();
      if ((v.email === identifier || v.phone === identifier) && v.password === password) user = v;
    });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const token = "gov-" + (user.email || user.phone);
    return res.json({ token, gov_id: user.email || user.phone, dept_name: user.dept_name || "Government" });
  } catch (e) {
    console.error("/api/government/login error", e);
    return res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
