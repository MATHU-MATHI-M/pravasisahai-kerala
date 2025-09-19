const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
  case_id: String,
  patient_id: String,
  hospital_id: String,
  district: String,
  disease_name: String,
  disease_category: String,
  admission_date: Date,
  is_migrant_patient: Boolean,
  severity: String,
  outcome: String,
  district_risk_at_admission: {
    water_risk: Number,
    crowding_risk: Number,
    overall_risk: Number,
  },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("disease_case", caseSchema);
