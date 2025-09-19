const express = require("express");
const { db } = require("../firebase");

const router = express.Router();

// POST /api/ngo/register
router.post("/register", async (req, res) => {
  try {
    const { org_name, contact_person, phone, email, district, password } = req.body || {};
    if (!org_name || !phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const docRef = db.collection("ngos").doc(String(phone));
    await docRef.set({ org_name, contact_person, phone, email, district, password, createdAt: new Date().toISOString() }, { merge: true });
    return res.status(201).json({ message: "NGO registered" });
  } catch (e) {
    console.error("/api/ngo/register error", e);
    return res.status(500).json({ message: "Failed to register NGO" });
  }
});

// POST /api/ngo/login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) return res.status(400).json({ message: "Missing credentials" });

    const ngosRef = db.collection("ngos");
    const snap = await ngosRef.get();
    let user = null;
    snap.forEach(d => {
      const v = d.data();
      if ((v.phone === identifier || v.email === identifier) && v.password === password) user = v;
    });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const token = "ngo-" + (user.phone || user.email);
    return res.json({ token, ngo_id: user.phone, org_name: user.org_name || "NGO" });
  } catch (e) {
    console.error("/api/ngo/login error", e);
    return res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
