const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  health_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  aadhaar_number: { type: String, required: true },
  phone: { type: String, required: true },
  kms_id: { type: String, required: true },
  barcode_id: { type: String, required: true },
  dob: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Patient", patientSchema);