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
    console.error("Error saving patient case:", err);
    res.status(500).json({ error: "Failed to save patient record" });
  }
});

// Get all cases
router.get("/", async (req, res) => {
  try {
    const cases = await DiseaseCase.find();
    res.json(cases);
  } catch (err) {
    console.error("Error fetching patient cases:", err);
    res.status(500).json({ error: "Failed to fetch patient records" });
  }
});

module.exports = router;
