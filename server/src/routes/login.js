const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

router.post("/", async (req, res) => {
  try {
    const { health_id, aadhaar_number, phone, barcode_id } = req.body;
    console.log("📥 Login payload:", req.body);

    const normalize = (v) => String(v || "").trim();
    const onlyDigits = (v) => normalize(v).replace(/\D+/g, "");

    let user = null;

    // 1️⃣ Login by health_id only (fast QR login)
    if (health_id) {
      const hid = normalize(health_id);
      const snap = await db.collection("registeredUsers")
        .where("health_id", "==", hid)
        .limit(1)
        .get();
      if (!snap.empty) user = snap.docs[0].data();
    }

    // 2️⃣ Login by health_id + phone
    if (!user && health_id && phone) {
      const snap = await db.collection("registeredUsers")
        .where("health_id", "==", normalize(health_id))
        .where("phone", "==", onlyDigits(phone))
        .limit(1)
        .get();
      if (!snap.empty) user = snap.docs[0].data();
    }

    // 3️⃣ Login by Aadhaar + phone
    if (!user && aadhaar_number && phone) {
      const snap = await db.collection("registeredUsers")
        .where("aadhaar_number", "==", onlyDigits(aadhaar_number))
        .where("phone", "==", onlyDigits(phone))
        .limit(1)
        .get();
      if (!snap.empty) user = snap.docs[0].data();
    }

    // 4️⃣ Login by barcode_id
    if (!user && barcode_id) {
      const snap = await db.collection("registeredUsers")
        .where("barcode_id", "==", normalize(barcode_id))
        .limit(1)
        .get();
      if (!snap.empty) user = snap.docs[0].data();
    }

    if (!user) {
      console.warn("⚠️ Login failed, no user found");
      return res.status(401).json({ message: "Login failed" });
    }

    const token = "mock-token-" + user.health_id;
    console.log("✅ Login successful for:", user.health_id);

    return res.json({
      status: "success",
      health_id: user.health_id,
      token,
    });

  } catch (err) {
    console.error("❌ /login error:", err.message || err);
    return res.status(500).json({
      message: "Server error",
      error: err.message || String(err),
    });
  }
});

module.exports = router;
