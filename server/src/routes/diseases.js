const express = require("express");
const DiseaseCase = require("../models/DiseaseCase");

const router = express.Router();

// Create new patient case
router.post("/", async (req, res) => {
  try {
    const newCase = new DiseaseCase(req.body);
    await newCase.save();
    res.status(201).json({ message: "Patient record saved!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save patient record" });
  }
});

// Get all cases
router.get("/", async (req, res) => {
  try {
    const cases = await DiseaseCase.find();
    res.json(cases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch disease cases" });
  }
});

// Get all disease cases for a patient by health_id
router.get("/:health_id", async (req, res) => {
  try {
    const cases = await DiseaseCase.find({ patient_id: req.params.health_id });
    res.json(cases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch disease cases" });
  }
});

module.exports = router;
