import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Scanner } from "@yudiel/react-qr-scanner";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import "./ClinicDashboard.css";

interface Hospital {
  hospital_id: string;
  name: string;
  type: string;
  district: string;
  address: string;
  contact: string;
}

const ClinicDashboard: React.FC = () => {
  const { hospital_id } = useParams<{ hospital_id: string }>();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [lastScan, setLastScan] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHospital = async () => {
      if (!hospital_id) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "clinicsHospital", hospital_id));
        if (snap.exists()) setHospital(snap.data() as Hospital);
        else console.error("Hospital not found");
      } catch (err) {
        console.error("Error fetching hospital:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospital();
  }, [hospital_id]);

  const handleScan = useCallback(
    (codes: IDetectedBarcode[]) => {
      if (!codes.length) return;
      const now = Date.now();
      if (now - lastScan < 1000) return;
      setLastScan(now);

      const patient_id = codes[0].rawValue.trim();
      if (patient_id) {
        navigate(`/patient-entry/${patient_id}`);
      }
    },
    [navigate, lastScan]
  );

  const handleError = (err: unknown) => {
    console.error("QR Scan Error:", err instanceof Error ? err.message : err);
  };

  if (loading) return <p>Loading hospital details...</p>;
  if (!hospital) return <p>Hospital not found</p>;

  return (
    <div className="clinic-dashboard">
      <h2>{hospital.name} Dashboard</h2>
      <p>Scan a patient QR code to enter records:</p>

      <div className="qr-scan-card">
        <Scanner
          onScan={handleScan}
          onError={handleError}
          styles={{ container: { width: "100%" }, video: { width: "100%" } }}
        />
      </div>
    </div>
  );
};

export default ClinicDashboard;
