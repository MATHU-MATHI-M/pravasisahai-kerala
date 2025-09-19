require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { db } = require("./firebase");

// Connect to MongoDB Atlas
const mongoURI = process.env.MONGO_URI || "mongodb+srv://sound123:sound123@migrant-disease-data.oux7bf7.mongodb.net/?retryWrites=true&w=majority&appName=Migrant-Disease-Data";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Connected to MongoDB Atlas");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Import routes
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const verifyRoute = require("./routes/verify");
const meRoute = require("./routes/me");

// ✅ New clinic/hospital routes
const clinicsHospitalsRoute = require("./routes/clinicsHospitals");

// Import routes
const patientsRoute = require("./routes/patients");
const diseasesRoute = require("./routes/diseases");
const ngoRoute = require("./routes/ngo");
const governmentRoute = require("./routes/government");
const employerRoute = require("./routes/employer");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure Firestore collections exist (idempotent)
(async function ensureCollections() {
  try {
    const now = new Date().toISOString();
    await db.collection("employers").doc("__meta").set({ initializedAt: now }, { merge: true });
    await db.collection("ngos").doc("__meta").set({ initializedAt: now }, { merge: true });
    await db.collection("governments").doc("__meta").set({ initializedAt: now }, { merge: true });
    await db.collection("camps").doc("__meta").set({ initializedAt: now }, { merge: true });
    await db.collection("ngo_scans").doc("__meta").set({ initializedAt: now }, { merge: true });
    await db.collection("government_scans").doc("__meta").set({ initializedAt: now }, { merge: true });
    await db.collection("notifications").doc("__meta").set({ initializedAt: now }, { merge: true });
    console.log("✅ Firestore collections ensured: employers, ngos, governments, camps, ngo_scans, government_scans, notifications");
  } catch (e) {
    console.warn("⚠️ Could not ensure Firestore collections:", e.message || e);
  }
})();

// Routes
app.use("/api/register", registerRoute);
app.use("/api/login", loginRoute);
app.use("/api/verify", verifyRoute);
app.use("/api/me", meRoute);

// ✅ Clinics/Hospitals routes
app.use("/api/clinics", clinicsHospitalsRoute);

// Patient routes
app.use("/api/patients", patientsRoute);

// Diseases routes
app.use("/api/diseases", diseasesRoute); // both /register and /login inside

// NGO, Government, Employer routes
app.use("/api/ngo", ngoRoute);
app.use("/api/government", governmentRoute);
app.use("/api/employer", employerRoute);

// Health check endpoint
app.get("/", (req, res) => {
  res.send("✅ Kerala Migrants API is running");
});
// server.js (add this endpoint)
app.get("/api/patients/:patient_id", async (req, res) => {
  const { patient_id } = req.params;
  try {
    const patient = await Patient.findOne({ patient_id });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching patient" });
  }
});


// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
