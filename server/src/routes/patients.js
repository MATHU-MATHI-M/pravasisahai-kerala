const express = require("express");
const Patient = require("../models/Patient");

const router = express.Router();

// Get all patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get patient by health_id
router.get("/:health_id", async (req, res) => {
  try {
    const patient = await Patient.findOne({ health_id: req.params.health_id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new patient
router.post("/", async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    await newPatient.save();
    res.status(201).json({ message: "Patient record saved!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update patient
router.put("/:health_id", async (req, res) => {
  try {
    const updatedPatient = await Patient.findOneAndUpdate(
      { health_id: req.params.health_id },
      req.body,
      { new: true }
    );
    if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });
    res.json(updatedPatient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete patient
router.delete("/:health_id", async (req, res) => {
  try {
    const deletedPatient = await Patient.findOneAndDelete({ health_id: req.params.health_id });
    if (!deletedPatient) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Patient deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;