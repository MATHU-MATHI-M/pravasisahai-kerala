const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const path = require("path");
const fs = require("fs");

let dataset = [];
try {
  const candidates = [
    path.resolve(__dirname, "../migrant_health_dataset.json"),
    path.resolve(__dirname, "../../migrant_health_dataset.json"),
    path.resolve(process.cwd(), "server/migrant_health_dataset.json"),
    path.resolve(process.cwd(), "migrant_health_dataset.json")
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (found) {
    dataset = require(found);
    console.log("✅ Fallback dataset loaded:", dataset.length, "records from", found);
  } else {
    console.warn("⚠️ No fallback dataset found");
  }
} catch (e) {
  console.warn("⚠️ Failed to load fallback dataset:", e.message);
}

router.post("/", async (req, res) => {
  try {
    const payload = req.body;

    const normalize = (v) => String(v || "").trim();
    const onlyDigits = (v) => normalize(v).replace(/\D+/g, "");

    const nameNorm = normalize(payload.name).toLowerCase();
    const aadhaarNorm = onlyDigits(payload.aadhaar_number);
    const phoneNorm = onlyDigits(payload.phone);
    const dobNorm = normalize(payload.dob);
    const kmsId = normalize(payload.kms_id);

    const col = db.collection("registeredUsers");

    // 1) If already registered
    try {
      const existingSnap = await col
        .where("aadhaar_number", "==", aadhaarNorm)
        .where("phone", "==", phoneNorm)
        .where("kms_id", "==", kmsId)
        .limit(10)
        .get();

      const existing = existingSnap?.docs
        ?.map((d) => ({ id: d.id, data: d.data() }))
        ?.find((d) => String(d.data?.name || "").trim().toLowerCase() === nameNorm);

      if (existing) {
        return res.status(409).json({
          status: "exists",
          message: "User already registered",
          health_id: existing.data.health_id || existing.id,
          barcode_id: existing.data.barcode_id || ""
        });
      }
    } catch (e) {
      console.warn("⚠️ Existing user check failed:", e.message);
    }

    // 2) Verify against govt records
    let verified = false;
    try {
      let records = [];
      try {
        const snapshot = await db.collection("migrant_health_records").get();
        records = snapshot.docs.map((doc) => doc.data());
      } catch {}
      if (!records.length) {
        try {
          const snap2 = await db.collection("aadhaar_records").get();
          records = snap2.docs.map((doc) => doc.data());
        } catch {}
      }
      if (!records.length) {
        records = Array.isArray(dataset) ? dataset : [];
      }
      const match = records.find((record) => {
        const rName = normalize(record.name).toLowerCase();
        const rAadhaar = onlyDigits(record.aadhaar_number);
        const rPhone = onlyDigits(record.phone);
        const rDob = normalize(record.dob);
        return (
          rAadhaar === aadhaarNorm &&
          rPhone === phoneNorm &&
          rDob === dobNorm &&
          rName === nameNorm
        );
      });
      verified = !!match;
    } catch {}

    // 3) Create new user
    const ts = Date.now();
    const health_id = "HID" + ts;
    const barcode_id = "BC" + ts + "XYZ";

    const insertPayload = {
      ...payload,
      name: normalize(payload.name),
      aadhaar_number: aadhaarNorm,
      phone: phoneNorm,
      dob: dobNorm,
      kms_id: kmsId,
      health_id,
      barcode_id,
      verified
    };

    try {
      await col.doc(health_id).set(insertPayload, { merge: true });
    } catch (e) {
      return res.status(500).json({ message: "Failed to save record", error: e.message });
    }

    res.json({
      status: "success",
      verified,
      health_id,
      barcode_id,
      token: "mock-token-" + health_id
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
