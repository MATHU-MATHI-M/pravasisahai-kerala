// src/pages/ClinicsHospitalsRegister.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import QRCode from "react-qr-code";
import "./Register.css";

interface ClinicHospitalForm {
  hospital_id?: string;
  name?: string;
  type?: string;
  district?: string;
  address?: string;
  contact?: string;
  bed_capacity?: number;
  monthly_capacity?: number;
  password?: string;
}

interface ApprovedEntry extends ClinicHospitalForm {
  id: string;
}

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
  "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad",
  "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

const HOSPITAL_TYPES = [
  "Community Health Center",
  "Primary Health Center",
  "Private Hospital",
  "District Hospital",
  "Government Hospital",
  "Medical College"
];

const ClinicsHospitalsRegister: React.FC = () => {
  const [form, setForm] = useState<ClinicHospitalForm>({});
  const [approved, setApproved] = useState<ApprovedEntry[]>([]);
  const [hospitalQR, setHospitalQR] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "bed_capacity" || name === "monthly_capacity" ? Number(value) : value,
    });
  };

  const fetchApproved = async () => {
    try {
      const snap = await getDocs(collection(db, "clinicsHospital"));
      const entries = snap.docs.map(d => ({ id: d.id, ...(d.data() as ClinicHospitalForm) }));
      setApproved(entries);
    } catch (err) {
      console.error("Error fetching approved entries:", err);
    }
  };

  useEffect(() => {
    fetchApproved();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const required = ["hospital_id", "name", "type", "district", "address", "contact", "bed_capacity", "monthly_capacity", "password"];
    for (const field of required) {
      if (!(form as any)[field]) {
        alert(`Missing ${field}`);
        return;
      }
    }

    try {
      const docId = form.hospital_id!;
      const exists = approved.find(a => a.hospital_id === docId);
      if (exists) {
        if (!window.confirm("Hospital ID already exists. Do you want to update it?")) return;
      }

      // Save to Firestore
      await setDoc(
        doc(db, "clinicsHospital", docId),
        {
          ...form,
          verified: true,
          registeredAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setHospitalQR(docId); // Use hospital_id as QR value
      setForm({});
      fetchApproved();
    } catch (err) {
      console.error("Error registering hospital:", err);
      alert("Registration failed!");
    }
  };

  return (
    <div className="register-container">
      <h2>Register Clinic / Hospital</h2>
       
      <form onSubmit={handleSubmit}>
        <input name="hospital_id" placeholder="Hospital ID" value={form.hospital_id || ""} onChange={handleChange} />
        <input name="name" placeholder="Hospital Name" value={form.name || ""} onChange={handleChange} />

        <select name="type" value={form.type || ""} onChange={handleChange}>
          <option value="">Select Type</option>
          {HOSPITAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select name="district" value={form.district || ""} onChange={handleChange}>
          <option value="">Select District</option>
          {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <input name="address" placeholder="Full Address" value={form.address || ""} onChange={handleChange} />
        <input name="contact" placeholder="Contact Number" value={form.contact || ""} onChange={handleChange} />
        <input type="number" name="bed_capacity" placeholder="Bed Capacity" value={form.bed_capacity || ""} onChange={handleChange} />
        <input type="number" name="monthly_capacity" placeholder="Monthly Capacity" value={form.monthly_capacity || ""} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" value={form.password || ""} onChange={handleChange} />

        <button type="submit">Register</button>
      </form>

      <p style={{ marginTop: '10px', textAlign: 'center' }}>
        Already registered? <Link to="/clinic-login">Login here</Link>
      </p>

      {hospitalQR && (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <h3>Registration Successful!</h3>
          <div style={{ width: 200, height: 200, margin: "0 auto", background: "#fff", padding: 8 }}>
            <QRCode value={hospitalQR} size={180} />
          </div>
          <p>Hospital ID: <strong>{hospitalQR}</strong></p>
          <button onClick={() => navigate("/clinic-dashboard")}>Go to Dashboard</button>
        </div>
      )}

      <h3 style={{ marginTop: 20 }}>Approved Clinics & Hospitals</h3>
      <div style={{ maxHeight: 400, overflowY: "auto", padding: 10, background: "#f9f9f9", borderRadius: 8 }}>
        {approved.length === 0 && <p>No approved entries yet.</p>}
        {approved.map(a => (
          <div key={a.id} style={{ marginBottom: 10, padding: 8, background: "#fff", borderRadius: 4, boxShadow: "0 0 4px rgba(0,0,0,0.1)" }}>
            <strong>{a.name}</strong> ({a.type})<br />
            Hospital ID: {a.hospital_id}<br />
            District: {a.district}<br />
            Address: {a.address}<br />
            Contact: {a.contact}<br />
            Beds: {a.bed_capacity}, Monthly Capacity: {a.monthly_capacity}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClinicsHospitalsRegister;
