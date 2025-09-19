// routes/clinicsHospitals.js
const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const path = require("path");
const fs = require("fs");

// Load fallback dataset
let dataset = [];
try {
  const candidates = [
    path.resolve(__dirname, "../gov_clinics_hospitals.json"),
    path.resolve(__dirname, "../../gov_clinics_hospitals.json"),
    path.resolve(process.cwd(), "server/gov_clinics_hospitals.json"),
    path.resolve(process.cwd(), "gov_clinics_hospitals.json")
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (found) {
    dataset = require(found);
    console.log("✅ Clinics/Hospitals dataset loaded:", dataset.length, "records from", found);
  } else {
    console.warn("⚠️ No clinics/hospitals dataset found");
  }
} catch (e) {
  console.warn("⚠️ Failed to load dataset:", e.message);
}

// Utility
const normalize = (v) => String(v || "").trim().toLowerCase();

// 🔹 Register Clinic/Hospital
router.post("/register", async (req, res) => {
  try {
    const payload = req.body;
    const { name, type, govt_id, district, area, address, contact, password } = payload;

    if (!name || !type || !govt_id || !district || !area || !address || !contact || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const col = db.collection("clinicsHospitals");

    // 1️⃣ Check duplicates
    const existingSnap = await col.where("govt_id", "==", govt_id).limit(1).get();
    if (!existingSnap.empty) {
      return res.status(409).json({
        status: "exists",
        message: "Clinic/Hospital already registered",
        clinic_id: existingSnap.docs[0].id
      });
    }

    // 2️⃣ Verify against dataset
    const match = (Array.isArray(dataset) ? dataset : []).find((record) =>
      normalize(record.name) === normalize(name) &&
      normalize(record.type) === normalize(type) &&
      String(record.govt_id).trim() === String(govt_id).trim() &&
      normalize(record.district) === normalize(district) &&
      normalize(record.area) === normalize(area) &&
      normalize(record.address) === normalize(address) &&
      String(record.contact).trim() === String(contact).trim()
    );

    if (!match) {
      return res.status(403).json({ message: "Verification failed. Not found in govt records." });
    }

    // 3️⃣ Save to Firestore
    const ts = Date.now();
    const docId = `CLINIC-${govt_id}-${ts}`;
    const newClinic = { ...payload, verified: true, registeredAt: ts };

    await col.doc(docId).set(newClinic, { merge: true });

    res.json({
      status: "success",
      message: `${type} registered successfully`,
      clinic_id: docId,
      token: "mock-token-" + docId
    });

  } catch (err) {
    console.error("❌ /clinics/register error:", err.message || err);
    res.status(500).json({ message: "Server error", error: err.message || String(err) });
  }
});

// 🔹 Login Clinic/Hospital
router.post("/login", async (req, res) => {
  try {
    const { govt_id, password } = req.body;
    if (!govt_id || !password) {
      return res.status(400).json({ message: "govt_id and password required" });
    }

    const col = db.collection("clinicsHospitals");
    const snap = await col.where("govt_id", "==", govt_id).limit(1).get();

    if (snap.empty) {
      return res.status(404).json({ message: "Clinic/Hospital not registered" });
    }

    const docData = snap.docs[0].data();
    if (docData.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({
      status: "success",
      clinic_id: snap.docs[0].id,
      token: "mock-token-" + snap.docs[0].id,
      details: docData
    });

  } catch (err) {
    console.error("❌ /clinics/login error:", err.message || err);
    res.status(500).json({ message: "Login error", error: err.message || String(err) });
  }
});

module.exports = router;
