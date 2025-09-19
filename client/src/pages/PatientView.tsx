import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface PatientData {
  patient_id: string;
  district: string;
  disease_name: string;
  disease_category: string;
  is_migrant_patient: boolean;
  severity: string;
  outcome: string;
  district_risk_at_admission: {
    water_risk: number;
    crowding_risk: number;
    overall_risk: number;
  };
  admission_date: string;
}

const PatientView: React.FC = () => {
  const { patient_id } = useParams<{ patient_id: string }>();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patient_id) return;
      try {
        const res = await axios.get(`http://localhost:3001/api/patients/${patient_id}`);
        setPatient(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch patient");
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [patient_id]);

  if (loading) return <p>Loading patient data...</p>;
  if (error) return <p>{error}</p>;
  if (!patient) return <p>No patient found</p>;

  return (
    <div>
      <h2>Patient Details - {patient.patient_id}</h2>
      <p><strong>District:</strong> {patient.district}</p>
      <p><strong>Disease Name:</strong> {patient.disease_name}</p>
      <p><strong>Category:</strong> {patient.disease_category}</p>
      <p><strong>Migrant Patient:</strong> {patient.is_migrant_patient ? "Yes" : "No"}</p>
      <p><strong>Severity:</strong> {patient.severity}</p>
      <p><strong>Outcome:</strong> {patient.outcome}</p>
      <h4>District Risk at Admission</h4>
      <p>Water Risk: {patient.district_risk_at_admission.water_risk}</p>
      <p>Crowding Risk: {patient.district_risk_at_admission.crowding_risk}</p>
      <p>Overall Risk: {patient.district_risk_at_admission.overall_risk}</p>
      <p><strong>Admission Date:</strong> {new Date(patient.admission_date).toLocaleString()}</p>
    </div>
  );
};

export default PatientView;
