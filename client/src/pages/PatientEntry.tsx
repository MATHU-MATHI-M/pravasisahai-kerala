import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./PatientEntry.css";

interface FormData {
  district: string;
  disease_name: string;
  disease_category: string;
  is_migrant_patient: boolean;
  severity: "Mild" | "Moderate" | "Severe";
  outcome: "Recovered" | "Ongoing" | "Deceased";
  water_risk: number;
  crowding_risk: number;
  overall_risk: number;
}

const districts = [
  "Thiruvananthapuram","Kollam","Pathanamthitta","Alappuzha",
  "Kottayam","Idukki","Ernakulam","Thrissur","Palakkad",
  "Malappuram","Kozhikode","Wayanad","Kannur","Kasaragod"
];

const PatientEntry: React.FC = () => {
  const { health_id } = useParams<{ health_id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    district: "",
    disease_name: "",
    disease_category: "",
    is_migrant_patient: false,
    severity: "Mild",
    outcome: "Recovered",
    water_risk: 0,
    crowding_risk: 0,
    overall_risk: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!health_id) {
      alert("Health ID missing in URL. Cannot save record.");
      return;
    }

    const newRecord = {
      patient_id: health_id, // use health_id as patient_id in backend
      admission_date: new Date().toISOString(),
      ...formData,
      district_risk_at_admission: {
        water_risk: Number(formData.water_risk),
        crowding_risk: Number(formData.crowding_risk),
        overall_risk: Number(formData.overall_risk),
      },
    };

    try {
      await axios.post("http://localhost:3001/api/diseases", newRecord);
      alert("✅ Record inserted successfully!");
      navigate(-1);
    } catch (err: any) {
      console.error("Error saving patient record:", err);
      alert("❌ Failed to save record!");
    }
  };

  return (
    <div className="patient-entry-container">
      <h2>Patient Entry</h2>
      <form className="patient-entry-form" onSubmit={handleSubmit}>
        <label>
          Health ID:
          <input
            type="text"
            name="health_id"
            value={health_id || ""}
            readOnly
            required
          />
        </label>
        <label>
          District:
          <select name="district" value={formData.district} onChange={handleChange} required>
            <option value="">Select District</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label>
          Disease Name:
          <input type="text" name="disease_name" value={formData.disease_name} onChange={handleChange} required />
        </label>
        <label>
          Disease Category:
          <select name="disease_category" value={formData.disease_category} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="water_borne">Water Borne</option>
            <option value="air_borne">Air Borne</option>
            <option value="vector_borne">Vector Borne</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Migrant Patient:
          <input type="checkbox" name="is_migrant_patient" checked={formData.is_migrant_patient} onChange={handleChange} />
        </label>
        <label>
          Severity:
          <select name="severity" value={formData.severity} onChange={handleChange}>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </label>
        <label>
          Outcome:
          <select name="outcome" value={formData.outcome} onChange={handleChange}>
            <option value="Recovered">Recovered</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Deceased">Deceased</option>
          </select>
        </label>
        <fieldset>
          <legend>District Risk at Admission</legend>
          <label>
            Water Risk:
            <input type="number" name="water_risk" value={formData.water_risk} onChange={handleChange} step="0.1" />
          </label>
          <label>
            Crowding Risk:
            <input type="number" name="crowding_risk" value={formData.crowding_risk} onChange={handleChange} step="0.1" />
          </label>
          <label>
            Overall Risk:
            <input type="number" name="overall_risk" value={formData.overall_risk} onChange={handleChange} step="0.1" />
          </label>
        </fieldset>
        <button type="submit" className="submit-btn">Save Case</button>
      </form>
    </div>
  );
};

export default PatientEntry;
