const express = require("express");
const { db } = require("../firebase");

const router = express.Router();

// POST /api/employer/register
router.post("/register", async (req, res) => {
  try {
    const { name, aadhar_number, phone, workplace, email, password } = req.body || {};
    if (!name || !phone || !password) return res.status(400).json({ message: "Missing required fields" });
    const docId = String(aadhar_number || phone);
    await db.collection("employers").doc(docId).set({ name, aadhar_number, phone, workplace, email, password, createdAt: new Date().toISOString() }, { merge: true });
    return res.status(201).json({ message: "Employer registered" });
  } catch (e) {
    console.error("/api/employer/register error", e);
    return res.status(500).json({ message: "Failed to register employer" });
  }
});

// POST /api/employer/login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) return res.status(400).json({ message: "Missing credentials" });
    const snap = await db.collection("employers").get();
    let user = null;
    snap.forEach(d => {
      const v = d.data();
      if ((v.aadhar_number === identifier || v.phone === identifier || v.email === identifier) && v.password === password) user = v;
    });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const employer_id = String(user.aadhar_number || user.phone);
    const token = "employer-" + employer_id;
    return res.json({ token, employer_id, name: user.name || "Employer" });
  } catch (e) {
    console.error("/api/employer/login error", e);
    return res.status(500).json({ message: "Login failed" });
  }
});

// GET /api/employer/:employerId/employees
router.get("/:employerId/employees", async (req, res) => {
  try {
    const { employerId } = req.params;
    const sub = await db.collection("employers").doc(String(employerId)).collection("employees").get();
    const list = sub.docs.map(d => ({ health_id: d.id, ...(d.data() || {}) }));
    return res.json(list);
  } catch (e) {
    console.error("GET employees error", e);
    return res.status(500).json({ message: "Failed to load employees" });
  }
});

// POST /api/employer/:employerId/employees { health_id }
router.post("/:employerId/employees", async (req, res) => {
  try {
    const { employerId } = req.params;
    const { health_id } = req.body || {};
    if (!health_id) return res.status(400).json({ message: "Missing health_id" });
    await db.collection("employers").doc(String(employerId)).collection("employees").doc(String(health_id).toUpperCase()).set({ addedAt: new Date().toISOString() }, { merge: true });
    return res.status(201).json({ message: "Employee added" });
  } catch (e) {
    console.error("POST employees error", e);
    return res.status(500).json({ message: "Failed to add employee" });
  }
});

// DELETE /api/employer/:employerId/employees/:healthId
router.delete("/:employerId/employees/:healthId", async (req, res) => {
  try {
    const { employerId, healthId } = req.params;
    await db.collection("employers").doc(String(employerId)).collection("employees").doc(String(healthId)).delete();
    return res.json({ message: "Employee removed" });
  } catch (e) {
    console.error("DELETE employee error", e);
    return res.status(500).json({ message: "Failed to remove employee" });
  }
});

// POST /api/employer/notify-severe { employer_id, health_id, district }
router.post("/notify-severe", async (req, res) => {
  try {
    const { employer_id, health_id, district } = req.body || {};
    if (!employer_id || !health_id) return res.status(400).json({ message: "Missing data" });
    await db.collection("notifications").add({
      type: "severe_alert",
      title: "Employee Severe Case",
      message: `Employee ${health_id} marked severe` ,
      employer_id,
      district: district || null,
      read: false,
      createdAt: new Date().toISOString()
    });
    return res.json({ message: "Notification queued" });
  } catch (e) {
    console.error("notify-severe error", e);
    return res.status(500).json({ message: "Failed to create notification" });
  }
});

module.exports = router;
